import { useEffect, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Gamepad2,
  Folder,
  Users,
  Megaphone,
  Settings,
  History,
  LifeBuoy,
  Plus,
  ArrowUpRight,
  Save,
  Search,
  ShieldCheck,
  RefreshCw,
} from "lucide-react";
import { useApp } from "../state";
import { api } from "../services/firebase";
import { PageHead, Field, Empty } from "../components/UI";
import ProjectManager from "./ProjectManager";
import { Art } from "../components/Art";
import type { Game, Report, Announcement, Profile } from "../types";
type Data = {
  gamesCatalog: Game[];
  gameCategories: { id: string; name: string; order: number }[];
  gameAnnouncements: Announcement[];
  gameReports: Report[];
  gameProfiles: Profile[];
  gameAdminAudit: {
    id: string;
    uid: string;
    action: string;
    target: string;
    createdAt: number;
  }[];
  gamePlayStats: { id: string; launches: number }[];
};
const links = [
  ["", "Genel bakış", LayoutDashboard],
  ["projeler", "Projeler", Gamepad2],
  ["kategoriler", "Kategoriler", Folder],
  ["kullanicilar", "Kullanıcılar", Users],
  ["destek", "Destek kutusu", LifeBuoy],
  ["duyurular", "Duyurular", Megaphone],
  ["ayarlar", "Site ayarları", Settings],
  ["gecmis", "İşlem geçmişi", History],
] as const;
export default function Admin() {
  const { admin, user, authLoading, catalog, reload, toast } = useApp();
  const [data, setData] = useState<Data | null>(null),
    [busy, setBusy] = useState(false),
    [error, setError] = useState("");
  const section = useLocation().pathname.split("/")[2] || "";
  async function load() {
    setError("");
    try {
      setData(await api<Data>("admin.data"));
    } catch (e: any) {
      setError(e.message);
    }
  }
  useEffect(() => {
    if (admin) void load();
  }, [admin]);
  async function save(op: string, payload: Record<string, unknown>) {
    setBusy(true);
    try {
      await api(op, payload);
      await Promise.all([load(), reload()]);
      toast("Değişiklik kaydedildi.");
      return true;
    } catch (e: any) {
      toast(e.message);
      return false;
    } finally {
      setBusy(false);
    }
  }
  if (authLoading)
    return <div className="loading">Yetki kontrol ediliyor…</div>;
  if (!user)
    return (
      <>
        <PageHead
          label="KUTARYA YÖNETİMİ"
          title="Yönetim alanı."
          description="Devam etmek için yetkili Kutarya hesabınla giriş yap."
        />
        <Link to="/admin/auth/login" className="button">
          Yönetici girişi <ArrowUpRight size={16} />
        </Link>
      </>
    );
  if (!admin)
    return (
      <Empty title="Bu alan yöneticilere ait.">
        Hesabında proje yönetimi yetkisi bulunmuyor.{" "}
        <Link to="/">Keşif alanına dön.</Link>
      </Empty>
    );
  return (
    <>
      <div className="admin-header">
        <div>
          <span className="eyebrow">
            <ShieldCheck size={14} /> KUTARYA YÖNETİMİ
          </span>
          <h1>Kutarya’yı yönet.</h1>
        </div>
        <button className="button outline small" onClick={() => void load()}>
          <RefreshCw size={16} /> Yenile
        </button>
      </div>
      <div className="admin-workspace">
        <nav className="admin-tabs" aria-label="Yönetim bölümleri">
          {links.map(([path, title, Icon]) => (
            <NavLink
              end={path === ""}
              key={path}
              to={`/admin${path ? "/" + path : ""}`}
            >
              <Icon size={16} />
              {title}
            </NavLink>
          ))}
        </nav>
        <div className="admin-main">
          {error ? (
            <div className="error-box">
              {error}
              <button onClick={() => void load()}>Tekrar dene</button>
            </div>
          ) : !data ? (
            <div className="loading">Yönetim verileri yükleniyor…</div>
          ) : section === "projeler" || section === "oyunlar" ? (
            <ProjectManager
              data={data}
              save={save}
              busy={busy}
              refresh={async () => {
                await Promise.all([load(), reload()]);
              }}
            />
          ) : section === "kategoriler" ? (
            <Categories data={data} save={save} busy={busy} />
          ) : section === "duyurular" ? (
            <News data={data} save={save} busy={busy} />
          ) : section === "ayarlar" ? (
            <SiteSettings save={save} busy={busy} />
          ) : section === "kullanicilar" ? (
            <>
              <div className="section-heading">
                <h2>Üye profilleri</h2>
                <span>{data.gameProfiles.length} profil</span>
              </div>
              <div className="admin-table">
                <div className="table-row table-head">
                  <span>Üye</span>
                  <span>Oluşturulma</span>
                  <span>Durum / işlem</span>
                </div>
                {data.gameProfiles.map((p) => (
                  <div className="table-row" key={p.uid}>
                    <span>
                      <strong>{p.displayName}</strong>
                      <small>{p.uid}</small>
                    </span>
                    <span>{date(p.createdAt)}</span>
                    <button
                      className="button small outline"
                      onClick={() =>
                        void save("admin.user", {
                          uid: p.uid,
                          suspended: !p.suspended,
                        })
                      }
                    >
                      {p.suspended
                        ? "Kısıtı kaldır"
                        : "Üye işlemlerini kısıtla"}
                    </button>
                  </div>
                ))}
              </div>
              <p className="muted">
                Kısıt yalnız paylaşım sitesindeki üye işlemlerini etkiler. Ortak
                Kutarya hesabı diğer ürünlerde devre dışı bırakılmaz.
              </p>
            </>
          ) : section === "destek" ? (
            <Reports data={data} save={save} busy={busy} />
          ) : section === "gecmis" ? (
            <>
              <h2>İşlem geçmişi</h2>
              <div className="admin-table">
                <div className="table-row table-head">
                  <span>İşlem / hedef</span>
                  <span>Yönetici</span>
                  <span>Tarih</span>
                </div>
                {[...data.gameAdminAudit]
                  .sort((a, b) => b.createdAt - a.createdAt)
                  .map((a) => (
                    <div className="table-row" key={a.id}>
                      <span>
                        <strong>{a.action.replace("admin.", "")}</strong>
                        <small>{a.target}</small>
                      </span>
                      <span className="mono">{a.uid.slice(0, 16)}…</span>
                      <span>{date(a.createdAt)}</span>
                    </div>
                  ))}
              </div>
              {!data.gameAdminAudit.length && (
                <Empty title="Henüz işlem yok.">
                  Yönetim değişiklikleri burada kaydedilir.
                </Empty>
              )}
            </>
          ) : (
            <>
              <div className="stats-grid">
                {[
                  [
                    "Yayınlı proje",
                    data.gamesCatalog.filter((g) => g.status === "published")
                      .length,
                  ],
                  [
                    "Taslak",
                    data.gamesCatalog.filter((g) => g.status === "draft")
                      .length,
                  ],
                  ["Üye profili", data.gameProfiles.length],
                  [
                    "Açık bildirim",
                    data.gameReports.filter((r) => r.status !== "closed")
                      .length,
                  ],
                ].map(([label, value]) => (
                  <article className="stat-card" key={label}>
                    <span>{label}</span>
                    <strong>{value}</strong>
                  </article>
                ))}
              </div>
              <div className="admin-columns">
                <section className="panel">
                  <h2>Tarayıcı deneyimleri</h2>
                  <p className="muted">
                    Tarayıcı paketlerinin açılış sayıları. Tamamlanan indirmeler
                    ve aktif kullanıcılar ayrıca ölçülmez.
                  </p>
                  {data.gamesCatalog
                    .filter((g) => ["web", "unity"].includes(g.engine))
                    .map((g) => (
                      <div className="stat-game" key={g.id}>
                        <Art kind={g.cover} />
                        <span>
                          <strong>{g.title}</strong>
                          <small>
                            {g.status === "published"
                              ? "Yayında"
                              : "Taslak / arşiv"}
                          </small>
                        </span>
                        <b>
                          {data.gamePlayStats.find((s) => s.id === g.id)
                            ?.launches || 0}
                        </b>
                      </div>
                    ))}
                  {!data.gamesCatalog.some((g) =>
                    ["web", "unity"].includes(g.engine),
                  ) && (
                    <p className="muted">
                      Henüz bir tarayıcı projesi eklenmedi.
                    </p>
                  )}
                </section>
                <section className="panel">
                  <h2>Kontrol merkezi</h2>
                  <div className="quick-actions">
                    <Link to="/admin/projeler">
                      <Gamepad2 />
                      Projelerini düzenle
                      <ArrowUpRight />
                    </Link>
                    <Link to="/admin/duyurular">
                      <Megaphone />
                      Bir duyuru yayınla
                      <ArrowUpRight />
                    </Link>
                    <Link to="/admin/destek">
                      <LifeBuoy />
                      Destek kutusuna bak
                      <ArrowUpRight />
                    </Link>
                  </div>
                  <p className="muted">
                    {catalog.settings.maintenance
                      ? "Bakım bildirimi açık."
                      : "Paylaşım alanı ziyaretçilere açık."}
                  </p>
                </section>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}
type Props = {
  data: Data;
  save: (op: string, p: Record<string, unknown>) => Promise<boolean>;
  busy: boolean;
};
function Categories({ data, save, busy }: Props) {
  const [value, setValue] = useState({ id: "", name: "", order: 0 });
  return (
    <>
      <h2>Kategoriler</h2>
      <form
        className="panel form-grid"
        onSubmit={async (e) => {
          e.preventDefault();
          if (await save("admin.category", value))
            setValue({ id: "", name: "", order: 0 });
        }}
      >
        <Field label="Kimlik">
          <input
            required
            pattern="[a-z0-9-]+"
            value={value.id}
            onChange={(e) => setValue({ ...value, id: e.target.value })}
          />
        </Field>
        <Field label="Kategori adı">
          <input
            required
            maxLength={40}
            value={value.name}
            onChange={(e) => setValue({ ...value, name: e.target.value })}
          />
        </Field>
        <Field label="Sıra">
          <input
            type="number"
            min="0"
            value={value.order}
            onChange={(e) =>
              setValue({ ...value, order: Number(e.target.value) })
            }
          />
        </Field>
        <button className="button" disabled={busy}>
          Kaydet
        </button>
      </form>
      <div className="admin-table">
        {data.gameCategories.map((c) => (
          <div className="table-row" key={c.id}>
            <strong>{c.name}</strong>
            <span>
              {data.gamesCatalog.filter((g) => g.category === c.id).length}{" "}
              proje
            </span>
            <div className="inline-actions">
              <button className="text-button" onClick={() => setValue(c)}>
                Düzenle
              </button>
              <button
                className="text-button danger-text"
                onClick={() =>
                  void save("admin.category", { id: c.id, remove: true })
                }
              >
                Kaldır
              </button>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
function News({ data, save, busy }: Props) {
  const empty = { id: "", title: "", body: "", status: "draft", createdAt: 0 };
  const [value, setValue] = useState(empty);
  return (
    <>
      <h2>Duyurular</h2>
      <form
        className="panel form-panel"
        onSubmit={async (e) => {
          e.preventDefault();
          if (await save("admin.announcement", value)) setValue(empty);
        }}
      >
        <Field label="Başlık">
          <input
            value={value.title}
            required
            maxLength={150}
            onChange={(e) => setValue({ ...value, title: e.target.value })}
          />
        </Field>
        <Field label="İçerik">
          <textarea
            rows={5}
            value={value.body}
            required
            maxLength={5000}
            onChange={(e) => setValue({ ...value, body: e.target.value })}
          />
        </Field>
        <Field label="Durum">
          <select
            value={value.status}
            onChange={(e) => setValue({ ...value, status: e.target.value })}
          >
            <option value="draft">Taslak</option>
            <option value="published">Yayında</option>
          </select>
        </Field>
        <div className="inline-actions">
          <button className="button" disabled={busy}>
            Kaydet
          </button>
          {value.id && (
            <button
              className="text-button"
              type="button"
              onClick={() => setValue(empty)}
            >
              Yeni duyuru
            </button>
          )}
        </div>
      </form>
      <div className="admin-table">
        {data.gameAnnouncements.map((a) => (
          <div className="table-row" key={a.id}>
            <strong>{a.title}</strong>
            <span>{a.status === "published" ? "Yayında" : "Taslak"}</span>
            <button className="text-button" onClick={() => setValue(a)}>
              Düzenle
            </button>
          </div>
        ))}
      </div>
    </>
  );
}
function SiteSettings({ save, busy }: Pick<Props, "save" | "busy">) {
  const { catalog } = useApp();
  const [s, setS] = useState(catalog.settings);
  return (
    <>
      <h2>Site ayarları</h2>
      <form
        className="panel form-panel"
        onSubmit={(e) => {
          e.preventDefault();
          void save("admin.settings", { settings: s });
        }}
      >
        {[
          ["title", "Site adı"],
          ["tagline", "Slogan"],
          ["notice", "Duyuru bandı"],
          ["contact", "İletişim e-postası"],
        ].map(([key, label]) => (
          <Field key={key} label={label}>
            <input
              value={s[key as keyof typeof s] as string}
              onChange={(e) => setS({ ...s, [key]: e.target.value })}
              type={key === "contact" ? "email" : "text"}
              required={key !== "notice"}
            />
          </Field>
        ))}
        <label className="check-label">
          <input
            type="checkbox"
            checked={s.maintenance}
            onChange={(e) => setS({ ...s, maintenance: e.target.checked })}
          />{" "}
          Bakım bilgilendirmesi göster
        </label>
        <p className="muted">
          Bu ayar bilgilendirme bandıdır; erişim engeli oluşturmaz.
        </p>
        <button className="button" disabled={busy}>
          Ayarları kaydet
        </button>
      </form>
    </>
  );
}
function Reports({ data, save, busy }: Props) {
  const [editing, setEditing] = useState<Report | null>(null);
  return (
    <>
      <h2>Destek kutusu</h2>
      {editing && (
        <form
          className="panel form-panel"
          onSubmit={async (e) => {
            e.preventDefault();
            if (
              await save("admin.report", {
                id: editing.id,
                status: editing.status,
                note: editing.note || "",
              })
            )
              setEditing(null);
          }}
        >
          <h3>{editing.gameId || "Site bildirimi"}</h3>
          <p>{editing.message}</p>
          <span className="muted">
            {editing.email || "E-posta belirtilmemiş"}
          </span>
          <Field label="Durum">
            <select
              value={editing.status}
              onChange={(e) =>
                setEditing({ ...editing, status: e.target.value })
              }
            >
              <option value="open">Açık</option>
              <option value="reviewing">İnceleniyor</option>
              <option value="closed">Kapalı</option>
            </select>
          </Field>
          <Field label="Yönetici notu">
            <textarea
              rows={3}
              value={editing.note || ""}
              onChange={(e) => setEditing({ ...editing, note: e.target.value })}
            />
          </Field>
          <div className="inline-actions">
            <button className="button" disabled={busy}>
              Kaydet
            </button>
            <button
              type="button"
              className="text-button"
              onClick={() => setEditing(null)}
            >
              Vazgeç
            </button>
          </div>
        </form>
      )}
      <div className="admin-table">
        {data.gameReports.map((r) => (
          <div className="table-row" key={r.id}>
            <span>
              <strong>{r.gameId || "Site"}</strong>
              <small>{r.message.slice(0, 85)}</small>
            </span>
            <span>
              {r.status === "open"
                ? "Açık"
                : r.status === "reviewing"
                  ? "İnceleniyor"
                  : "Kapalı"}
              <small>{date(r.createdAt)}</small>
            </span>
            <button className="text-button" onClick={() => setEditing(r)}>
              İncele
            </button>
          </div>
        ))}
      </div>
      {!data.gameReports.length && (
        <Empty title="Destek kutun boş.">
          Gelen bildirimler burada görünecek.
        </Empty>
      )}
    </>
  );
}
function date(n: number) {
  return new Date(n).toLocaleString("tr-TR", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}
