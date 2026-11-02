import test from "node:test";
import assert from "node:assert/strict";
import {
  capabilities,
  currentFiles,
  discover,
  primaryDownload,
} from "../src/discovery.mjs";

const file = (id, role, version = "2.0", platform = "windows") => ({
  id,
  role,
  version,
  platform,
});
const project = (id, patch = {}) => ({
  id,
  title: id,
  status: "published",
  kind: "desktop",
  engine: "download",
  subtitle: "",
  tags: [],
  technology: "",
  category: "uygulama",
  platforms: ["windows"],
  version: "2.0",
  files: [],
  runtime: "",
  repository: "",
  updatedAt: 1,
  order: 0,
  ...patch,
});

test("Son güncellemelerde eski öne çıkan yeni projeyi geçmez; kaynak liste değişmez", () => {
  const entries = [
    project("eski", { featured: true, updatedAt: 1 }),
    project("yeni", { updatedAt: 3 }),
  ];
  assert.deepEqual(
    discover(entries).map((p) => p.id),
    ["yeni", "eski"],
  );
  assert.deepEqual(
    discover(entries, { sort: "featured" }).map((p) => p.id),
    ["eski", "yeni"],
  );
  assert.equal(entries[0].id, "eski");
});

test("Türkçe çok kelimeli arama boşluğu kırpar ve kelimeleri farklı alanlarda bulur", () => {
  const entries = [
    project("video", {
      title: "Işık İşlemleri",
      technology: "JavaScript",
      tags: ["DÖNÜŞTÜRME"],
    }),
  ];
  assert.equal(
    discover(entries, { q: "  dönüştürme  ışık  javascript " }).length,
    1,
  );
  assert.equal(discover(entries, { q: "işlemleri" }).length, 1);
  assert.equal(discover(entries, { q: "ışık eksik" }).length, 0);
  assert.equal(discover(entries, { q: "   " }).length, 1);
});

test("Kaynak filtresi mobil/masaüstü paketlerini ve depoları bulur, eski kaynak paketini saymaz", () => {
  const entries = [
    project("mobil", { kind: "mobile", files: [file("s", "source")] }),
    project("depo", { repository: "https://example.org/source" }),
    project("eski", { files: [file("s1", "source", "1.0")] }),
  ];
  assert.deepEqual(
    discover(entries, { access: "source" })
      .map((p) => p.id)
      .sort(),
    ["depo", "mobil"],
  );
});

test("Tarayıcı ve indirme filtreleri gerçek runtime ve güncel çalıştırılabilir paket ister", () => {
  const missing = project("eksik", {
    engine: "web",
    files: [file("eski", "installer", "1.0"), file("pdf", "document")],
  });
  assert.deepEqual(capabilities(missing), {
    browser: false,
    download: false,
    source: false,
  });
  const web = project("oyun", {
    engine: "web",
    runtime: "/games/oyun/2.0/index.html",
    files: [file("web", "portable", "2.0", "web")],
  });
  assert.equal(discover([missing, web], { access: "browser" })[0].id, "oyun");
  assert.equal(discover([missing, web], { access: "download" })[0].id, "oyun");
});

test("Birincil indirme güncel kurulumu seçer; eski kuruluma veya yalnız dokümana düşmez", () => {
  const item = project("app", {
    files: [
      file("old", "installer", "1.0"),
      file("portable", "portable"),
      file("setup", "installer"),
    ],
  });
  assert.equal(primaryDownload(item).id, "setup");
  assert.deepEqual(
    currentFiles(item).map((f) => f.id),
    ["portable", "setup"],
  );
  assert.equal(
    primaryDownload(
      project("eski", { files: [file("old", "installer", "1.0")] }),
    ),
    undefined,
  );
  assert.equal(
    primaryDownload(project("belge", { files: [file("doc", "document")] })),
    undefined,
  );
  assert.equal(
    primaryDownload(
      project("kod", { kind: "source", files: [file("s", "source")] }),
    ).id,
    "s",
  );
});

test("Birleşik filtreler taslak/arşivleri göstermez ve eşit tarihleri Türkçe adla sıralar", () => {
  const entries = [
    project("Çatı", { files: [file("s", "source")] }),
    project("Ada", { files: [file("s", "source")] }),
    project("gizli", { status: "draft", files: [file("s", "source")] }),
    project("arşiv", { status: "archived" }),
    project("mobil", { kind: "mobile", platforms: ["android"] }),
  ];
  const result = discover(entries, {
    kind: "desktop",
    category: "uygulama",
    platform: "windows",
    access: "source",
  });
  assert.deepEqual(
    result.map((p) => p.id),
    ["Ada", "Çatı"],
  );
});
