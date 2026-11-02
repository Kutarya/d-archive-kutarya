import { lazy, Suspense, useEffect, useState } from "react";
import {
  Link,
  NavLink,
  Navigate,
  Route,
  Routes,
  useLocation,
  useNavigate,
  useParams,
  useSearchParams,
} from "react-router-dom";
import {
  Search,
  Compass,
  FolderOpen,
  Megaphone,
  ArrowRight,
  ArrowUpRight,
  SlidersHorizontal,
  HelpCircle,
  Shield,
  LogOut,
  Menu,
  X,
  Grid2X2,
  List,
  Download,
  Code2,
  Package,
  ExternalLink,
  Check,
  ChevronRight,
  ChevronDown,
  Gamepad2,
} from "lucide-react";
import { useApp } from "./state";
import { Art } from "./components/Art";
import { Gallery } from "./components/Gallery";
import {
  Logo,
  GameCard,
  PageHead,
  Empty,
  Field,
  LaunchLink,
} from "./components/UI";
import { ThemePicker } from "./components/Theme";
import { kinds, kindOf, platforms, fileRoles, sizeLabel } from "./content";
import { api } from "./services/firebase";
import { pageSeo, updatePageSeo } from "./seo.mjs";
import {
  capabilities,
  currentFiles,
  discover,
  primaryDownload,
} from "./discovery.mjs";
import AuthPage from "./pages/Auth";
import GameNight, { GameNightBanner } from "./pages/GameNight";
import Discovery, { DiscoveryPaths } from "./pages/Discovery";
import Updates, { RecentReleases } from "./pages/Updates";
import type { ProjectFile } from "./types";
const Player = lazy(() => import("./pages/Player"));
const Admin = lazy(() => import("./pages/Admin"));
function Shell() {
  const { catalog, user, admin, logout, local, toast } = useApp();
  const [search, setSearch] = useState(""),
    [menu, setMenu] = useState(false);
  const navigate = useNavigate(),
    location = useLocation();
  const special = /^\/(admin|auth)(\/|$)/.test(location.pathname);
  useEffect(() => {
    setMenu(false);
    window.scrollTo(0, 0);
  }, [location.pathname]);
  useEffect(() => {
    setSearch(new URLSearchParams(location.search).get("q") || "");
  }, [location.search]);
  useEffect(() => {
    if (!menu) return;
    const close = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setMenu(false);
        document.getElementById("navigation-toggle")?.focus();
      }
    };
    document.addEventListener("keydown", close);
    return () => document.removeEventListener("keydown", close);
  }, [menu]);
  return (
    <>
      <a className="skip-link" href="#main">
        İçeriğe geç
      </a>
      <header className="topbar">
        <button
          id="navigation-toggle"
          className="mobile-menu icon-button"
          aria-label={menu ? "Menüyü kapat" : "Menüyü aç"}
          aria-expanded={menu}
          aria-controls="site-navigation"
          onClick={() => setMenu(!menu)}
        >
          {menu ? <X /> : <Menu />}
        </button>
        <Logo />
        <nav className="header-nav">
          <NavLink to="/" end>
            Keşfet
          </NavLink>
          <NavLink to="/projeler">Projeler</NavLink>
          <NavLink to="/oyun-gecesi">Oyun Gecesi</NavLink>
          <NavLink to="/duyurular">Günlük</NavLink>
        </nav>
        <form
          className="header-search"
          role="search"
          aria-label="Sitede proje ara"
          onSubmit={(e) => {
            e.preventDefault();
            const query = search.trim();
            navigate(
              query ? `/projeler?q=${encodeURIComponent(query)}` : "/projeler",
            );
            setMenu(false);
          }}
        >
          <Search size={17} />
          <input
            type="search"
            name="q"
            aria-label="Proje ara"
            placeholder="Proje, teknoloji, fikir…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <button
            type="submit"
            className="icon-button"
            aria-label="Aramayı yap"
          >
            <ArrowRight size={17} />
          </button>
        </form>
        <ThemePicker />
        {admin && !special && (
          <Link className="button small" to="/admin">
            Yönetim <Shield size={15} />
          </Link>
        )}
        {user && special && (
          <button
            className="icon-button"
            aria-label="Çıkış yap"
            title="Çıkış yap"
            onClick={() => logout().catch((e) => toast(e.message))}
          >
            <LogOut size={18} />
          </button>
        )}
      </header>
      {menu && (
        <button
          className="menu-backdrop"
          aria-label="Menüyü kapat"
          onClick={() => setMenu(false)}
        />
      )}
      <div className={`app-layout ${special ? "special-layout" : ""}`}>
        <aside
          id="site-navigation"
          aria-label="Site gezinmesi"
          onClick={(event) => {
            if ((event.target as Element).closest("a")) setMenu(false);
          }}
          className={`sidebar ${menu ? "open" : ""} ${special ? "special-sidebar" : ""}`}
        >
          <span className="nav-label">KEŞİF ALANI</span>
          <nav>
            <NavLink to="/" end>
              <Compass size={18} /> Genel bakış
            </NavLink>
            <NavLink to="/projeler">
              <FolderOpen size={18} /> Tüm projeler{" "}
              <small>{catalog.games.length}</small>
            </NavLink>
            <NavLink to="/duyurular">
              <Megaphone size={18} /> Günlük ve yenilikler
            </NavLink>
            <NavLink to="/kesif">
              <Compass size={18} /> Rotanı bul
            </NavLink>
            <NavLink to="/oyun-gecesi">
              <Gamepad2 size={18} /> Oyun Gecesi
            </NavLink>
          </nav>
          <span className="nav-label">İÇERİK TÜRLERİ</span>
          <nav>
            {kinds.map((k) => (
              <NavLink key={k.id} to={`/koleksiyon/${k.id}`}>
                <k.icon size={17} />
                {k.name}
                <small>
                  {catalog.games.filter((g) => g.kind === k.id).length}
                </small>
              </NavLink>
            ))}
          </nav>
          <div className="sidebar-bottom">
            <div className="tiny-card">
              <Code2 size={22} />
              <strong>Bir fikirden daha fazlası.</strong>
              <p>Oyunlar, uygulamalar ve onları oluşturan kaynaklar.</p>
            </div>
            <NavLink to="/destek">
              <HelpCircle size={17} /> Yardım & iletişim
            </NavLink>
            {admin && (
              <NavLink to="/admin">
                <Shield size={17} /> Yönetim paneli
              </NavLink>
            )}
            {user && (
              <button
                className="text-button"
                onClick={() => logout().catch((e) => toast(e.message))}
              >
                <LogOut size={16} /> Çıkış yap
              </button>
            )}
            <span className="side-copyright">
              © 2026 Kutarya {local && "· Yerel önizleme"}
            </span>
          </div>
        </aside>
        <main id="main" className="main-content">
          <Content />
        </main>
      </div>
      <footer className="site-footer">
        <span>
          Üret. Paylaş. Keşfet. <b>Kutarya.</b>
        </span>
        <div>
          <Link to="/gizlilik">Gizlilik</Link>
          <Link to="/kullanim-kosullari">Kullanım koşulları</Link>
          <Link to="/destek">İletişim</Link>
        </div>
      </footer>
    </>
  );
}
function Home() {
  const { catalog, admin } = useApp();
  const projects = discover(catalog.games);
  const list = projects.slice(0, 6);
  const spotlight =
    projects.find((project) => project.featured && project.cover) ||
    projects[0];
  const collections = kinds.filter((kind) =>
    projects.some((project) => project.kind === kind.id),
  );
  const browserCount = projects.filter(
    (project) => capabilities(project).browser,
  ).length;
  const sourceCount = projects.filter(
    (project) => capabilities(project).source,
  ).length;
  return (
    <>
      <section
        className="discovery-hero"
        aria-label="Kutarya projelerini keşfet"
      >
        <div className="discovery-copy">
          <span className="eyebrow">KUTARYA / BAĞIMSIZ PROJELER</span>
          <h1>
            Oyna. Üret.
            <br />
            <span>Yeni şeyler keşfet.</span>
          </h1>
          <p>
            Küçük bir araç, yeni bir oyun ya da kurcalayacağın bir kaynak kod.
            Kutarya’da yapılanları keşfet, sana uygun olanı dene.
          </p>
          <div className="hero-actions">
            <Link to="/projeler" className="button">
              Projeleri keşfet <ArrowUpRight size={18} />
            </Link>
            {browserCount > 0 && (
              <Link to="/projeler?olanak=browser" className="quiet-link">
                Tarayıcıda dene <ArrowRight size={16} />
              </Link>
            )}
          </div>
          {projects.length > 0 && (
            <dl className="discovery-stats" aria-label="Katalog özeti">
              <div>
                <dt>proje</dt>
                <dd>{projects.length}</dd>
              </div>
              <div>
                <dt>tarayıcı deneyimi</dt>
                <dd>{browserCount}</dd>
              </div>
              <div>
                <dt>kaynak kod sunan proje</dt>
                <dd>{sourceCount}</dd>
              </div>
            </dl>
          )}
        </div>
        {spotlight && (
          <article
            className="spotlight"
            style={{ "--game-color": spotlight.color } as React.CSSProperties}
          >
            <div className="spotlight-label">
              <span className="small-line" /> PROJE VİTRİNİ
            </div>
            <Link
              className="spotlight-media"
              to={`/proje/${spotlight.slug}`}
              aria-label={`${spotlight.title} projesini incele`}
            >
              <Art
                kind={spotlight.cover}
                priority
                className={spotlight.kind === "mobile" ? "mobile-cover" : ""}
              />
            </Link>
            <div className="spotlight-copy">
              <div className="spotlight-meta">
                <span>{kindOf(spotlight).singular}</span>
                <span>v{spotlight.version}</span>
              </div>
              <h2>
                <Link to={`/proje/${spotlight.slug}`}>
                  {spotlight.title} <ArrowUpRight size={21} />
                </Link>
              </h2>
              <p>{spotlight.subtitle}</p>
              <Link className="quiet-link" to={`/proje/${spotlight.slug}`}>
                Projeyi incele <ArrowRight size={16} />
              </Link>
            </div>
          </article>
        )}
      </section>
      {collections.length > 0 && (
        <nav className="collection-rail" aria-label="Proje koleksiyonları">
          {collections.map((kind) => (
            <Link key={kind.id} to={`/koleksiyon/${kind.id}`}>
              <kind.icon size={17} />
              <span>{kind.name}</span>
              <small>
                {projects.filter((project) => project.kind === kind.id).length}
              </small>
            </Link>
          ))}
        </nav>
      )}
      <DiscoveryPaths />
      <GameNightBanner />
      <div className="section-heading updates-heading">
        <div>
          <span className="eyebrow">KATALOGDAN YENİLİKLER</span>
          <h2>Son güncellenenler</h2>
          <p>Yeni sürümler ve son paylaşımlar, bir arada.</p>
        </div>
        <Link to="/projeler" className="quiet-link">
          Tüm projeler <ArrowRight size={17} />
        </Link>
      </div>
      {list.length ? (
        <div className="game-grid">
          {list.map((g, i) => (
            <GameCard key={g.id} game={g} index={i} />
          ))}
        </div>
      ) : (
        <section className="launch-empty">
          <div className="empty-folder">
            <FolderOpen size={32} />
          </div>
          <div>
            <span className="eyebrow">YENİ BİR BAŞLANGIÇ</span>
            <h3>İlk projeler için yer hazır.</h3>
            <p>
              Yeni oyunlar, uygulamalar ve kaynaklar paylaşıldığında burada
              görünecek.
            </p>
          </div>
          <Link
            to={admin ? "/admin/projeler" : "/duyurular"}
            className="button outline"
          >
            {admin ? "İlk projeni ekle" : "Duyuruları takip et"}
            <ArrowUpRight size={17} />
          </Link>
        </section>
      )}
      <RecentReleases />
      <section className="platform-note">
        <Code2 size={24} />
        <div>
          <h3>Bir de kodun içini keşfet.</h3>
          <p>
            Kaynak paketi veya deposu bulunan oyunları, uygulamaları ve araçları
            birlikte incele.
          </p>
        </div>
        <Link to="/projeler?olanak=source">
          Kaynakları keşfet <ArrowUpRight size={16} />
        </Link>
      </section>
    </>
  );
}
function CatalogPage() {
  const { catalog } = useApp(),
    { slug, kind } = useParams(),
    [params, setParams] = useSearchParams();
  const q = params.get("q") || "",
    selectedKind = kind || params.get("tur") || "",
    category = slug || params.get("kategori") || "",
    platform = params.get("platform") || "",
    sort = params.get("sirala") || "new",
    access = params.get("olanak") || "",
    layout = params.get("gorunum") === "liste" ? "list" : "grid";
  function filter(key: string, v: string, replace = false) {
    const next = new URLSearchParams(params);
    v ? next.set(key, v) : next.delete(key);
    setParams(next, { replace, preventScrollReset: true });
  }
  const type = kinds.find((k) => k.id === selectedKind);
  const accessNames: Record<string, string> = {
    browser: "Tarayıcıda açılan",
    download: "İndirilebilir",
    source: "Kaynak kod sunan",
  };
  const activeFilters = [
    { key: "q", value: q.trim(), label: `Arama: ${q.trim()}` },
    { key: "tur", value: !kind && selectedKind, label: type?.name },
    {
      key: "kategori",
      value: !slug && category,
      label:
        catalog.categories.find((c) => c.id === category)?.name || category,
    },
    {
      key: "platform",
      value: platform,
      label: platforms[platform] || platform,
    },
    { key: "olanak", value: access, label: accessNames[access] || access },
  ].filter((item) => item.value);
  const list = discover(catalog.games, {
    q,
    kind: selectedKind,
    category,
    platform,
    sort,
    access,
  });
  if (kind && !type) return <NotFound />;
  return (
    <>
      <PageHead
        label="PROJE KATALOĞU"
        title={
          type?.name ||
          catalog.categories.find((c) => c.id === category)?.name ||
          "Tüm projeler"
        }
        description={
          type?.description ||
          "Oyun, uygulama ve kaynakları tek bir düzenli katalogda keşfet."
        }
      />
      <div className="catalog-layout">
        <section className="catalog-results" aria-label="Katalog sonuçları">
          <div className="catalog-toolbar">
            <label className="catalog-search">
              <Search size={18} />
              <input
                type="search"
                aria-label="Katalogda ara"
                placeholder="Proje adı, teknoloji veya etiket ara…"
                value={q}
                onChange={(e) => filter("q", e.target.value, true)}
              />
            </label>
            <select
              aria-label="Projeleri sırala"
              value={sort}
              onChange={(e) => filter("sirala", e.target.value)}
            >
              <option value="new">Son güncellenen</option>
              <option value="title">Ada göre</option>
              <option value="featured">Öne çıkanlar</option>
            </select>
            <div className="view-switch">
              <button
                className={layout === "grid" ? "active" : ""}
                aria-label="Kart görünümü"
                aria-pressed={layout === "grid"}
                onClick={() => filter("gorunum", "")}
              >
                <Grid2X2 size={17} />
              </button>
              <button
                className={layout === "list" ? "active" : ""}
                aria-label="Liste görünümü"
                aria-pressed={layout === "list"}
                onClick={() => filter("gorunum", "liste")}
              >
                <List size={17} />
              </button>
            </div>
          </div>
          <details className="catalog-filters panel">
            <summary>
              <SlidersHorizontal size={17} /> Filtreler{" "}
              {activeFilters.length > 0 && (
                <span>{activeFilters.length} seçili</span>
              )}
              <ChevronDown size={17} />
            </summary>
            <div className="catalog-filter-fields">
              <Field label="İçerik türü">
                <select
                  value={selectedKind}
                  disabled={Boolean(kind)}
                  onChange={(e) => filter("tur", e.target.value)}
                >
                  <option value="">Tüm türler</option>
                  {kinds.map((k) => (
                    <option key={k.id} value={k.id}>
                      {k.name}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Kategori">
                <select
                  value={category}
                  disabled={Boolean(slug)}
                  onChange={(e) => filter("kategori", e.target.value)}
                >
                  <option value="">Tüm kategoriler</option>
                  {catalog.categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Platform">
                <select
                  value={platform}
                  onChange={(e) => filter("platform", e.target.value)}
                >
                  <option value="">Tüm platformlar</option>
                  {Object.entries(platforms)
                    .filter(([id]) => id !== "all")
                    .map(([id, name]) => (
                      <option key={id} value={id}>
                        {name}
                      </option>
                    ))}
                </select>
              </Field>
              <Field label="Kullanım olanağı">
                <select
                  value={access}
                  onChange={(e) => filter("olanak", e.target.value)}
                >
                  <option value="">Tüm olanaklar</option>
                  {Object.entries(accessNames).map(([id, name]) => (
                    <option key={id} value={id}>
                      {name}
                    </option>
                  ))}
                </select>
              </Field>
            </div>
          </details>
          {activeFilters.length > 0 && (
            <div className="active-filters" aria-label="Etkin filtreler">
              {activeFilters.map((item) => (
                <button
                  key={item.key}
                  onClick={() => filter(item.key, "")}
                  aria-label={`${item.label} filtresini kaldır`}
                >
                  {item.label}
                  <X size={14} />
                </button>
              ))}
              <button className="clear-filters" onClick={() => setParams({})}>
                Tümünü temizle
              </button>
            </div>
          )}
          <div
            className="results-label"
            role="status"
            aria-live="polite"
            aria-atomic="true"
          >
            <span>
              <b>{list.length}</b> proje bulundu
            </span>
            <span>{type?.name || "Tüm içerikler"}</span>
          </div>
          <div className={`game-grid ${layout === "list" ? "list-view" : ""}`}>
            {list.map((g) => (
              <GameCard key={g.id} game={g} />
            ))}
          </div>
          {!list.length && (
            <Empty
              title={
                activeFilters.length
                  ? "Bu filtrelerle proje bulunamadı."
                  : "Bu koleksiyonda henüz proje yok."
              }
            >
              {activeFilters.length
                ? "Aramanı kısaltabilir veya filtreleri temizleyebilirsin."
                : "Paylaşılan projeler burada listelenecek. Diğer koleksiyonlara da göz atabilirsin."}
              <br />
              <Link to="/projeler">Tüm projelere dön →</Link>
            </Empty>
          )}
        </section>
      </div>
    </>
  );
}
function Detail() {
  const { slug } = useParams(),
    { catalog, toast } = useApp();
  const project = catalog.games.find((g) => g.slug === slug);
  const [params, setParams] = useSearchParams();
  const [busy, setBusy] = useState("");
  const tab =
    params.get("sekme") === "dosyalar"
      ? "files"
      : params.get("sekme") === "surumler"
        ? "updates"
        : "about";
  function selectTab(id: string) {
    const next = new URLSearchParams(params);
    if (id === "about") next.delete("sekme");
    else next.set("sekme", id === "files" ? "dosyalar" : "surumler");
    setParams(next, { preventScrollReset: true });
  }
  function showFiles() {
    selectTab("files");
    requestAnimationFrame(() =>
      document.getElementById("project-tab")?.scrollIntoView({
        block: "start",
        behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
          ? "auto"
          : "smooth",
      }),
    );
  }
  if (!project)
    return (
      <Empty title="Proje bulunamadı.">
        <Link to="/projeler">Projelere dön →</Link>
      </Empty>
    );
  const k = kindOf(project),
    browser = capabilities(project).browser,
    recommended = primaryDownload(project),
    latest = currentFiles(project),
    previous = (project.files || []).filter(
      (file) => file.version !== project.version,
    );
  async function download(fileId: string) {
    setBusy(fileId);
    try {
      const result = await api<{ url: string }>("download", {
        gameId: project!.id,
        fileId,
      });
      const link = document.createElement("a");
      link.href = result.url;
      link.download = "";
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (e: any) {
      toast(e.message);
    } finally {
      setBusy("");
    }
  }
  function renderFile(file: ProjectFile) {
    return (
      <div className="download-row" key={file.id}>
        <span className="file-icon">
          {file.role === "source" ? <Code2 size={23} /> : <Package size={23} />}
        </span>
        <div>
          <strong>{file.name}</strong>
          <small>
            {fileRoles[file.role]} · {platforms[file.platform] || file.platform}{" "}
            · v{file.version} · {sizeLabel(file.size)}
          </small>
        </div>
        <button
          className="button outline small"
          disabled={Boolean(busy)}
          onClick={() => void download(file.id)}
          aria-label={`${file.name} indir`}
        >
          <Download size={15} />
          {busy === file.id ? "Hazırlanıyor…" : "İndir"}
        </button>
      </div>
    );
  }
  return (
    <>
      <div className="breadcrumb">
        <Link to="/projeler">Projeler</Link>
        <ChevronRight size={14} />
        <Link to={`/koleksiyon/${k.id}`}>{k.name}</Link>
        <ChevronRight size={14} />
        <span>{project.title}</span>
      </div>
      <div className="project-heading">
        <div>
          <span className="eyebrow">
            {k.singular} · {project.technology || "Kutarya projesi"}
          </span>
          <h1>{project.title}</h1>
          <p>{project.subtitle}</p>
        </div>
        <div className="project-heading-actions">
          <div>
            {browser && (
              <LaunchLink game={project} className="button">
                {project.kind === "game" ? "Oyunu aç" : "Uygulamayı aç"}
                <ArrowUpRight size={18} />
              </LaunchLink>
            )}
            {recommended && (
              <button
                className={`button ${browser ? "outline" : ""}`}
                disabled={Boolean(busy)}
                onClick={() => void download(recommended.id)}
              >
                <Download size={17} />
                {busy === recommended.id
                  ? "Hazırlanıyor…"
                  : recommended.role === "source"
                    ? "Kaynak kodu indir"
                    : recommended.role === "portable"
                      ? "Paketi indir"
                      : `${platforms[recommended.platform] || recommended.platform} için indir`}
              </button>
            )}
            {Boolean(project.files?.length) && (
              <button className="quiet-link" onClick={showFiles}>
                Tüm dosyalar ({project.files.length})<ChevronRight size={16} />
              </button>
            )}
            {project.repository && (
              <a
                href={project.repository}
                target="_blank"
                rel="noopener noreferrer"
                className="button outline"
              >
                <Code2 size={16} />
                Kaynak deposu
                <ExternalLink size={14} />
              </a>
            )}
          </div>
          {recommended && (
            <small>
              v{recommended.version} · {fileRoles[recommended.role]} ·{" "}
              {platforms[recommended.platform] || recommended.platform} ·{" "}
              {sizeLabel(recommended.size)}
            </small>
          )}
        </div>
      </div>
      <div className="detail-layout" data-kind={project.kind}>
        <div className="detail-body">
          <div className="detail-cover">
            <Art kind={project.cover} priority />
          </div>
          <div
            className="detail-tabs"
            role="tablist"
            aria-label="Proje bölümleri"
          >
            {[
              ["about", "Genel bakış"],
              ["files", `Dosyalar (${project.files?.length || 0})`],
              ["updates", "Sürüm notları"],
            ].map(([id, name]) => (
              <button
                id={`tab-${id}`}
                role="tab"
                aria-controls="project-tab"
                aria-selected={tab === id}
                tabIndex={tab === id ? 0 : -1}
                key={id}
                className={tab === id ? "active" : ""}
                onClick={() => selectTab(id)}
                onKeyDown={(event) => {
                  const ids = ["about", "files", "updates"];
                  const offset =
                    event.key === "ArrowRight"
                      ? 1
                      : event.key === "ArrowLeft"
                        ? -1
                        : 0;
                  if (!offset && !["Home", "End"].includes(event.key)) return;
                  event.preventDefault();
                  const next =
                    event.key === "Home"
                      ? "about"
                      : event.key === "End"
                        ? "updates"
                        : ids[
                            (ids.indexOf(id) + offset + ids.length) % ids.length
                          ];
                  selectTab(next);
                  document.getElementById(`tab-${next}`)?.focus();
                }}
              >
                {name}
              </button>
            ))}
          </div>
          <section
            id="project-tab"
            role="tabpanel"
            aria-labelledby={`tab-${tab}`}
            className="panel project-description"
          >
            {tab === "about" ? (
              <>
                <h2>Proje hakkında</h2>
                <p className="preserve-lines">{project.description}</p>
                {project.controls && (
                  <>
                    <h3>Kullanım / kurulum</h3>
                    <p className="preserve-lines">{project.controls}</p>
                  </>
                )}
                {Boolean(project.gallery?.length) && (
                  <>
                    <h3>Ekran görüntüleri</h3>
                    <Gallery
                      key={project.id}
                      images={project.gallery}
                      title={project.title}
                    />
                  </>
                )}
              </>
            ) : tab === "files" ? (
              <>
                <h2>İndirilebilir dosyalar</h2>
                <p className="muted">
                  Platformuna ve ihtiyacına uygun paketi seç.
                </p>
                {project.files?.length ? (
                  <>
                    <h3 className="current-release">
                      Güncel sürüm <span>v{project.version}</span>
                    </h3>
                    {latest.length ? (
                      latest.map(renderFile)
                    ) : (
                      <p>Bu sürüm için indirilebilir dosya bulunmuyor.</p>
                    )}
                    {previous.length > 0 && (
                      <details className="previous-files">
                        <summary>
                          Önceki sürümler <span>{previous.length} dosya</span>
                          <ChevronDown size={17} />
                        </summary>
                        <p>
                          Bu paketler önceki sürümlere aittir. Güncel sürüm
                          dosyaları yukarıdadır.
                        </p>
                        {[...previous]
                          .sort((a, b) => b.createdAt - a.createdAt)
                          .map(renderFile)}
                      </details>
                    )}
                  </>
                ) : (
                  <Empty title="İndirilebilir paket yok.">
                    Bu proje bir tarayıcı deneyimi veya bağlantıyla paylaşılan
                    bir kaynak olabilir.
                  </Empty>
                )}
              </>
            ) : (
              <>
                <h2>Sürüm {project.version}</h2>
                <p className="preserve-lines">
                  {project.changelog ||
                    "Bu sürüm için ayrıca bir değişiklik notu eklenmedi."}
                </p>
                {project.versions?.map((v) => (
                  <div className="version-row" key={v.id}>
                    <strong>v{v.id}</strong>
                    <span>{v.note}</span>
                    {v.verified && (
                      <span className="status-tag">
                        <Check size={13} /> Paket doğrulandı
                      </span>
                    )}
                  </div>
                ))}
              </>
            )}
          </section>
        </div>
        <aside className="detail-aside">
          <section className="panel project-summary">
            <span className="summary-icon">
              <k.icon size={25} />
            </span>
            <h2>Proje bilgileri</h2>
            <p>{k.singular}</p>
            <dl>
              <div>
                <dt>Sürüm</dt>
                <dd>{project.version}</dd>
              </div>
              <div>
                <dt>Platform</dt>
                <dd>
                  {project.platforms?.map((p) => platforms[p]).join(", ") ||
                    "Belirtilmedi"}
                </dd>
              </div>
              <div>
                <dt>Teknoloji</dt>
                <dd>{project.technology || "Belirtilmedi"}</dd>
              </div>
              <div>
                <dt>Lisans</dt>
                <dd>{project.license || "Belirtilmedi"}</dd>
              </div>
              <div>
                <dt>Güncelleme</dt>
                <dd>
                  {project.updatedAt
                    ? new Date(project.updatedAt).toLocaleDateString("tr")
                    : "—"}
                </dd>
              </div>
            </dl>
            <div className="tag-list">
              {project.tags.map((t) => (
                <span className="chip" key={t}>
                  {t}
                </span>
              ))}
            </div>
          </section>
          {project.requirements && (
            <section className="panel">
              <h3>Sistem gereksinimleri</h3>
              <p className="preserve-lines">{project.requirements}</p>
            </section>
          )}
          <Link className="report-link" to={`/destek?proje=${project.id}`}>
            <HelpCircle size={16} /> Bu projeyle ilgili sorun bildir
          </Link>
        </aside>
      </div>
    </>
  );
}
function Announcements() {
  return <Updates />;
}
function Support() {
  const { catalog, user, toast } = useApp();
  const [params] = useSearchParams();
  const [gameId, setGame] = useState(
      params.get("proje") || params.get("oyun") || "",
    ),
    [email, setEmail] = useState(user?.email || ""),
    [message, setMessage] = useState(""),
    [busy, setBusy] = useState(false),
    [sent, setSent] = useState(false);
  return (
    <>
      <PageHead
        label="YARDIM & İLETİŞİM"
        title="Birlikte daha iyi."
        description="Bir proje hakkında sorun, öneri veya soru. Seni dinliyoruz."
      />
      <div className="support-layout">
        <form
          className="panel form-panel"
          onSubmit={async (e) => {
            e.preventDefault();
            setBusy(true);
            try {
              await api("report", { gameId, email, message });
              setSent(true);
              setMessage("");
            } catch (err: any) {
              toast(err.message);
            } finally {
              setBusy(false);
            }
          }}
        >
          {sent && (
            <div className="success-box" role="status">
              Bildirimin bize ulaştı. Teşekkürler.
            </div>
          )}
          <Field label="İlgili proje">
            <select value={gameId} onChange={(e) => setGame(e.target.value)}>
              <option value="">Site hakkında</option>
              {catalog.games.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.title}
                </option>
              ))}
            </select>
          </Field>
          <Field label="E-posta (isteğe bağlı)">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              maxLength={254}
            />
          </Field>
          <Field label="Mesajın">
            <textarea
              required
              minLength={5}
              maxLength={2000}
              rows={7}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
          </Field>
          <button className="button" disabled={busy}>
            {busy ? "Gönderiliyor…" : "Bildirimi gönder"}
            <ArrowUpRight size={17} />
          </button>
        </form>
        <aside className="panel contact-panel">
          <HelpCircle size={28} />
          <h2>Biraz ayrıntı yardımcı olur.</h2>
          <p>
            Projenin adını, sürümünü, kullandığın cihazı ve karşılaştığın sorunu
            yazabilirsin.
          </p>
          <hr />
          <span className="eyebrow">DOĞRUDAN İLETİŞİM</span>
          <a href={`mailto:${catalog.settings.contact}`}>
            {catalog.settings.contact}
          </a>
        </aside>
      </div>
    </>
  );
}
function Legal() {
  const privacy = useLocation().pathname === "/gizlilik";
  return (
    <>
      <PageHead
        label="KUTARYA"
        title={privacy ? "Gizlilik ve verilerin." : "Kullanım koşulları."}
        description="Projeler, veriler ve paylaşım hakkında."
      />
      <article className="panel prose">
        {privacy ? (
          <>
            <h2>Projeleri keşfetme</h2>
            <p>
              Projeleri incelemek, dosya indirmek ve tarayıcı deneyimlerini
              açmak için hesap gerekmez. Üyelik, kişisel kütüphane ve favoriler
              şu an kullanıma kapalıdır; ziyaretçi profili veya kişisel proje
              geçmişi oluşturulmaz.
            </p>
            <h2>Kullanım ve destek</h2>
            <p>
              Tarayıcı paketlerinin açılış sayıları toplu tutulur. İndirme
              bağlantısı hazırlanması dosyanın tamamen indirildiğini göstermez.
              Destek mesajın, ilgili proje ve paylaştığın e-posta yönetime
              iletilir.
            </p>
            <h2>Tercihler ve silme</h2>
            <p>
              Tema tercihi ve tarayıcı deneyiminin oturum bilgisi cihazında
              saklanır. Yönetici girişi Firebase Authentication kullanır. Önceki
              profil verilerinle ilgili silme talebini iletişim bölümünden
              iletebilirsin.
            </p>
          </>
        ) : (
          <>
            <h2>Projeler ve dosyalar</h2>
            <p>
              Projeler oyun, uygulama veya kaynak kod olarak paylaşılır.
              Platform, kurulum talimatları ve lisans her projenin sayfasında
              belirtilir. Dosyalar tarayıcıda otomatik çalıştırılmaz. İçerikler
              güncellenebilir veya arşivlenebilir.
            </p>
            <h2>Erişim ve paylaşım</h2>
            <p>
              Projeleri inceleme, indirme ve oynama hesap gerektirmez. İçerik
              yükleme ve yayınlama yalnız yetkili yöneticilere aittir.
              Başkasının yönetim erişimini kullanmaya veya servisi bozmaya
              çalışma.
            </p>
            <h2>İçerik hakları</h2>
            <p>
              Kod, uygulama ve görseller hak sahiplerine aittir. Kaynağın
              paylaşılması tek başına sınırsız kullanım izni anlamına gelmez;
              proje lisansını kontrol et.
            </p>
          </>
        )}
        <h2>İletişim</h2>
        <Link to="/destek">Bir sorunu veya talebini bize ilet →</Link>
      </article>
    </>
  );
}
export function NotFound() {
  return (
    <div className="not-found">
      <span>404</span>
      <h1>Bu sayfa bulunamadı.</h1>
      <p>Aradığın sayfa taşınmış veya kaldırılmış olabilir.</p>
      <Link to="/" className="button">
        Ana sayfaya dön <ArrowRight size={17} />
      </Link>
    </div>
  );
}
function LegacyDetail() {
  const { slug } = useParams();
  return <Navigate replace to={`/proje/${slug}`} />;
}
function LegacyAuthAction() {
  const { search } = useLocation();
  // Mevcut yönetici parola yenileme e-postalarının bağlantısı korunur.
  return <Navigate replace to={`/admin/auth/action${search}`} />;
}
function Content() {
  const { loading, error, reload, catalog, catalogAvailable } = useApp(),
    location = useLocation();
  useEffect(() => {
    updatePageSeo(pageSeo(location.pathname + location.search, catalog));
  }, [location.pathname, location.search, catalog]);
  if (loading)
    return (
      <div className="loading">
        <span className="spinner" /> Kutarya hazırlanıyor…
      </div>
    );
  if (error && !catalogAvailable)
    return (
      <div className="panel error-state">
        <h1>Kataloğa bağlanamadık.</h1>
        <p>{error}</p>
        <button className="button" onClick={() => void reload()}>
          Tekrar dene
        </button>
      </div>
    );
  return (
    <>
      {error && (
        <div className="catalog-update-warning" role="status">
          <span>
            Güncellemeler alınamadı. Son yüklenen kataloğu görüntülüyorsun.
          </span>
          <button onClick={() => void reload()}>
            Tekrar dene <ArrowRight size={15} />
          </button>
        </div>
      )}
      {catalog.settings.notice && (
        <div className="notice">{catalog.settings.notice}</div>
      )}
      {catalog.settings.maintenance && (
        <div className="notice">
          Bakım bildirimi: bazı özellikler kısa süreli etkilenebilir.
        </div>
      )}
      <Suspense fallback={<div className="loading">Hazırlanıyor…</div>}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/oyun-gecesi" element={<GameNight />} />
          <Route path="/kesif" element={<Discovery />} />
          <Route path="/projeler" element={<CatalogPage />} />
          <Route path="/koleksiyon/:kind" element={<CatalogPage />} />
          <Route path="/kategori/:slug" element={<CatalogPage />} />
          <Route path="/proje/:slug" element={<Detail />} />
          <Route
            path="/oyunlar"
            element={<Navigate replace to="/koleksiyon/game" />}
          />
          <Route path="/oyun/:slug" element={<LegacyDetail />} />
          <Route path="/oyna/:slug" element={<Player />} />
          <Route path="/admin/auth/:mode" element={<AuthPage />} />
          <Route path="/auth/action" element={<LegacyAuthAction />} />
          <Route path="/auth/*" element={<Navigate replace to="/projeler" />} />
          <Route
            path="/hesabim/*"
            element={<Navigate replace to="/projeler" />}
          />
          <Route
            path="/kutuphanem/*"
            element={<Navigate replace to="/projeler" />}
          />
          <Route path="/admin/*" element={<Admin />} />
          <Route path="/duyurular" element={<Announcements />} />
          <Route path="/destek" element={<Support />} />
          <Route path="/gizlilik" element={<Legal />} />
          <Route path="/kullanim-kosullari" element={<Legal />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </>
  );
}
export default function App() {
  return <Shell />;
}
