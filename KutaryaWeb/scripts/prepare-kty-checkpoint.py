"""10.000. adım ağırlıklarını eğitim içeriği olmadan paketler ve doğrular."""

import argparse
import hashlib
import json
import subprocess
import sys
import zipfile
from pathlib import Path

import torch

sys.dont_write_bytecode = True
ROOT = Path(__file__).resolve().parents[1]
SOURCE = Path("D:/KTY-1.0")
ORIGINAL = SOURCE / "checkpoints/kty-1.0-v4-50m-step010000.pt"
OUT = ROOT / "artifacts/release-2026-10-09-kty-step10000"
PACKAGE_NAME = "Kutarya-Us-KTY-1.0-Adim-10000.zip"
WEIGHTS_NAME = "kty-1.0-step10000.pt"
EXPECTED_SHA = "FD14D7E3F5E4B54024BC838226ED95F320E3DB4337049B382CFA6443835D5152"
PARAMETERS = 50_055_680
KEYS = (
    "model_name", "checkpoint_version", "chat_format", "end_marker",
    "reasoning_tag", "model_state_dict", "step", "config",
)
ENTRIES = (
    WEIGHTS_NAME, "model.py", "tokenizer.py", "config.py", "generate.py",
    "README.md", "requirements.txt", "manifest.json",
)

INFERENCE_MAIN = '''
def main():
    parser = argparse.ArgumentParser(description="Kutarya Us · KTY-1.0 terminal sohbeti")
    parser.add_argument("--checkpoint", type=Path,
                        default=BASE_DIR / "kty-1.0-step10000.pt")
    parser.add_argument("--prompt", help="Tek mesaja cevap verip çık")
    parser.add_argument("--greedy", action="store_true")
    parser.add_argument("--max-new-tokens", type=int, default=config.MAX_NEW_TOKENS)
    parser.add_argument("--temperature", type=float, default=DEFAULT_TEMPERATURE)
    parser.add_argument("--top-k", type=int, default=DEFAULT_TOP_K)
    parser.add_argument("--seed", type=int)
    args = parser.parse_args()
    if (args.max_new_tokens <= 0 or not math.isfinite(args.temperature)
            or args.temperature <= 0 or not 0 <= args.top_k <= 256):
        parser.error("max-new-tokens/temperature pozitif, top-k 0..256 olmalı.")
    if args.prompt is not None and not args.prompt.strip():
        parser.error("--prompt boş olamaz.")
    if not args.checkpoint.is_file():
        parser.error(f"Checkpoint bulunamadı: {args.checkpoint}. ZIP'i bütünüyle çıkarın.")
    if args.seed is not None:
        torch.manual_seed(args.seed)
    torch.set_num_threads(config.CPU_THREADS)
    model, checkpoint = load_model_checkpoint(args.checkpoint, "cpu")
    if checkpoint.get("step") != 10000:
        parser.error("Bu paket 10.000. adım checkpoint'i için hazırlanmıştır.")
    print(f"Kutarya Us · KTY-1.0 | Adım: {checkpoint['step']} | "
          f"Parametre: {sum(p.numel() for p in model.parameters())} | CPU", flush=True)
    del checkpoint

    def answer(message):
        reply = generate_reply(model, message, max_new_tokens=args.max_new_tokens,
                               temperature=args.temperature, top_k=args.top_k,
                               greedy=args.greedy)
        print("Kutarya Us: " + (reply if reply else "[Boş cevap]"), flush=True)

    if args.prompt is not None:
        answer(args.prompt)
        return
    print("Mesajını yaz. /cikis: çıkış. Her mesaj bağımsız yanıtlanır.")
    try:
        while True:
            message = input("\\nSen: ")
            if message.strip().casefold() in ("/cikis", "/çıkış", "/exit"):
                break
            if message.strip():
                answer(message)
    except (EOFError, KeyboardInterrupt):
        print()


if __name__ == "__main__":
    main()
'''

README = '''# Kutarya Us · KTY-1.0 — 10.000. adım

Bu paket KTY-1.0 modelinin tam 10.000. adımındaki ağırlıklarını içerir.
Parametre: **50.055.680** (yaklaşık **50,06 milyon**).
Sözlük 256 bayt; bağlam 768 bayt; embedding 640; 10 katman, 10 başlık;
ileri besleme boyutu 2.560. Tokenizer UTF-8 baytları kullanır.

## Çalıştırma

ZIP dosyasının tamamını tek klasöre çıkarın. 64 bit Python ortamında:

```text
pip install -r requirements.txt
python generate.py --prompt "selam" --greedy
python generate.py
```

Varsayılan checkpoint `kty-1.0-step10000.pt`; model CPU üzerinde çalışır.
Kısa üretim: `python generate.py --prompt "selam" --greedy --max-new-tokens 64`.
Etkileşimli modda `/cikis` ile çıkılır. Her mesaj bağımsız yanıtlanır.
Üretim sınırının birimi bayttır. Özgün sohbet biçimi `Kullanıcı: ...\\nKTY: `
olarak korunur; kod bunu otomatik hazırlar.

Python içinde yükleme:

```python
from model import load_model_checkpoint
from generate import generate_reply

model, metadata = load_model_checkpoint("kty-1.0-step10000.pt", "cpu")
assert metadata["step"] == 10000
print(generate_reply(model, "selam", max_new_tokens=64, greedy=True))
```

## Paket kapsamı

Checkpoint, model.py, tokenizer.py, yalnız mimari/üretim ayarlarını içeren
config.py, generate.py, requirements.txt, bu açıklama ve SHA-256 manifesti.
Eğitim verisi, eğitim betiği, eğitim günlüğü, optimizer, RNG durumu ve veri
kümesi metadata'sı bulunmaz. Ağırlıklar kaynak checkpoint ile tensör bazında
birebir aynıdır; yeniden eğitim, quantization veya dtype dönüşümü yapılmadı.
Bu inference checkpoint'i eğitim oturumunu optimizer durumuyla sürdürmez.

Windows, Python 3.12 ve PyTorch 2.14.1+cpu ile temiz klasörde yükleme ve gerçek
metin üretimi doğrulandı. GPU ve kapsamlı cevap kalitesi değerlendirilmedi.
Lisans belirtilmedi. Dosya boyutları ve SHA-256 değerleri manifest.json'dadır.
'''


def digest(path):
    with path.open("rb") as stream:
        return hashlib.file_digest(stream, "sha256").hexdigest().upper()


def write_json(path, value):
    path.write_text(json.dumps(value, ensure_ascii=False, indent=2) + "\n",
                    encoding="utf-8")


def assert_same_weights(original, exported):
    assert set(exported) == set(KEYS), "Checkpoint'te fazladan eğitim alanı var."
    assert original["step"] == exported["step"] == 10000
    assert original["config"] == exported["config"]
    assert original["model_state_dict"].keys() == exported["model_state_dict"].keys()
    for name, tensor in original["model_state_dict"].items():
        saved = exported["model_state_dict"][name]
        assert tensor.dtype == saved.dtype and torch.equal(tensor, saved), name


def prepare():
    assert digest(ORIGINAL) == EXPECTED_SHA, "Kaynak checkpoint değişti."
    original = torch.load(ORIGINAL, map_location="cpu", weights_only=True, mmap=True)
    assert original["step"] == 10000
    stage = OUT / "package"
    stage.mkdir(parents=True, exist_ok=True)
    weights = stage / WEIGHTS_NAME
    # Açık alan listesi: optimizer/veri/RNG bilgisi bu sözlüğe hiç taşınmaz.
    exported = {key: original[key] for key in KEYS}
    if weights.exists():
        assert_same_weights(original, torch.load(weights, weights_only=True, mmap=True))
    else:
        torch.save(exported, weights)
    for name in ("model.py", "tokenizer.py"):
        (stage / name).write_bytes((SOURCE / name).read_bytes())
    config = "# Yalnız checkpoint mimarisi ve metin üretim ayarları.\n"
    config += "\n".join(f"{key} = {value!r}" for key, value in exported["config"].items())
    config += '\nCPU_THREADS = 4\nMAX_NEW_TOKENS = 256\nTEMPERATURE = 0.6\nTOP_K = 10\n'
    config += f'CHAT_FORMAT = {exported["chat_format"]!r}\n'
    config += '\n\ndef model_config():\n    return {name: globals()[name] for name in '
    config += repr(tuple(exported["config"])) + '}\n'
    (stage / "config.py").write_text(config, encoding="utf-8")
    generation = (SOURCE / "generate.py").read_text(encoding="utf-8")
    generation = generation[:generation.index("def generation_smoke_test():")]
    # Üretim mantığı korunur; eğitim yönlendirmeleri ve eski checkpoint araması alınmaz.
    (stage / "generate.py").write_text(generation + INFERENCE_MAIN, encoding="utf-8")
    (stage / "README.md").write_text(README, encoding="utf-8")
    (stage / "requirements.txt").write_text("torch==2.14.1\n", encoding="utf-8")
    files = [{"name": name, "bytes": (stage / name).stat().st_size,
              "sha256": digest(stage / name)} for name in ENTRIES[:-1]]
    public_manifest = {
        "model": "Kutarya Us · KTY-1.0", "step": 10000, "parameters": PARAMETERS,
        "config": exported["config"], "checkpointKeys": list(KEYS),
        "inferenceOnly": True, "trainingDataIncluded": False,
        "weightsIdenticalToOriginal": True, "sourceCheckpoint": ORIGINAL.name,
        "sourceCheckpointSha256": EXPECTED_SHA, "files": files,
    }
    write_json(stage / "manifest.json", public_manifest)
    files.append({"name": "manifest.json", "bytes": (stage / "manifest.json").stat().st_size,
                  "sha256": digest(stage / "manifest.json")})
    assert {p.name for p in stage.iterdir()} == set(ENTRIES)
    with zipfile.ZipFile(OUT / PACKAGE_NAME, "w", compression=zipfile.ZIP_DEFLATED,
                         compresslevel=6) as archive:
        for name in ENTRIES:
            archive.write(stage / name, name)
    archive_path = OUT / PACKAGE_NAME
    assert archive_path.stat().st_size < 500 * 1024 * 1024
    write_json(OUT / "package.json", {
        "gameId": "kutarya-us-kty-1-0", "version": "1.0.0-step10000",
        "name": PACKAGE_NAME, "bytes": archive_path.stat().st_size,
        "sha256": digest(archive_path), "entries": list(ENTRIES), "fileMetadata": files,
        "step": 10000, "parameters": PARAMETERS, "trainingDataIncluded": False,
        "trainedWeightsIncluded": True, "inferenceOnly": True,
        "source": {"name": ORIGINAL.name, "bytes": ORIGINAL.stat().st_size,
                   "sha256": EXPECTED_SHA},
    })


def verify(archive_path):
    manifest = json.loads((OUT / "package.json").read_text(encoding="utf-8"))
    assert digest(archive_path) == manifest["sha256"]
    clean = OUT / "acceptance"
    clean.mkdir(parents=True, exist_ok=True)
    with zipfile.ZipFile(archive_path) as archive:
        assert archive.namelist() == list(ENTRIES)
        assert archive.testzip() is None
        for item in manifest["fileMetadata"]:
            with archive.open(item["name"]) as stream:
                assert hashlib.file_digest(stream, "sha256").hexdigest().upper() == item["sha256"]
            # Liste sabittir; mutlak veya üst dizin yolu kabul edilmez.
            assert Path(item["name"]).name == item["name"]
            archive.extract(item["name"], clean)
    original = torch.load(ORIGINAL, weights_only=True, map_location="cpu", mmap=True)
    loaded = torch.load(clean / WEIGHTS_NAME, weights_only=True, map_location="cpu", mmap=True)
    assert_same_weights(original, loaded)
    assert digest(ORIGINAL) == EXPECTED_SHA
    sys.path.insert(0, str(clean))
    from model import load_model_checkpoint
    from generate import generate_reply
    torch.set_num_threads(4)
    model, metadata = load_model_checkpoint(clean / WEIGHTS_NAME, "cpu")
    model.eval()
    assert sum(p.numel() for p in model.parameters()) == PARAMETERS
    assert all(torch.isfinite(p).all().item() for p in model.parameters())
    with torch.inference_mode():
        logits = model(torch.tensor([[83, 101, 108, 97, 109]], dtype=torch.long))
    assert logits.shape == (1, 5, 256) and torch.isfinite(logits).all().item()
    reply = generate_reply(model, "selam", max_new_tokens=64, greedy=True)
    assert reply and reply.encode("utf-8", errors="strict")
    run = subprocess.run(
        [sys.executable, "-X", "utf8", "-B", str(clean / "generate.py"),
         "--prompt", "selam", "--greedy", "--max-new-tokens", "64"],
        cwd=clean, capture_output=True, text=True, encoding="utf-8", timeout=60,
    )
    assert run.returncode == 0, run.stderr
    assert "Adım: 10000" in run.stdout and f"Parametre: {PARAMETERS}" in run.stdout
    assert "Kutarya Us: " + reply in run.stdout
    proof = {
        "archive": archive_path.name, "archiveBytes": archive_path.stat().st_size,
        "archiveSha256": manifest["sha256"], "step": metadata["step"],
        "parameters": PARAMETERS, "torchVersion": torch.__version__,
        "pythonVersion": sys.version.split()[0], "entries": list(ENTRIES),
        "zipCrcPassed": True, "entryHashesPassed": True, "strictLoadPassed": True,
        "weightsIdenticalToOriginal": True, "originalUnchanged": True,
        "finiteWeights": True, "finiteForward": True, "cliGenerationPassed": True,
        "generationSample": reply, "trainingDataIncluded": False,
        "optimizerIncluded": False, "trainingPerformed": False,
    }
    proof_name = "local-acceptance.json" if archive_path == OUT / PACKAGE_NAME else "download-acceptance.json"
    write_json(OUT / proof_name, proof)
    print(json.dumps(proof, ensure_ascii=False))


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("mode", choices=("prepare", "verify"))
    parser.add_argument("--archive", type=Path)
    args = parser.parse_args()
    OUT.mkdir(parents=True, exist_ok=True)
    if args.mode == "prepare":
        prepare()
    verify(args.archive or OUT / PACKAGE_NAME)
