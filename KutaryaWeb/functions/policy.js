import { createHash, timingSafeEqual } from "node:crypto";
export class DomainError extends Error {
  constructor(code, message) {
    super(message);
    this.code = code;
  }
}
export function assert(
  ok,
  message = "Geçersiz işlem.",
  code = "invalid-argument",
) {
  if (!ok) throw new DomainError(code, message);
}
export function text(v, max = 200, required = false) {
  assert(
    typeof v === "string" &&
      v.trim().length <= max &&
      (!required || v.trim().length > 0),
  );
  return v.trim();
}
export function id(v) {
  assert(
    typeof v === "string" && /^[a-z0-9][a-z0-9-]{0,63}$/.test(v),
    "Geçersiz kimlik.",
  );
  return v;
}
export function requireMember(auth, verified = true) {
  assert(auth?.uid, "Bu işlem için giriş yapmalısın.", "unauthenticated");
  assert(
    !verified || auth.token.email_verified === true,
    "Önce e-posta adresini doğrula.",
    "permission-denied",
  );
  return auth.uid;
}
export function requireAdmin(auth) {
  requireMember(auth);
  assert(
    auth.token.gamesAdmin === true,
    "Bu sayfaya erişim yetkin yok.",
    "permission-denied",
  );
  return auth.uid;
}
export function safeReturn(v) {
  return typeof v === "string" && /^\/(?!\/)[a-z0-9/-]*$/i.test(v)
    ? v
    : "/kutuphanem";
}
export function hashCode(code, salt) {
  return createHash("sha256").update(`${salt}:${code}`).digest("hex");
}
export function checkCode(record, code, now = Date.now()) {
  if (!record || record.used || record.expiresAt <= now)
    return { ok: false, reason: "Kodun süresi doldu. Yeni bir kod iste." };
  if (record.attempts >= 5)
    return { ok: false, reason: "Deneme sınırına ulaştın. Yeni bir kod iste." };
  const valid =
    /^\d{6}$/.test(code) &&
    timingSafeEqual(
      Buffer.from(hashCode(code, record.salt)),
      Buffer.from(record.hash),
    );
  return {
    ok: valid,
    attempts: record.attempts + 1,
    reason: valid ? "" : "Kod eşleşmedi. Tekrar dene.",
  };
}
export function normalizeGame(input, previous, categories) {
  assert(input && typeof input === "object");
  const gameId = id(input.id);
  const category = id(input.category);
  assert(categories.includes(category), "Kategori bulunamadı.");
  const engine = input.engine;
  assert(["download", "source", "unity", "web"].includes(engine));
  const runtime = text(input.runtime || "", 300);
  if (["unity", "web"].includes(engine) && runtime)
    assert(
      /^\/games\/[a-z0-9-]+\/[a-z0-9.-]+\/index.html$/.test(runtime),
      "Önce doğrulanmış oyun paketini içe aktar.",
    );
  const status = input.status;
  assert(["draft", "published", "archived"].includes(status));
  const version = text(input.version, 40, true);
  assert(
    /^[a-z0-9][a-z0-9.-]{0,39}$/i.test(version) && !version.includes(".."),
    "Sürüm biçimi geçersiz.",
  );
  const versions = previous?.versions || [];
  const files = previous?.files || [];
  const repository = safeRepository(input.repository || "");
  assert(
    status !== "published" ||
      (["unity", "web"].includes(engine)
        ? versions.some(
            (v) => v.id === version && v.runtime === runtime && v.verified,
          )
        : files.some((f) => f.version === version) ||
          (engine === "source" && repository)),
    "Yayınlamak için bu sürüme bir dosya ekle, kaynak deposu bağla veya doğrulanmış tarayıcı paketi seç.",
  );
  assert(
    Array.isArray(input.devices) &&
      input.devices.length > 0 &&
      input.devices.every((x) => ["desktop", "mobile"].includes(x)),
  );
  assert(Array.isArray(input.tags) && input.tags.length <= 6);
  assert(
    Number.isFinite(input.order) && input.order >= 0 && input.order <= 1000,
  );
  const cover = safeImage(input.cover || "");
  const gallery = input.gallery || [];
  assert(
    Array.isArray(gallery) && gallery.length <= 8,
    "En fazla 8 ekran görüntüsü ekleyebilirsin.",
  );
  const kind = input.kind;
  assert(
    ["game", "desktop", "web", "mobile", "source", "tool"].includes(kind),
    "İçerik türünü seç.",
  );
  assert(
    Array.isArray(input.platforms) &&
      input.platforms.length > 0 &&
      input.platforms.every((p) =>
        ["windows", "macos", "linux", "android", "ios", "web", "all"].includes(
          p,
        ),
      ),
    "En az bir platform seç.",
  );
  const license = text(input.license || "", 100);
  assert(
    status !== "published" || license,
    "Yayınlamak için lisans bilgisini ekle.",
  );
  assert(/^#[0-9a-f]{6}$/i.test(input.color));
  return {
    id: gameId,
    slug: id(input.slug),
    title: text(input.title, 70, true),
    subtitle: text(input.subtitle, 120),
    description: text(input.description, 3000, true),
    category,
    tags: [...new Set(input.tags.map((t) => text(t, 40)).filter(Boolean))],
    engine,
    kind,
    technology: text(input.technology || "", 100),
    platforms: [...new Set(input.platforms)],
    license,
    repository,
    requirements: text(input.requirements || "", 1200),
    changelog: text(input.changelog || "", 3000),
    gallery: gallery.map(safeImage).filter(Boolean),
    files,
    runtime,
    cover,
    color: input.color,
    devices: [...new Set(input.devices)],
    controls: text(input.controls || "", 2000),
    status,
    version,
    versions,
    featured: Boolean(input.featured),
    difficulty: text(input.difficulty || "", 80),
    duration: text(input.duration || "", 80),
    order: input.order,
    updatedAt: Date.now(),
  };
}
export function safeRepository(value) {
  const v = text(value, 500);
  if (!v) return "";
  let parsed;
  try {
    parsed = new URL(v);
  } catch {
    assert(false, "Kaynak deposu bağlantısı geçersiz.");
  }
  assert(
    parsed.protocol === "https:" && !parsed.username && !parsed.password,
    "Kaynak deposu için HTTPS bağlantısı kullan.",
  );
  return parsed.href;
}
export function safeImage(value) {
  const v = text(value, 500);
  assert(
    !v ||
      /^(https:\/\/firebasestorage.googleapis.com\/v0\/b\/kutarya-ai-3169\.firebasestorage\.app|http:\/\/127\.0\.0\.1:9199\/v0\/b\/demo-kutarya-games\.appspot\.com)\/o\/games%2Fcovers%2F[a-z0-9.-]+\?alt=media&token=[a-z0-9-]+$/.test(
        v,
      ),
    "Görseli yönetim panelinden yükle.",
  );
  return v;
}
export function fileSpec(input) {
  const name = text(input.name, 140, true).replace(/\.[a-z0-9]+$/i, (ext) =>
    ext.toLowerCase(),
  );
  assert(
    /^[a-zA-Z0-9][a-zA-Z0-9._ -]*\.(zip|7z|exe|msi|apk|aab|gz|tgz|pdf)$/i.test(
      name,
    ) && !name.includes(".."),
    "ZIP, 7Z, EXE, MSI, APK, AAB, GZ veya PDF dosyası seç. Dosya adında Latin harflerini kullan.",
  );
  assert(
    Number.isInteger(input.size) &&
      input.size > 0 &&
      input.size <= 500 * 1024 * 1024,
    "Dosya en fazla 500 MB olabilir.",
  );
  assert(
    ["installer", "source", "portable", "document"].includes(input.role),
    "Dosya rolü geçersiz.",
  );
  assert(
    input.role !== "source" || /\.(zip|7z|gz|tgz)$/.test(name),
    "Kaynak kodu ZIP, 7Z veya GZ arşivi olarak yükle.",
  );
  assert(
    ["windows", "macos", "linux", "android", "ios", "web", "all"].includes(
      input.platform,
    ),
    "Dosya platformu geçersiz.",
  );
  const version = text(input.version, 40, true);
  assert(
    /^[a-z0-9][a-z0-9.-]{0,39}$/i.test(version) && !version.includes(".."),
    "Sürüm biçimi geçersiz.",
  );
  return {
    name,
    size: input.size,
    role: input.role,
    platform: input.platform,
    version,
  };
}
export function fileSignature(name, bytes) {
  const ext = name.split(".").at(-1).toLowerCase();
  if (["zip", "apk", "aab"].includes(ext))
    return (
      bytes[0] === 0x50 && bytes[1] === 0x4b && [3, 5, 7].includes(bytes[2])
    );
  if (ext === "exe") return bytes.subarray(0, 2).toString() === "MZ";
  if (ext === "msi")
    return bytes.subarray(0, 8).equals(Buffer.from("d0cf11e0a1b11ae1", "hex"));
  if (ext === "7z")
    return bytes.subarray(0, 6).equals(Buffer.from("377abcaf271c", "hex"));
  if (["gz", "tgz"].includes(ext))
    return bytes[0] === 0x1f && bytes[1] === 0x8b;
  return ext === "pdf" && bytes.subarray(0, 5).toString() === "%PDF-";
}
