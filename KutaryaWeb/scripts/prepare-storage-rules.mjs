// Yalnız dosya hazırlar; canlı kuralları yayınlamaz. Güncel envanter önce okunmalıdır.
import { readFile, writeFile } from "node:fs/promises";
import { createHash } from "node:crypto";
const previous = await readFile(
    "artifacts/firebase-live-storage.rules",
    "utf8",
  ),
  local = await readFile("firebase/storage.rules", "utf8");
const catchAll =
  /match\s+\/\{allPaths=\*\*\}\s*\{\s*allow read, write: if isAdmin\(\);\s*\}/g;
if (
  [...previous.matchAll(catchAll)].length !== 1 ||
  previous.includes("match /projectAssets/")
)
  throw new Error(
    "Canlı kural yapısı değişmiş; otomatik birleştirme yapılmadı. Güncel kuralları incele.",
  );
const begin = local.indexOf("  function admin()"),
  end = local.indexOf("  match /{allPaths=**}");
if (begin < 0 || end < begin)
  throw new Error("Yerel proje kuralları bulunamadı.");
const scoped = local
  .slice(begin, end)
  .replaceAll("admin()", "isProjectAdmin()");
// Storage izinleri toplamsaldır. Eski genel admin kuralı yeni korumayı aşmamalı.
const merged = previous.replace(
  catchAll,
  `${scoped}\n    match /{root}/{allPaths=**} {\n      allow read, write: if root != 'projectAssets' && isAdmin();\n    }`,
);
await writeFile("artifacts/firebase-production-storage.rules", merged);
await writeFile(
  "firebase.storage-release.json",
  JSON.stringify(
    {
      storage: [
        {
          bucket: "kutarya-ai-3169.firebasestorage.app",
          rules: "artifacts/firebase-production-storage.rules",
        },
      ],
    },
    null,
    2,
  ),
);
await writeFile(
  "artifacts/storage-rules-review.json",
  JSON.stringify(
    {
      at: new Date().toISOString(),
      project: "kutarya-ai-3169",
      bucket: "kutarya-ai-3169.firebasestorage.app",
      baseSHA256: createHash("sha256").update(previous).digest("hex"),
      proposedSHA256: createHash("sha256").update(merged).digest("hex"),
      productionChanged: false,
    },
    null,
    2,
  ),
);
console.log(
  "Storage kural önerisi hazır. Mevcut yollar korunur; projectAssets ayrı doğrulanmış yönetici kapsamındadır. Canlı değişmedi.",
);
