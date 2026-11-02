// Mevcut CLI oturumu kullanılır; parola/servis hesabı anahtarı okunmaz veya istenmez.
import assert from "node:assert/strict";
import { createRequire } from "node:module";
// Admin SDK ham hata nesnesi HTTP Authorization başlığını taşıyabilir; dışarı yazılmaz.
function safeFailure(error) {
  const message = String(error?.message || "Bulut işlemi başarısız.").replace(
    /Bearer\s+\S+/gi,
    "Bearer [gizli]",
  );
  console.error(message);
  process.exit(1);
}
process.on("uncaughtException", safeFailure);
process.on("unhandledRejection", safeFailure);
export const projectId = "kutarya-ai-3169";
export const bucketName = "kutarya-ai-3169.firebasestorage.app";
const require = createRequire(import.meta.url);
const cliAuth = require(
  process.env.APPDATA + "/npm/node_modules/firebase-tools/lib/auth.js",
);
const account = cliAuth.getGlobalDefaultAccount();
assert(
  account,
  "Mevcut Firebase oturumu yok. Kullanıcı şifre istenirse iptal talimatı verdi; login başlatılmaz.",
);
export const operatorEmail = account.user?.email;
export async function accessToken() {
  try {
    return await cliAuth.getAccessToken(account.tokens.refresh_token, [
      "https://www.googleapis.com/auth/cloud-platform",
      "https://www.googleapis.com/auth/firebase",
    ]);
  } catch {
    throw new Error(
      "Mevcut Firebase oturumu yenilenemedi; giriş/şifre istenmeden işlem iptal edildi.",
    );
  }
}
export async function cloudGet(url) {
  const token = await accessToken();
  const r = await fetch(url, {
    headers: { Authorization: `Bearer ${token.access_token}` },
  });
  assert(r.ok, `Bulut erişimi: HTTP ${r.status} (${new URL(url).hostname})`);
  return r.json();
}
export async function cloudRequest(url, method, body) {
  const token = await accessToken();
  const r = await fetch(url, {
    method,
    headers: {
      Authorization: `Bearer ${token.access_token}`,
      "Content-Type": "application/json",
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const data = await r.json();
  assert(
    r.ok,
    `Bulut ${method}: HTTP ${r.status} (${new URL(url).hostname}); ${data.error?.message || ""}`,
  );
  return data;
}
const adminRequire = createRequire(
  new URL("../functions/package.json", import.meta.url),
);
export async function cloudAdmin() {
  assert(
    !process.env.FIRESTORE_EMULATOR_HOST &&
      !process.env.FIREBASE_AUTH_EMULATOR_HOST &&
      !process.env.FIREBASE_STORAGE_EMULATOR_HOST,
    "Üretim operatörü emülatör ortamında çalışmaz.",
  );
  const { initializeApp, getApps } = adminRequire("firebase-admin/app");
  const { getAuth } = adminRequire("firebase-admin/auth");
  const app =
    getApps().find((a) => a.name === "kutarya-release") ||
    initializeApp(
      {
        projectId,
        serviceAccountId: `${projectId}@appspot.gserviceaccount.com`,
        credential: {
          async getAccessToken() {
            const t = await accessToken();
            return {
              access_token: t.access_token,
              expires_in: t.expires_in || 3600,
            };
          },
        },
      },
      "kutarya-release",
    );
  return { app, auth: getAuth(app) };
}
export const documentsRoot = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents`;
export function decodeValue(v) {
  if ("nullValue" in v) return null;
  if ("stringValue" in v) return v.stringValue;
  if ("booleanValue" in v) return v.booleanValue;
  if ("integerValue" in v) return Number(v.integerValue);
  if ("doubleValue" in v) return v.doubleValue;
  if ("arrayValue" in v) return (v.arrayValue.values || []).map(decodeValue);
  if ("mapValue" in v)
    return Object.fromEntries(
      Object.entries(v.mapValue.fields || {}).map(([k, x]) => [
        k,
        decodeValue(x),
      ]),
    );
  throw new Error("Bu katalog aracının tanımadığı Firestore alan türü.");
}
export async function listCollection(name) {
  assert(/^[a-zA-Z][a-zA-Z0-9]+$/.test(name));
  const docs = [];
  let next;
  do {
    const data = await cloudGet(
      `${documentsRoot}/${name}?pageSize=100${next ? `&pageToken=${encodeURIComponent(next)}` : ""}`,
    );
    docs.push(...(data.documents || []));
    next = data.nextPageToken;
  } while (next);
  return docs;
}
export function encodeValue(v) {
  if (v === null) return { nullValue: null };
  if (typeof v === "string") return { stringValue: v };
  if (typeof v === "boolean") return { booleanValue: v };
  if (typeof v === "number")
    return Number.isInteger(v)
      ? { integerValue: String(v) }
      : { doubleValue: v };
  if (Array.isArray(v)) return { arrayValue: { values: v.map(encodeValue) } };
  if (typeof v === "object")
    return {
      mapValue: {
        fields: Object.fromEntries(
          Object.entries(v).map(([k, x]) => [k, encodeValue(x)]),
        ),
      },
    };
  throw new Error("Firestore'a bilinmeyen değer yazılmaz.");
}
export async function createDocument(collection, id, data) {
  assert(
    /^[a-zA-Z][a-zA-Z0-9]+$/.test(collection) && /^[a-zA-Z0-9.-]+$/.test(id),
  );
  return cloudRequest(
    `${documentsRoot}/${collection}/${id}?currentDocument.exists=false`,
    "PATCH",
    {
      fields: Object.fromEntries(
        Object.entries(data).map(([k, v]) => [k, encodeValue(v)]),
      ),
    },
  );
}
