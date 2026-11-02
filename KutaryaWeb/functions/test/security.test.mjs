import test from "node:test";
import assert from "node:assert/strict";
import {
  requireAdmin,
  requireMember,
  normalizeGame,
  hashCode,
  checkCode,
  safeReturn,
} from "../policy.js";
import { fixture } from "./fixture.mjs";
import {
  fileSpec,
  fileSignature,
  safeRepository,
  safeImage,
} from "../policy.js";
test("Admin rolü ve doğrulama ikisi de gerekir", () => {
  assert.throws(() => requireAdmin(null));
  assert.throws(() =>
    requireAdmin({ uid: "u", token: { email_verified: true, admin: true } }),
  );
  assert.throws(() =>
    requireAdmin({
      uid: "u",
      token: { email_verified: false, gamesAdmin: true },
    }),
  );
  assert.equal(
    requireAdmin({
      uid: "u",
      token: { email_verified: true, gamesAdmin: true },
    }),
    "u",
  );
});
test("Doğrulanmamış üye yazamaz", () =>
  assert.throws(() =>
    requireMember({ uid: "u", token: { email_verified: false } }),
  ));
test("Kod tek kullanımlık, süreli ve en çok 5 denemelidir", () => {
  const r = {
    hash: hashCode("123456", "salt"),
    salt: "salt",
    expiresAt: 1000,
    attempts: 0,
    used: false,
  };
  assert.equal(checkCode(r, "123456", 900).ok, true);
  assert.equal(checkCode(r, "123455", 900).ok, false);
  assert.equal(checkCode({ ...r, used: true }, "123456", 900).ok, false);
  assert.equal(checkCode(r, "123456", 1001).ok, false);
  assert.equal(checkCode({ ...r, attempts: 5 }, "123456", 900).ok, false);
});
test("Doğrulanmamış Unity paketi yayınlanamaz", () => {
  const g = {
    ...fixture,
    status: "published",
    engine: "unity",
    runtime: "/games/deneme/1.0/index.html",
  };
  assert.throws(() => normalizeGame(g, null, ["uygulama"]));
  assert.doesNotThrow(() =>
    normalizeGame({ ...g, status: "draft" }, null, ["uygulama"]),
  );
  assert.throws(() =>
    normalizeGame({ ...g, runtime: "https://evil.test/game" }, null, [
      "uygulama",
    ]),
  );
});
test("Eski sürüm doğrulanmışsa etkinleştirilebilir", () => {
  const g = {
    ...fixture,
    engine: "unity",
    runtime: "/games/test-proje/1.0.0/index.html",
    status: "published",
  };
  const old = {
    ...g,
    versions: [{ id: g.version, runtime: g.runtime, verified: true }],
  };
  assert.equal(normalizeGame(g, old, ["uygulama"]).version, "1.0.0");
});
test("Profil/veri enjeksiyonu ve açık yönlendirme engellenir", () => {
  assert.throws(() =>
    normalizeGame({ ...fixture, id: "../../evil" }, fixture, ["uygulama"]),
  );
  assert.equal(safeReturn("//evil.test"), "/kutuphanem");
  assert.equal(safeReturn("/admin"), "/admin");
});
test("Yayın için gerçek dosya veya HTTPS depo gerekir; istemci dosya/verified enjekte edemez", () => {
  assert.throws(() =>
    normalizeGame(
      {
        ...fixture,
        status: "published",
        files: [{ id: "fake", version: "1.0.0" }],
      },
      null,
      ["uygulama"],
    ),
  );
  const source = {
    ...fixture,
    engine: "source",
    kind: "source",
    repository: "https://github.com/kutarya/project",
    status: "published",
  };
  assert.equal(normalizeGame(source, null, ["uygulama"]).files.length, 0);
  assert.throws(() =>
    normalizeGame({ ...source, license: "" }, null, ["uygulama"]),
  );
  assert.throws(() =>
    normalizeGame({ ...fixture, engine: "native" }, null, ["uygulama"]),
  );
});
test("Dosya yolu, uzantı, boyut ve platform sınırları korunur", () => {
  const spec = {
    name: "setup.EXE",
    size: 20,
    role: "installer",
    platform: "windows",
    version: "1.0.0",
  };
  assert.equal(fileSpec(spec).name, "setup.exe");
  for (const change of [
    { name: "../../setup.exe" },
    { name: "site.html" },
    { name: "a..exe" },
    { size: 0 },
    { size: 501 * 1024 * 1024 },
    { platform: "invalid" },
  ])
    assert.throws(() => fileSpec({ ...spec, ...change }));
});
test("Yanıltıcı dosya uzantısı ve tehlikeli kaynak/görsel bağlantısı reddedilir", () => {
  assert.equal(fileSignature("setup.exe", Buffer.from("MZ123456")), true);
  assert.equal(fileSignature("setup.exe", Buffer.from("<html>")), false);
  assert.equal(
    fileSignature("source.zip", Buffer.from([80, 75, 3, 4, 0, 0, 0, 0])),
    true,
  );
  assert.throws(() => safeRepository("javascript:alert(1)"));
  assert.throws(() => safeRepository("https://user:password@example.com"));
  assert.throws(() => safeImage("https://tracking.example/image.png"));
});
test("Altı içerik türü ve mobil/kaynak paylaşımı geçerlidir", () => {
  for (const kind of ["game", "desktop", "web", "mobile", "source", "tool"])
    assert.equal(
      normalizeGame({ ...fixture, kind }, null, ["uygulama"]).kind,
      kind,
    );
  assert.throws(() =>
    normalizeGame({ ...fixture, platforms: [] }, null, ["uygulama"]),
  );
});
