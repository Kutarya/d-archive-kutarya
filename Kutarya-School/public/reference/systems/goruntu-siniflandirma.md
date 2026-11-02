---
title: "Hazır modelle görüntü sınıflandırma servisi"
type: "system-guide"
canonical: "https://kutarya.com/sistemler/goruntu-siniflandirma"
publisher: "Kutarya"
language: "tr-TR"
category: "Yapay zeka"
---

# Hazır modelle görüntü sınıflandırma servisi

Model eğitmeden hazır ağırlığı yükleyen, girdiyi doğrulayan ve tahmin sonucunu HTTP üzerinden döndüren Python servisi.

**Kategori:** Yapay zeka
**Teknoloji yığını:** Python, PyTorch, FastAPI
**Seviye:** Orta
**Okuma süresi:** 24 dk

## Sonuç

Yüklenen görseli doğrulayıp en olası sınıfları güven skoruyla döndüren küçük çıkarım API’si.

## Ön koşullar

- Python 3.11
- En az 2 GB boş disk
- İlk model indirmesi için internet

## Dosya ağacı

```text
image_api/
  app.py
  inference.py
```

## Kurulum

python -m venv .venv
.venv\Scripts\activate
python -m pip install fastapi uvicorn python-multipart pillow torch torchvision
uvicorn app:app --reload

## app.py

HTTP katmanı yükleme boyutunu ve görsel biçimini doğrular. Tahmin kodu ayrı modülde kaldığı için API testi model ayrıntısından ayrılabilir.


```python
from io import BytesIO
from fastapi import FastAPI, File, HTTPException, UploadFile
from PIL import Image, UnidentifiedImageError
from inference import predict

app = FastAPI()
MAX_BYTES = 5 * 1024 * 1024

@app.get("/health")
def health():
    return {"status": "ready"}

@app.post("/predict")
async def classify(file: UploadFile = File(...)):
    if file.content_type not in {"image/jpeg", "image/png", "image/webp"}:
        raise HTTPException(400, "JPEG, PNG veya WebP yükle.")
    data = await file.read(MAX_BYTES + 1)
    if len(data) > MAX_BYTES:
        raise HTTPException(413, "Görsel 5 MB sınırını aşıyor.")
    try:
        image = Image.open(BytesIO(data))
        image.verify()
        image = Image.open(BytesIO(data))
    except UnidentifiedImageError as error:
        raise HTTPException(400, "Geçerli görsel değil.") from error
    return {"predictions": predict(image)}
```

## inference.py

Ağırlıklar bir kez yüklenir. inference_mode gradyan hesabını kapatır; softmax skorları kullanıcıya olasılık benzeri değerler verir.


```python
import torch
from PIL import Image
from torchvision.models import ResNet18_Weights, resnet18

weights = ResNet18_Weights.DEFAULT
model = resnet18(weights=weights).eval()
preprocess = weights.transforms()
labels = weights.meta["categories"]

def predict(image: Image.Image, count: int = 3):
    tensor = preprocess(image.convert("RGB")).unsqueeze(0)
    with torch.inference_mode():
        scores = model(tensor).softmax(dim=1)[0]
    values, indexes = scores.topk(count)
    return [
        {"label": labels[i], "score": round(float(v), 4)}
        for v, i in zip(values, indexes)
    ]
```

## Çalışma kontrolleri

1. İlk istekten sonra model yeniden yüklenmemeli
2. Görsel olmayan dosya 400 dönmeli
3. Çok büyük yükleme boyut sınırında reddedilmeli
4. CPU ortamında aynı örnek tutarlı sınıf sırası vermeli

## Hata ayıklama tablosu

| Belirti | Olası neden | Kontrol | Düzeltme |
| --- | --- | --- | --- |
| No module named torch | Paket farklı Python ortamına kuruldu. | python -c "import sys; print(sys.executable)" çalıştır. | Aynı yorumlayıcıyla python -m pip install torch kullan. |
| CUDA out of memory | Model veya toplu girdi GPU belleğine sığmıyor. | nvidia-smi ile süreç ve ayrılan belleği kontrol et. | CPU kullan veya batch boyutunu küçült. |
| Tahminler anlamsız | Girdi dönüşümü model ağırlığıyla eşleşmiyor. | Kullanılan weights ve transforms nesnesini kontrol et. | Ağırlığın kendi transforms zincirini kullan. |

## Genişletme noktaları

- Dosya boyutu ve MIME doğrulaması
- Toplu tahmin kuyruğu
- ONNX ile daha hafif çalışma zamanı
- Yanlış sınıflandırma inceleme ekranı

---
Canonical: https://kutarya.com/sistemler/goruntu-siniflandirma
