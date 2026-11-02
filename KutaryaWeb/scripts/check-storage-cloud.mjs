// Rules REST test API: yalnız değerlendirme, gerçek nesne yükleme/yazma veya port yok.
import assert from "node:assert/strict";
import { readFile, writeFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import { accessToken, projectId, bucketName } from "./firebase-cloud.mjs";
const content = await readFile(
  "artifacts/firebase-production-storage.rules",
  "utf8",
);
const uid = "release-rule-check",
  path = `/b/${bucketName}/o/projectAssets/${uid}/test/file/source.zip`;
const metadata = {
  name: path,
  size: 8,
  contentType: "application/octet-stream",
  metadata: {},
};
const admin = {
  uid,
  token: {
    email: "rules@kutarya.test",
    email_verified: true,
    gamesAdmin: true,
  },
};
const legacy = {
  uid: "legacy-admin",
  token: { email: "kutaryaai@gmail.com", email_verified: true },
};
const owner = {
  uid,
  token: { email: "member@kutarya.test", email_verified: true },
};
function test(
  name,
  expectation,
  method,
  p,
  auth,
  resource = null,
  requested = metadata,
) {
  return {
    name,
    expectation,
    request: {
      path: p,
      method,
      auth,
      time: new Date().toISOString(),
      resource: requested,
    },
    resource,
  };
}
const checks = [
  test(
    "Sahip eski kullanıcı yoluna yükler",
    "ALLOW",
    "create",
    `/b/${bucketName}/o/users/${uid}/source.zip`,
    owner,
  ),
  test(
    "Başka üye kullanıcı yolunu okuyamaz",
    "DENY",
    "get",
    `/b/${bucketName}/o/users/${uid}/source.zip`,
    { uid: "another", token: { email: "another@kutarya.test" } },
    metadata,
  ),
  test(
    "Eski admin indirmeler yoluna yükler",
    "ALLOW",
    "create",
    `/b/${bucketName}/o/indirmeler/rules-check.zip`,
    legacy,
  ),
  test(
    "Misafir indirmeler yolunu okur",
    "ALLOW",
    "get",
    `/b/${bucketName}/o/indirmeler/rules-check.zip`,
    null,
    metadata,
  ),
  test(
    "Eski genel admin proje korumasını aşamaz",
    "DENY",
    "create",
    path,
    legacy,
  ),
  test("Doğrulanmamış proje admin yükleyemez", "DENY", "create", path, {
    uid,
    token: {
      email: "kutaryaai@gmail.com",
      email_verified: false,
      gamesAdmin: true,
    },
  }),
  test(
    "Doğrulanmış gamesAdmin kendi yoluna yükler",
    "ALLOW",
    "create",
    path,
    admin,
  ),
  test(
    "Kayıtlı dosyanın üzerine yazılmaz",
    "DENY",
    "update",
    path,
    admin,
    metadata,
  ),
  test(
    "Misafir özel proje nesnesini okuyamaz",
    "DENY",
    "get",
    path,
    null,
    metadata,
  ),
  test("Başka UID yoluna yüklenemez", "DENY", "create", path, {
    uid: "another",
    token: admin.token,
  }),
  test("Yanlış MIME reddedilir", "DENY", "create", path, admin, null, {
    ...metadata,
    contentType: "application/zip",
  }),
  test("500 MB üzeri reddedilir", "DENY", "create", path, admin, null, {
    ...metadata,
    size: 500 * 1024 * 1024 + 1,
  }),
];
const t = await accessToken();
const r = await fetch(
  `https://firebaserules.googleapis.com/v1/projects/${projectId}:test`,
  {
    method: "POST",
    headers: {
      Authorization: `Bearer ${t.access_token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      source: { files: [{ name: "storage.rules", content }] },
      testSuite: { testCases: checks.map(({ name, ...c }) => c) },
    }),
  },
);
const result = await r.json();
await writeFile(
  "artifacts/release-2026-10-07/storage-cloud-tests.json",
  JSON.stringify(
    {
      at: new Date().toISOString(),
      httpStatus: r.status,
      sourceSHA256: createHash("sha256").update(content).digest("hex"),
      names: checks.map((c) => c.name),
      result,
      storageObjectsWritten: false,
      listeningServerStarted: false,
    },
    null,
    2,
  ) + "\n",
);
console.log(
  JSON.stringify({
    status: r.status,
    issues: result.issues,
    testStates: result.testResults?.map((x, i) => ({
      name: checks[i].name,
      state: x.state,
      errors: x.errors,
    })),
    error: result.error?.message,
  }),
);
assert(r.ok, "Rules test API erişimi başarısız.");
assert(
  !(result.issues || []).some((i) => i.severity === "ERROR"),
  "Kural derleme hatası.",
);
assert.equal(result.testResults?.length, checks.length);
assert(
  result.testResults.every((x) => x.state === "SUCCESS"),
  "Kural davranışı kabulü geçmedi.",
);
