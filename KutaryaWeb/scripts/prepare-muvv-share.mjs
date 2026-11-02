// Muvv teslimini ayrı, sürümlü Hosting dosyalarına kopyalar; katalog/veri yazmaz.
import assert from "node:assert/strict";
import { readFile, writeFile, copyFile, mkdir } from "node:fs/promises";
import { createHash } from "node:crypto";
import { resolve } from "node:path";

const root = resolve("."), proof = resolve("artifacts/releases/muvv-private/0.4.0-20261012");
const destination = resolve("public/ozel/muvv/0.4.0-20261012");
const archive = "D:/BRS/teslim/Muvv-0.4.0-20261012-kontrol/Muvv-0.4.0-Proje-20261012.zip";
const sha = bytes => createHash("sha256").update(bytes).digest("hex");
const expected = "6dc8ca25036ed73096231543323b5ff1a1ec387660cc7205e115d348fd2f3b62";
const bytes = await readFile(archive);
assert.equal(sha(bytes), expected);
assert.equal(bytes.length, 1218590);
assert(destination.startsWith(root + "\\") || destination.startsWith(root + "/"));
await mkdir(destination, { recursive: true });
await mkdir(proof, { recursive: true });
const payload = [{ name: "Muvv-0.4.0-Proje-20261012.zip", source: archive }];
for (const name of ["rgb.png", "dpi.png", "buttons.png", "profiles.png", "rgb-zones.png", "minimum-size.png"])
  payload.push({ name, source: `D:/BRS/kontrol-20261012/arayuz/${name}` });
const files = [];
for (const entry of payload) {
  const data = await readFile(entry.source);
  if (entry.name.endsWith(".png")) assert(data.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])));
  await copyFile(entry.source, resolve(destination, entry.name));
  files.push({ path: `/ozel/muvv/0.4.0-20261012/${entry.name}`, bytes: data.length, sha256: sha(data) });
}
const base = JSON.parse(await readFile("firebase.json", "utf8"));
assert.equal(base.hosting.site, "kutarya-ai-3169");
assert.equal(base.hosting.public, "dist");
await writeFile(resolve(proof, "firebase-before.json"), JSON.stringify(base, null, 2) + "\n", { flag: "wx" });
assert(!base.hosting.rewrites.some(rule => rule.source?.startsWith("/ozel")), "Özel yol önceden tanımlı; üzerine yazılmaz.");
base.hosting.rewrites.unshift({ source: "/ozel", destination: "/ozel.html" }, { source: "/ozel/", destination: "/ozel.html" });
base.hosting.redirects ||= [];
base.hosting.redirects.push({ source: "/ozel.html", destination: "/ozel", type: 301 });
base.hosting.headers.push({
  regex: "^[/\\\\]ozel(?:[/\\\\].*|\\.html)?$",
  headers: [
    { key: "X-Robots-Tag", value: "noindex, nofollow" },
    { key: "Referrer-Policy", value: "no-referrer" },
  ],
});
base.hosting.headers.push({ source: "/ozel/muvv/0.4.0-20261012/**", headers: [{ key: "Cache-Control", value: "public, max-age=31536000, immutable" }] });
base.hosting.headers.push({ source: "/ozel/muvv/0.4.0-20261012/Muvv-0.4.0-Proje-20261012.zip", headers: [{ key: "Content-Disposition", value: 'attachment; filename="Muvv-0.4.0-Proje-20261012.zip"' }] });
await writeFile("firebase.json", JSON.stringify(base, null, 2) + "\n");
for (const name of ["ozel.html", "ozel/muvv/0.4.0-20261012/page.css"]) {
  const data = await readFile(resolve("public", name));
  files.push({ path: "/" + name, bytes: data.length, sha256: sha(data) });
}
await writeFile(resolve(proof, "payload.json"), JSON.stringify({ at: new Date().toISOString(), project: "muvv", version: "0.4.0", page: "https://kutarya.com/ozel", files, catalogWrite: false, sourceZipModified: false }, null, 2) + "\n");
console.log(JSON.stringify({ files: files.length, zipBytes: bytes.length, zipSha256: expected, publicCatalogEntryAdded: false }));
