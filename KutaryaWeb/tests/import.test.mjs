import test from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, mkdir, writeFile, readFile, rm } from "node:fs/promises";
import { execFileSync } from "node:child_process";
import { createHash, randomUUID } from "node:crypto";
import path from "node:path";

test("Web paketi bütünlüğü, değişmez sürüm ve paket sınırları", async () => {
  const root = path.resolve("artifacts");
  await mkdir(root, { recursive: true });
  const fixture = await mkdtemp(path.join(root, "package-check-"));
  const gameId = `paket-test-${randomUUID()}`;
  const output = path.resolve("public", "games", gameId);
  const run = (version) =>
    execFileSync(
      process.execPath,
      ["scripts/import-game.mjs", fixture, gameId, version],
      { encoding: "utf8", stdio: "pipe" },
    );
  try {
    const html =
      '<!doctype html><HTML lang="tr"><body><script src="./game.js"></script><script>const template = \'<a href="missing-template.html">örnek</a>\';</script></body></HTML>';
    await writeFile(path.join(fixture, "index.html"), html);
    await writeFile(
      path.join(fixture, "game.js"),
      'document.body.dataset.ready="true";',
    );
    assert.match(run("1.0.0"), /Paket içe aktarıldı/);
    const manifest = JSON.parse(
      await readFile(
        path.join(output, "1.0.0", "kutarya-manifest.json"),
        "utf8",
      ),
    );
    assert.equal(manifest.verified, false);
    assert.equal(manifest.kind, "web");
    assert.equal(manifest.files.length, 2);
    for (const file of manifest.files) {
      const content = await readFile(path.join(output, "1.0.0", file.path));
      assert.equal(content.length, file.bytes);
      assert.equal(
        createHash("sha256").update(content).digest("hex"),
        file.sha256,
      );
    }
    assert.throws(() => run("1.0.0"), /Bu sürüm yolu zaten var/);
    await writeFile(
      path.join(fixture, "index.html"),
      html.replace("game.js", "missing.js"),
    );
    assert.throws(() => run("1.0.1"), /Eksik varlık/);
    await writeFile(
      path.join(fixture, "index.html"),
      html.replace("./game.js", "../outside.js"),
    );
    assert.throws(() => run("1.0.2"), /Paket içi kaynak yolları/);
    assert.throws(() => run("../outside"), /Kullanım/);
  } finally {
    // Yalnız bu testin oluşturduğu, doğrulanmış çalışma alanı yollarını temizle.
    if (
      !fixture.startsWith(root + path.sep) ||
      !output.startsWith(path.resolve("public", "games") + path.sep)
    )
      throw new Error("Test temizleme yolu geçersiz.");
    await rm(fixture, { recursive: true, force: true });
    await rm(output, { recursive: true, force: true });
  }
});
