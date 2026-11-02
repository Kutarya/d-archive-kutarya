"""Kutarya Us: sıfırdan eğitilmeye hazır, bayt tabanlı dil modeli.

Bu tek dosya yalnız model mimarisini tanımlar. Eğitim verisi, veri yükleyici,
eğitim döngüsü, optimizer veya hazır/eğitilmiş ağırlık içermez. Yeni bir modelin
ağırlıkları rastgele başlatılır; anlamlı metin üretmesi için ayrıca eğitilmelidir.

Gereksinim: Python 3.10+ ve PyTorch.
Oluşturma: model = KutaryaUs(KutaryaUsConfig())
Kullanım: logits, loss = model(x, targets)

x: [batch, uzunluk] biçiminde torch.long; UTF-8 bayt kimlikleri 0..255.
targets: aynı biçimde, her konum için SONRAKİ baytın kimliği. Hedeflerin bir
konum kaydırılması ilerideki eğitim kodunun sorumluluğudur. -100 olan hedefler
loss hesabına katılmaz; targets verilmezse loss None döner.
logits: [batch, uzunluk, 256]; sonraki bayt için logits[:, -1, :] kullanılır.
Uzunluk 1..context_size olabilir; context_size karakter değil bayt sayısıdır.
"""

from dataclasses import dataclass
import math

import torch
import torch.nn as nn
import torch.nn.functional as F


@dataclass(frozen=True)
class KutaryaUsConfig:
    """Modelin boyutları; eğitim başlamadan önce değiştirilebilir."""

    context_size: int = 1024
    embedding_dim: int = 256
    num_heads: int = 8
    num_layers: int = 6
    ffn_multiplier: int = 4
    dropout: float = 0.1

    def __post_init__(self) -> None:
        for name in (
            "context_size",
            "embedding_dim",
            "num_heads",
            "num_layers",
            "ffn_multiplier",
        ):
            value = getattr(self, name)
            if isinstance(value, bool) or not isinstance(value, int) or value < 1:
                raise ValueError(f"{name} pozitif bir tam sayı olmalı.")
        if self.embedding_dim % self.num_heads != 0:
            raise ValueError("embedding_dim, num_heads değerine tam bölünmeli.")
        if not 0.0 <= self.dropout < 1.0:
            raise ValueError("dropout 0 dahil, 1 hariç aralıkta olmalı.")


class _CausalSelfAttention(nn.Module):
    """Her konum yalnız kendisini ve önceki konumları görebilir."""

    def __init__(self, config: KutaryaUsConfig) -> None:
        super().__init__()
        self.num_heads = config.num_heads
        self.head_dim = config.embedding_dim // config.num_heads
        self.attention_dropout = config.dropout
        self.qkv = nn.Linear(config.embedding_dim, 3 * config.embedding_dim, bias=False)
        self.projection = nn.Linear(config.embedding_dim, config.embedding_dim, bias=False)
        self.residual_dropout = nn.Dropout(config.dropout)

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        batch, length, width = x.shape
        q, k, v = self.qkv(x).chunk(3, dim=-1)
        q = q.reshape(batch, length, self.num_heads, self.head_dim).transpose(1, 2)
        k = k.reshape(batch, length, self.num_heads, self.head_dim).transpose(1, 2)
        v = v.reshape(batch, length, self.num_heads, self.head_dim).transpose(1, 2)

        # PyTorch ölçeklemeyi ve geleceği kapatan maskeyi kendisi uygular.
        # Bu API eval durumunu otomatik okumaz; dropout açıkça sıfırlanır.
        attended = F.scaled_dot_product_attention(
            q,
            k,
            v,
            dropout_p=self.attention_dropout if self.training else 0.0,
            is_causal=True,
        )
        attended = attended.transpose(1, 2).contiguous().view(batch, length, width)
        return self.residual_dropout(self.projection(attended))


class _FeedForward(nn.Module):
    """Her konumdaki temsili genişletir, işler ve yeniden daraltır."""

    def __init__(self, config: KutaryaUsConfig) -> None:
        super().__init__()
        hidden_dim = config.embedding_dim * config.ffn_multiplier
        self.expand = nn.Linear(config.embedding_dim, hidden_dim, bias=False)
        self.activation = nn.GELU()
        self.projection = nn.Linear(hidden_dim, config.embedding_dim, bias=False)
        self.dropout = nn.Dropout(config.dropout)

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        return self.dropout(self.projection(self.activation(self.expand(x))))


class _TransformerBlock(nn.Module):
    """Ön normalizasyon ve artık bağlantılar içeren decoder katmanı."""

    def __init__(self, config: KutaryaUsConfig) -> None:
        super().__init__()
        self.attention_norm = nn.LayerNorm(config.embedding_dim)
        self.attention = _CausalSelfAttention(config)
        self.feed_forward_norm = nn.LayerNorm(config.embedding_dim)
        self.feed_forward = _FeedForward(config)

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        x = x + self.attention(self.attention_norm(x))
        return x + self.feed_forward(self.feed_forward_norm(x))


class KutaryaUs(nn.Module):
    """Eğitilmemiş, çok katmanlı otoregresif Transformer beyni."""

    vocab_size = 256

    def __init__(self, config: KutaryaUsConfig | None = None) -> None:
        super().__init__()
        self.config = config if config is not None else KutaryaUsConfig()
        self.embedding = nn.Embedding(self.vocab_size, self.config.embedding_dim)
        self.position_embedding = nn.Embedding(
            self.config.context_size, self.config.embedding_dim
        )
        self.embedding_dropout = nn.Dropout(self.config.dropout)
        self.blocks = nn.ModuleList(
            _TransformerBlock(self.config) for _ in range(self.config.num_layers)
        )
        self.final_norm = nn.LayerNorm(self.config.embedding_dim)
        self.KTYcevap = nn.Linear(self.config.embedding_dim, self.vocab_size, bias=False)

        self.apply(self._initialize_weights)
        # Giriş ve çıkış aynı öğrenilebilir sözlük ağırlığını paylaşır.
        self.KTYcevap.weight = self.embedding.weight

        # Derinlik arttığında artık bağlantıların başlangıç ölçeğini küçültür.
        residual_std = 0.02 / math.sqrt(2 * self.config.num_layers)
        for block in self.blocks:
            nn.init.normal_(block.attention.projection.weight, std=residual_std)
            nn.init.normal_(block.feed_forward.projection.weight, std=residual_std)

    @staticmethod
    def _initialize_weights(module: nn.Module) -> None:
        if isinstance(module, (nn.Linear, nn.Embedding)):
            nn.init.normal_(module.weight, mean=0.0, std=0.02)
            if isinstance(module, nn.Linear) and module.bias is not None:
                nn.init.zeros_(module.bias)

    def forward(
        self, x: torch.Tensor, targets: torch.Tensor | None = None
    ) -> tuple[torch.Tensor, torch.Tensor | None]:
        """Tüm konumların tahmin skorlarını ve isteğe bağlı loss'u döndürür."""
        if x.ndim != 2 or x.shape[0] == 0:
            raise ValueError("x, boş olmayan [batch, uzunluk] biçiminde olmalı.")
        if x.dtype != torch.long:
            raise TypeError("x için torch.long kullan.")
        length = x.shape[1]
        if not 1 <= length <= self.config.context_size:
            raise ValueError(
                f"Girdi uzunluğu 1..{self.config.context_size} bayt arasında olmalı."
            )
        if targets is not None:
            if targets.shape != x.shape:
                raise ValueError("targets, x ile aynı [batch, uzunluk] biçiminde olmalı.")
            if targets.dtype != torch.long:
                raise TypeError("targets için torch.long kullan.")
            if targets.device != x.device:
                raise ValueError("x ve targets aynı cihazda olmalı.")

        positions = torch.arange(length, device=x.device)
        hidden = self.embedding_dropout(
            self.embedding(x) + self.position_embedding(positions)
        )
        for block in self.blocks:
            hidden = block(hidden)
        logits = self.KTYcevap(self.final_norm(hidden))

        loss = None
        if targets is not None:
            # float(), karma hassasiyetle kullanımda loss hesabını FP32'de tutar.
            # Tüm hedefler -100 ise NaN yerine sıfır loss ve sıfır gradyan döner.
            loss_sum = F.cross_entropy(
                logits.reshape(-1, self.vocab_size).float(),
                targets.reshape(-1),
                ignore_index=-100,
                reduction="sum",
            )
            loss = loss_sum / (targets != -100).sum().clamp_min(1)
        return logits, loss

    def parametre_sayisi(self) -> int:
        """Paylaşılan ağırlıkları iki kez saymadan toplamı verir."""
        return sum(parameter.numel() for parameter in self.parameters())


if __name__ == "__main__":
    # Yalnız mimariyi oluşturur ve bilgisini gösterir; eğitim başlatmaz.
    model = KutaryaUs()
    print("Kutarya Us — eğitilmemiş model beyni")
    print(f"Katman: {model.config.num_layers}")
    print(f"Dikkat başlığı: {model.config.num_heads}")
    print(f"Embedding boyutu: {model.config.embedding_dim}")
    print(f"Bağlam: {model.config.context_size} bayt")
    print(f"Toplam parametre: {model.parametre_sayisi():,}")
