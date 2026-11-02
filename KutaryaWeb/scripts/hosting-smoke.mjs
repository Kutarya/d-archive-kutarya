import { writeFile } from "node:fs/promises";
import assert from "node:assert/strict";
const results = [];
for (const [route, status, type, encoding] of [
  ["/", 200, "text/html"],
  ["/projeler", 200, "text/html"],
  ["/proje/ornek-proje", 200, "text/html"],
  ["/proje/kutarya-convert", 200, "text/html"],
  ["/games/kutarya-convert/1.0.0/index.html", 200, "text/html"],
  ["/tools-preview/convert-drop-check.html", 404, "text/html"],
  ["/koleksiyon/desktop", 200, "text/html"],
  ["/koleksiyon/source", 200, "text/html"],
  ["/kategori/web", 200, "text/html"],
  ["/oyun/ornek-oyun", 200, "text/html"],
  ["/admin", 200, "text/html"],
  ["/admin/projeler", 200, "text/html"],
  ["/auth/login", 200, "text/html"],
  ["/auth/action", 200, "text/html"],
  ["/olmayan-bir-sayfa", 404, "text/html"],
  ["/games/missing/index.html", 404, "text/html"],
  ["/assets/missing.js", 404, "text/html"],
  ["/media/kutarya-studio.png", 200, "image/png"],
  [
    "/games/paket-denemesi/1.0.0/header-check.js.gz",
    200,
    "application/javascript",
    "gzip",
  ],
  [
    "/games/paket-denemesi/1.0.0/header-check.js.br",
    200,
    "application/javascript",
    "br",
  ],
  [
    "/games/paket-denemesi/1.0.0/header-check.wasm.gz",
    200,
    "application/wasm",
    "gzip",
  ],
  [
    "/games/paket-denemesi/1.0.0/header-check.wasm.br",
    200,
    "application/wasm",
    "br",
  ],
]) {
  const r = await fetch("http://127.0.0.1:5182" + route, { method: "HEAD" });
  assert.equal(r.status, status, route);
  assert.ok(r.headers.get("content-type")?.includes(type), route + ": MIME");
  if (encoding) {
    assert.equal(r.headers.get("content-encoding"), encoding);
    assert.equal(r.headers.get("access-control-allow-origin"), "*");
  }
  results.push({
    route,
    status: r.status,
    type: r.headers.get("content-type"),
    encoding: r.headers.get("content-encoding"),
  });
}
await writeFile(
  "artifacts/hosting-results.json",
  JSON.stringify(
    {
      at: new Date().toISOString(),
      environment: "local-firebase-hosting-emulator",
      production: false,
      results,
    },
    null,
    2,
  ),
);
console.log(
  `Hosting önizlemesi: ${results.length}/${results.length} rota/404/MIME/sıkıştırma kontrolü geçti.`,
);
