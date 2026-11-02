import assert from "node:assert/strict";
import { readFile, writeFile } from "node:fs/promises";
import { randomUUID } from "node:crypto";
import { initializeTestEnvironment } from "@firebase/rules-unit-testing";
import { ref, uploadBytes, getBytes } from "firebase/storage";
const config = {
  projectId: "demo-kutarya-games",
  storage: {
    host: "127.0.0.1",
    port: 9199,
    rules: await readFile(
      "artifacts/firebase-production-storage.rules",
      "utf8",
    ),
  },
};
const env = await initializeTestEnvironment(config),
  uid = `rules-${randomUUID()}`,
  passed = [];
const source = new Uint8Array([80, 75, 3, 4, 0, 0, 0, 0]),
  metadata = { contentType: "application/octet-stream" };
async function check(name, fn) {
  await fn();
  passed.push(name);
  console.log("GEÇTİ:", name);
}
const owner = env
  .authenticatedContext(uid, {
    email: "member@kutarya.test",
    email_verified: true,
  })
  .storage();
const oldAdmin = env
  .authenticatedContext("legacy-admin", {
    email: "kutaryaai@gmail.com",
    email_verified: true,
  })
  .storage();
const admin = env
  .authenticatedContext(uid, {
    email: "admin@kutarya.test",
    email_verified: true,
    gamesAdmin: true,
  })
  .storage();
const unverified = env
  .authenticatedContext(uid, {
    email: "kutaryaai@gmail.com",
    email_verified: false,
    gamesAdmin: true,
  })
  .storage();
const guest = env.unauthenticatedContext().storage();
try {
  await check("Eski kullanıcı yolu sahibi için çalışır", async () => {
    await uploadBytes(ref(owner, `users/${uid}/source.zip`), source, metadata);
    assert.equal(
      (await getBytes(ref(owner, `users/${uid}/source.zip`))).byteLength,
      8,
    );
  });
  await check("Eski kullanıcı yolu diğer üyeye kapalı kalır", async () => {
    await assert.rejects(
      getBytes(
        ref(
          env
            .authenticatedContext("another", { email: "another@kutarya.test" })
            .storage(),
          `users/${uid}/source.zip`,
        ),
      ),
      (e) => e.code === "storage/unauthorized",
    );
  });
  await check("Eski admin ve halka açık indirmeler korunur", async () => {
    await uploadBytes(ref(oldAdmin, `indirmeler/${uid}.zip`), source, metadata);
    assert.equal(
      (await getBytes(ref(guest, `indirmeler/${uid}.zip`))).byteLength,
      8,
    );
  });
  await check("Eski global admin izni yeni proje yolunu aşamaz", async () => {
    await assert.rejects(
      uploadBytes(
        ref(oldAdmin, `projectAssets/legacy-admin/test/file/source.zip`),
        source,
        metadata,
      ),
      (e) => e.code === "storage/unauthorized",
    );
  });
  await check("Doğrulanmamış admin yeni proje dosyası yükleyemez", async () => {
    await assert.rejects(
      uploadBytes(
        ref(unverified, `projectAssets/${uid}/test/unverified/source.zip`),
        source,
        metadata,
      ),
      (e) => e.code === "storage/unauthorized",
    );
  });
  await check("Doğrulanmış gamesAdmin yeni kapsama yükler", async () => {
    await uploadBytes(
      ref(admin, `projectAssets/${uid}/test/verified/source.zip`),
      source,
      metadata,
    );
  });
  await check(
    "Eski genel kural paket üzerine yazmaya izin vermez",
    async () => {
      await assert.rejects(
        uploadBytes(
          ref(admin, `projectAssets/${uid}/test/verified/source.zip`),
          source,
          metadata,
        ),
        (e) => e.code === "storage/unauthorized",
      );
    },
  );
  await check("Misafir yeni özel proje nesnesini okuyamaz", async () => {
    await assert.rejects(
      getBytes(ref(guest, `projectAssets/${uid}/test/verified/source.zip`)),
      (e) => e.code === "storage/unauthorized",
    );
  });
  await writeFile(
    "artifacts/storage-rules-results.json",
    JSON.stringify(
      {
        at: new Date().toISOString(),
        passed,
        environment: "local-storage-emulator-production-rule-proposal",
        productionChanged: false,
      },
      null,
      2,
    ),
  );
} finally {
  await env.cleanup();
  const restore = await initializeTestEnvironment({
    ...config,
    storage: {
      ...config.storage,
      rules: await readFile("firebase/storage.rules", "utf8"),
    },
  });
  await restore.cleanup();
}
