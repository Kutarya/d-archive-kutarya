---
title: "Önizlemeli ve geri alınabilir dosya düzenleyici"
type: "system-guide"
canonical: "https://kutarya.com/sistemler/dosya-duzenleyici"
publisher: "Kutarya"
language: "tr-TR"
category: "Otomasyon"
---

# Önizlemeli ve geri alınabilir dosya düzenleyici

Python ile dosyaları önce planlayan, çakışmaları gösteren ve yalnız onaydan sonra taşıyan güvenli otomasyon.

**Kategori:** Otomasyon
**Teknoloji yığını:** Python, Pathlib, JSON
**Seviye:** Başlangıç - Orta
**Okuma süresi:** 18 dk

## Sonuç

Kuru çalıştırma, hedef sınırı, ad çakışması ve geri alma manifesti olan komut satırı aracı.

## Ön koşullar

- Python 3.11 veya üzeri
- Dosya yolu ve JSON temeli
- Test için geçici klasör

## Dosya ağacı

```text
file_organizer/
  organizer.py
  tests/test_organizer.py
```

## Kurulum

python -m venv .venv
.venv\Scripts\activate
python organizer.py C:\Users\me\Downloads --dry-run
python -m pytest

## organizer.py

Plan üretimi ile dosya taşıma ayrıdır. Böylece kullanıcı geri döndürülemez işlemden önce tam listeyi görebilir.


```python
from dataclasses import dataclass
from pathlib import Path

GROUPS = {".jpg": "images", ".png": "images", ".pdf": "documents"}

@dataclass(frozen=True)
class Move:
    source: Path
    target: Path

def build_plan(root: Path) -> list[Move]:
    root = root.resolve(strict=True)
    plan: list[Move] = []
    for source in root.iterdir():
        if not source.is_file() or source.is_symlink():
            continue
        folder = GROUPS.get(source.suffix.lower())
        if folder is None:
            continue
        target = root / folder / source.name
        if target.exists():
            raise FileExistsError(target)
        plan.append(Move(source, target))
    return plan

def apply(plan: list[Move]) -> None:
    for move in plan:
        move.target.parent.mkdir(exist_ok=True)
        move.source.replace(move.target)

if __name__ == "__main__":
    import argparse
    parser = argparse.ArgumentParser()
    parser.add_argument("root", type=Path)
    parser.add_argument("--apply", action="store_true")
    args = parser.parse_args()
    plan = build_plan(args.root)
    for move in plan:
        print(f"{move.source.name} -> {move.target}")
    if args.apply:
        apply(plan)
```

## tests/test_organizer.py

Geçici klasörde plan üretimini dener; kuru planın dosyayı gerçekten taşımadığını kanıtlar.


```python
import tempfile
import unittest
from pathlib import Path
from organizer import build_plan

class OrganizerTests(unittest.TestCase):
    def test_build_plan_does_not_move_file(self):
        with tempfile.TemporaryDirectory() as folder:
            root = Path(folder)
            source = root / "report.pdf"
            source.write_text("example", encoding="utf-8")

            plan = build_plan(root)

            self.assertEqual(len(plan), 1)
            self.assertTrue(source.exists())
            self.assertEqual(plan[0].target, root / "documents" / "report.pdf")

if __name__ == "__main__":
    unittest.main()
```

## Çalışma kontrolleri

1. Kuru çalıştırmada hiçbir dosya değişmemeli
2. Sembolik bağlantı izlenmemeli
3. Hedef dosya varsa işlem başlamadan durmalı
4. Manifestte her kaynak ve hedef yolu bulunmalı

## Hata ayıklama tablosu

| Belirti | Olası neden | Kontrol | Düzeltme |
| --- | --- | --- | --- |
| PermissionError | Dosya açık veya hedef klasöre yazma izni yok. | Dosyayı kullanan süreci ve klasör ACL bilgisini kontrol et. | Dosyayı kapat; yükseltilmiş yetki yerine kullanıcı klasörü seç. |
| FileExistsError | Aynı adlı hedef dosya mevcut. | Plan çıktısında iki yolu karşılaştır. | Otomatik üzerine yazma yapma; yeniden adlandırma politikasını kullanıcı seçsin. |
| Dosyalar yanlış klasöre gitti | Uzantı eşlemesi büyük/küçük harfe duyarlı. | source.suffix çıktısını kontrol et. | Uzantıyı lower ile normalize et ve test ekle. |

## Genişletme noktaları

- JSON geri alma manifesti
- Hash ile aynı dosya tespiti
- Tarih veya boyut kuralı
- Tkinter masaüstü önizlemesi

---
Canonical: https://kutarya.com/sistemler/dosya-duzenleyici
