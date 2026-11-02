import { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { ref, uploadBytesResumable, type UploadTask } from "firebase/storage";
import {
  ArrowLeft,
  ArrowUpRight,
  Check,
  FileText,
  Image,
  Package,
  Plus,
  Save,
  Search,
  Settings2,
  Trash2,
  Upload,
  X,
  FolderOpen,
  Code2,
  Eye,
} from "lucide-react";
import { api, storage } from "../services/firebase";
import { useApp } from "../state";
import { Art } from "../components/Art";
import { Empty, Field } from "../components/UI";
import { kinds, kindOf, platforms, fileRoles, sizeLabel } from "../content";
import type { Game, ProjectFile } from "../types";
import { ProjectPreview } from "../components/ProjectPreview";
import { Modal } from "../components/Modal";
import { editSnapshot } from "../project-edit.mjs";
type Props = {
  data: {
    gamesCatalog: Game[];
    gameCategories: { id: string; name: string; order: number }[];
  };
  save: (op: string, p: Record<string, unknown>) => Promise<boolean>;
  busy: boolean;
  refresh: () => Promise<void>;
};
const blank: Game = {
  id: "",
  slug: "",
  title: "",
  subtitle: "",
  description: "",
  category: "",
  tags: [],
  kind: "desktop",
  engine: "download",
  technology: "",
  platforms: ["windows"],
  license: "",
  repository: "",
  requirements: "",
  changelog: "",
  gallery: [],
  files: [],
  runtime: "",
  cover: "",
  color: "#c2673b",
  devices: ["desktop"],
  controls: "",
  status: "draft",
  version: "1.0.0",
  versions: [],
  featured: false,
  difficulty: "",
  duration: "",
  order: 0,
};
function slugify(value: string) {
  return value
    .toLocaleLowerCase("tr")
    .replaceAll("ı", "i")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 64);
}
const tabs = [
  ["info", "Proje bilgileri", FileText],
  ["media", "Görseller", Image],
  ["files", "Dosyalar", Package],
  ["details", "Teknik ayrıntılar", Code2],
  ["release", "Yayın ayarları", Settings2],
] as const;
export default function ProjectManager({ data, save, busy, refresh }: Props) {
  const { toast } = useApp();
  const navigate = useNavigate(),
    location = useLocation();
  const [baseline, setBaseline] = useState("");
  const [preview, setPreview] = useState(false);
  const [leaveTo, setLeaveTo] = useState<string | null>(null);
  const [edit, setEdit] = useState<Game | null>(null),
    [q, setQ] = useState(""),
    [filter, setFilter] = useState("all"),
    [tab, setTab] = useState("info"),
    [uploading, setUploading] = useState(false),
    [progress, setProgress] = useState(0),
    [paused, setPaused] = useState(false),
    [taskReady, setTaskReady] = useState(false),
    [mediaBusy, setMediaBusy] = useState(false),
    [fileRole, setFileRole] = useState("installer"),
    [filePlatform, setFilePlatform] = useState("windows"),
    [fileVersion, setFileVersion] = useState("1.0.0");
  const task = useRef<UploadTask | null>(null);
  const dirty = Boolean(edit && editSnapshot(edit) !== baseline);
  useEffect(() => {
    if (!dirty && !uploading && !mediaBusy && !busy) return;
    const unload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = "";
    };
    const linkClick = (event: MouseEvent) => {
      if (
        event.defaultPrevented ||
        event.button !== 0 ||
        event.ctrlKey ||
        event.metaKey ||
        event.shiftKey ||
        event.altKey
      )
        return;
      const link =
        event.target instanceof Element
          ? (event.target.closest("a[href]") as HTMLAnchorElement | null)
          : null;
      if (!link || link.target === "_blank" || link.hasAttribute("download"))
        return;
      const next = new URL(link.href, window.location.href);
      if (next.origin !== window.location.origin) return;
      const path = next.pathname + next.search + next.hash;
      if (path === location.pathname + location.search + location.hash) return;
      event.preventDefault();
      event.stopPropagation();
      setLeaveTo(path);
    };
    window.addEventListener("beforeunload", unload);
    document.addEventListener("click", linkClick, true);
    return () => {
      window.removeEventListener("beforeunload", unload);
      document.removeEventListener("click", linkClick, true);
    };
  }, [dirty, uploading, mediaBusy, busy, location]);
  // Bu SDK sürümünde cancel() duraklatılmış görevde false döner. Önce sürdürüp hemen iptal et.
  function cancelTask() {
    const active = task.current;
    if (!active) return;
    if (active.snapshot.state === "paused") active.resume();
    active.cancel();
  }
  useEffect(
    () => () => {
      cancelTask();
    },
    [],
  );
  useEffect(() => {
    if (!edit) return;
    const current = data.gamesCatalog.find((g) => g.id === edit.id);
    if (current)
      setEdit((e) =>
        e
          ? {
              ...e,
              files: current.files || [],
              versions: current.versions || [],
            }
          : e,
      );
  }, [data]);
  function field(key: keyof Game, value: unknown) {
    setEdit((e) => ({ ...e!, [key]: value }));
  }
  function open(project: Game) {
    const next = {
      ...project,
      files: project.files || [],
      gallery: project.gallery || [],
    };
    setEdit(next);
    setBaseline(editSnapshot(next));
    setTab("info");
    setFileVersion(project.version);
  }
  async function image(file: File, gallery = false) {
    if (file.size > 1024 * 1024) {
      toast("Görsel en fazla 1 MB olmalı.");
      return;
    }
    setMediaBusy(true);
    try {
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result).split(",")[1]);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
      const result = await api<{ url: string }>("admin.cover", {
        mime: file.type,
        base64,
      });
      setEdit((e) =>
        e
          ? {
              ...e,
              ...(gallery
                ? { gallery: [...e.gallery, result.url] }
                : { cover: result.url }),
            }
          : e,
      );
      toast("Görsel yüklendi. Projeyi kaydederek uygula.");
    } catch (e: any) {
      toast(e.message);
    } finally {
      setMediaBusy(false);
    }
  }
  async function upload(file: File) {
    if (!edit) return;
    const projectId = edit.id;
    let ticket: { fileId: string; path: string } | null = null;
    setUploading(true);
    setProgress(0);
    setPaused(false);
    setTaskReady(false);
    try {
      ticket = await api("admin.fileBegin", {
        gameId: projectId,
        name: file.name,
        size: file.size,
        role: fileRole,
        platform: filePlatform,
        version: fileVersion,
      });
      const current = uploadBytesResumable(ref(storage, ticket!.path), file, {
        contentType: "application/octet-stream",
      });
      task.current = current;
      setTaskReady(true);
      await new Promise<void>((resolve, reject) =>
        current.on(
          "state_changed",
          (s) => {
            setProgress(Math.round((100 * s.bytesTransferred) / s.totalBytes));
            setPaused(s.state === "paused");
          },
          reject,
          () => resolve(),
        ),
      );
      const result = await api<{ file: ProjectFile }>("admin.fileComplete", {
        gameId: projectId,
        fileId: ticket!.fileId,
      });
      setEdit((e) =>
        e?.id === projectId ? { ...e, files: [...e.files, result.file] } : e,
      );
      await refresh();
      toast("Dosya kontrol edildi ve projeye eklendi.");
    } catch (e: any) {
      if (ticket)
        try {
          await api("admin.fileAbort", {
            gameId: projectId,
            fileId: ticket.fileId,
          });
        } catch {
          /* Tamamlanmış kayıt silinmez. */
        }
      toast(
        e.code === "storage/canceled" ? "Yükleme iptal edildi." : e.message,
      );
    } finally {
      setUploading(false);
      setTaskReady(false);
      task.current = null;
    }
  }
  const persisted = Boolean(
    edit && data.gamesCatalog.some((g) => g.id === edit.id),
  );
  if (edit)
    return (
      <form
        className="project-editor"
        onSubmit={async (e) => {
          e.preventDefault();
          if (await save("admin.game", { game: edit })) {
            setBaseline(editSnapshot(edit));
            toast(
              edit.status === "published"
                ? "Proje yayınlandı."
                : "Proje kaydedildi. Dosya ve görselleri eklemeye devam edebilirsin.",
            );
          }
        }}
      >
        <div className="editor-header">
          <div>
            <button
              className="back-link"
              type="button"
              disabled={uploading || mediaBusy || busy}
              onClick={() => (dirty ? setLeaveTo("") : setEdit(null))}
            >
              <ArrowLeft size={16} /> Projelere dön
            </button>
            <h2>{persisted ? edit.title : "Yeni bir proje"}</h2>
          </div>
          <div className="inline-actions">
            <span className="editor-save-state" role="status">
              {dirty
                ? "Kaydedilmemiş değişiklikler"
                : persisted
                  ? "Değişiklikler kaydedildi"
                  : "Yeni taslak"}
            </span>
            <button
              type="button"
              className="button outline small"
              onClick={() => setPreview(true)}
            >
              <Eye size={16} />
              Önizle
            </button>
            <span className={`status-tag ${edit.status}`}>
              {edit.status === "published"
                ? "Yayında"
                : edit.status === "archived"
                  ? "Arşiv"
                  : "Taslak"}
            </span>
            <button
              className="button small"
              disabled={busy || uploading || mediaBusy}
            >
              <Save size={16} />
              {busy ? "Kaydediliyor…" : "Projeyi kaydet"}
            </button>
          </div>
        </div>
        <div className="editor-tabs">
          {tabs.map(([id, label, Icon]) => (
            <button
              type="button"
              key={id}
              className={tab === id ? "active" : ""}
              onClick={() => setTab(id)}
            >
              <Icon size={16} />
              {label}
            </button>
          ))}
        </div>
        <div className="editor-layout">
          <section className="panel editor-content">
            {tab === "info" && (
              <>
                <span className="eyebrow">01 / TEMEL BİLGİLER</span>
                <h3>Projeni tanıtalım.</h3>
                <p className="muted">
                  İnsanların ne indireceğini ve ne beklemesi gerektiğini açıkça
                  anlat.
                </p>
                <Field label="Proje adı">
                  <input
                    required
                    maxLength={70}
                    value={edit.title}
                    onChange={(e) => {
                      const title = e.target.value;
                      setEdit((prev) => ({
                        ...prev!,
                        title,
                        ...(!persisted &&
                        (!prev!.id || prev!.id === slugify(prev!.title))
                          ? { id: slugify(title), slug: slugify(title) }
                          : {}),
                      }));
                    }}
                    placeholder="Projenin adı"
                  />
                </Field>
                <Field label="Kısa açıklama">
                  <input
                    maxLength={120}
                    value={edit.subtitle}
                    onChange={(e) => field("subtitle", e.target.value)}
                    placeholder="Bir cümlede projenin ne yaptığını anlat"
                  />
                </Field>
                <div className="form-grid">
                  <Field label="İçerik türü">
                    <select
                      value={edit.kind}
                      onChange={(e) => field("kind", e.target.value)}
                    >
                      {kinds.map((k) => (
                        <option key={k.id} value={k.id}>
                          {k.singular}
                        </option>
                      ))}
                    </select>
                  </Field>
                  <Field label="Kategori">
                    <select
                      value={edit.category}
                      onChange={(e) => field("category", e.target.value)}
                    >
                      {data.gameCategories.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </Field>
                </div>
                <Field label="Proje açıklaması">
                  <textarea
                    rows={8}
                    maxLength={3000}
                    required
                    value={edit.description}
                    onChange={(e) => field("description", e.target.value)}
                    placeholder="Özellikler, kullanım amacı ve proje hakkında bilgiler…"
                  />
                </Field>
                <Field label="Etiketler (virgülle, en fazla 6)">
                  <input
                    value={edit.tags.join(",")}
                    onChange={(e) =>
                      field("tags", e.target.value.split(",").slice(0, 6))
                    }
                    placeholder=".NET, Unity, JavaScript…"
                  />
                </Field>
              </>
            )}
            {tab === "media" && (
              <>
                <span className="eyebrow">02 / GÖRSELLER</span>
                <h3>Projenin gerçek görünümü.</h3>
                <p className="muted">
                  Gerçek ekran görüntüleri veya hazırladığın kapak. PNG, JPEG,
                  WebP · görsel başına 1 MB.
                </p>
                <div className="media-preview">
                  <Art kind={edit.cover} />
                </div>
                <label className="upload-drop">
                  <Image size={23} />
                  <strong>Kapak görseli seç</strong>
                  <input
                    aria-label="Kapak görseli yükle"
                    type="file"
                    disabled={mediaBusy}
                    accept="image/png,image/jpeg,image/webp"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) void image(file);
                      e.target.value = "";
                    }}
                  />
                </label>
                {edit.cover && (
                  <button
                    type="button"
                    className="text-button"
                    onClick={() => field("cover", "")}
                  >
                    <X size={14} /> Kapağı kaldır
                  </button>
                )}
                <h3>Ekran görüntüleri ({edit.gallery.length}/8)</h3>
                <div className="admin-gallery">
                  {edit.gallery.map((url, i) => (
                    <div key={url}>
                      <img src={url} alt={`Ekran görüntüsü ${i + 1}`} />
                      <button
                        type="button"
                        className="icon-button"
                        aria-label={`${i + 1}. ekran görüntüsünü kaldır`}
                        onClick={() =>
                          field(
                            "gallery",
                            edit.gallery.filter((x) => x !== url),
                          )
                        }
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ))}
                </div>
                <label className="upload-drop small-drop">
                  <Plus size={19} />
                  <strong>Ekran görüntüsü ekle</strong>
                  <input
                    aria-label="Ekran görüntüsü yükle"
                    type="file"
                    disabled={mediaBusy || edit.gallery.length >= 8}
                    accept="image/png,image/jpeg,image/webp"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) void image(file, true);
                      e.target.value = "";
                    }}
                  />
                </label>
                {mediaBusy && <p role="status">Görsel yükleniyor…</p>}
              </>
            )}
            {tab === "files" && (
              <>
                <span className="eyebrow">03 / PAKETLER & KAYNAKLAR</span>
                <h3>İndirilebilir dosyalar.</h3>
                <p className="muted">
                  Kurulum, taşınabilir uygulama ve kaynak arşivi ayrı paketler
                  olabilir. ZIP, 7Z, EXE, MSI, APK, AAB, GZ, PDF · dosya başına
                  en fazla 500 MB.
                </p>
                {!persisted ? (
                  <div className="notice">
                    Dosya eklemek için önce temel bilgileri doldurup projeyi
                    taslak olarak kaydet.
                  </div>
                ) : (
                  <>
                    <div className="form-grid">
                      <Field label="Dosya rolü">
                        <select
                          disabled={uploading}
                          value={fileRole}
                          onChange={(e) => setFileRole(e.target.value)}
                        >
                          {Object.entries(fileRoles).map(([id, n]) => (
                            <option key={id} value={id}>
                              {n}
                            </option>
                          ))}
                        </select>
                      </Field>
                      <Field label="Dosya platformu">
                        <select
                          disabled={uploading}
                          value={filePlatform}
                          onChange={(e) => setFilePlatform(e.target.value)}
                        >
                          {Object.entries(platforms).map(([id, n]) => (
                            <option key={id} value={id}>
                              {n}
                            </option>
                          ))}
                        </select>
                      </Field>
                      <Field label="Dosya sürümü">
                        <input
                          value={fileVersion}
                          disabled={uploading}
                          onChange={(e) => setFileVersion(e.target.value)}
                          maxLength={40}
                        />
                      </Field>
                    </div>
                    <label className="upload-drop">
                      <Upload size={26} />
                      <strong>Paket dosyası seç</strong>
                      <span>
                        Dosya adında Latin harflerini kullan. Paket doğrudan
                        sunucu depolamasına aktarılır.
                      </span>
                      <input
                        aria-label="Proje paketi yükle"
                        type="file"
                        accept=".zip,.7z,.exe,.msi,.apk,.aab,.gz,.tgz,.pdf"
                        disabled={uploading || busy}
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) void upload(file);
                          e.target.value = "";
                        }}
                      />
                    </label>
                  </>
                )}
                {uploading && (
                  <div className="upload-progress" role="status">
                    <progress max="100" value={progress} />
                    <p>
                      {!taskReady
                        ? "Yükleme hazırlanıyor…"
                        : progress === 100
                          ? "Dosya kontrol ediliyor…"
                          : `${paused ? "Duraklatıldı" : "Yükleniyor"} · %${progress}`}
                    </p>
                    <div className="inline-actions">
                      <button
                        type="button"
                        className="button outline small"
                        disabled={!taskReady || progress === 100}
                        onClick={() =>
                          paused
                            ? task.current?.resume()
                            : task.current?.pause()
                        }
                      >
                        {paused ? "Sürdür" : "Duraklat"}
                      </button>
                      <button
                        type="button"
                        className="text-button"
                        disabled={!taskReady || progress === 100}
                        onClick={cancelTask}
                      >
                        İptal et
                      </button>
                    </div>
                  </div>
                )}
                {edit.files.map((f) => (
                  <div className="download-row" key={f.id}>
                    <Package size={23} />
                    <div>
                      <strong>{f.name}</strong>
                      <small>
                        {fileRoles[f.role]} · {platforms[f.platform]} · v
                        {f.version} · {sizeLabel(f.size)}
                      </small>
                    </div>
                    <button
                      className="icon-button"
                      type="button"
                      disabled={uploading || edit.status === "published"}
                      aria-label={`${f.name} dosyasını kaldır`}
                      onClick={async () => {
                        try {
                          await api("admin.fileRemove", {
                            gameId: edit.id,
                            fileId: f.id,
                          });
                          setEdit((e) => ({
                            ...e!,
                            files: e!.files.filter((x) => x.id !== f.id),
                          }));
                          await refresh();
                          toast("Dosya kaldırıldı.");
                        } catch (e: any) {
                          toast(e.message);
                        }
                      }}
                    >
                      <Trash2 size={17} />
                    </button>
                  </div>
                ))}
                {!edit.files.length && (
                  <p className="muted">Henüz bir dosya eklenmedi.</p>
                )}
              </>
            )}
            {tab === "details" && (
              <>
                <span className="eyebrow">04 / TEKNİK AYRINTILAR</span>
                <h3>Doğru bilgiler, kolay kullanım.</h3>
                <Field label="Teknoloji / çatı">
                  <input
                    maxLength={100}
                    value={edit.technology}
                    onChange={(e) => field("technology", e.target.value)}
                    placeholder=".NET 8, Unity, HTML / CSS / JavaScript…"
                  />
                </Field>
                <Field label="Lisans">
                  <input
                    maxLength={100}
                    value={edit.license}
                    onChange={(e) => field("license", e.target.value)}
                    placeholder="MIT, Apache-2.0 veya Tüm hakları saklıdır"
                  />
                </Field>
                <Field label="Kaynak deposu (isteğe bağlı)">
                  <input
                    type="url"
                    value={edit.repository}
                    onChange={(e) => field("repository", e.target.value)}
                    placeholder="https://github.com/..."
                  />
                </Field>
                <Field label="Sistem gereksinimleri">
                  <textarea
                    rows={3}
                    maxLength={1200}
                    value={edit.requirements}
                    onChange={(e) => field("requirements", e.target.value)}
                    placeholder="İşletim sistemi, çalışma ortamı ve donanım gereksinimleri"
                  />
                </Field>
                <Field label="Kullanım / kurulum talimatları">
                  <textarea
                    rows={5}
                    maxLength={2000}
                    value={edit.controls}
                    onChange={(e) => field("controls", e.target.value)}
                  />
                </Field>
                <fieldset>
                  <legend>Desteklenen platformlar</legend>
                  <div className="platform-options">
                    {Object.entries(platforms).map(([id, name]) => (
                      <label className="check-label" key={id}>
                        <input
                          type="checkbox"
                          checked={edit.platforms.includes(id)}
                          onChange={(e) =>
                            field(
                              "platforms",
                              e.target.checked
                                ? [...edit.platforms, id]
                                : edit.platforms.filter((p) => p !== id),
                            )
                          }
                        />
                        {name}
                      </label>
                    ))}
                  </div>
                </fieldset>
              </>
            )}
            {tab === "release" && (
              <>
                <span className="eyebrow">05 / SÜRÜM & YAYIN</span>
                <h3>Ne zaman, nasıl paylaşılacak?</h3>
                <div className="form-grid">
                  <Field label="Yayın durumu">
                    <select
                      value={edit.status}
                      onChange={(e) => field("status", e.target.value)}
                    >
                      <option value="draft">Taslak</option>
                      <option value="published">Yayında</option>
                      <option value="archived">Arşiv</option>
                    </select>
                  </Field>
                  <Field label="Sunum biçimi">
                    <select
                      value={edit.engine}
                      onChange={(e) => field("engine", e.target.value)}
                    >
                      <option value="download">İndirilebilir proje</option>
                      <option value="source">Kaynak kod / depo</option>
                      <option value="web">Tarayıcıda web deneyimi</option>
                      <option value="unity">Unity Web</option>
                    </select>
                  </Field>
                  <Field label="Etkin sürüm">
                    <input
                      value={edit.version}
                      maxLength={40}
                      onChange={(e) => field("version", e.target.value)}
                    />
                  </Field>
                  <Field label="Sıralama önceliği">
                    <input
                      type="number"
                      min="0"
                      max="1000"
                      value={edit.order}
                      onChange={(e) => field("order", Number(e.target.value))}
                    />
                  </Field>
                </div>
                {["unity", "web"].includes(edit.engine) && (
                  <div className="version-panel">
                    <Field label="Doğrulanmış tarayıcı sürümü">
                      <select
                        value={edit.runtime}
                        onChange={(e) => {
                          const v = edit.versions.find(
                            (v) => v.runtime === e.target.value,
                          );
                          field("runtime", e.target.value);
                          if (v) field("version", v.id);
                        }}
                      >
                        <option value="">Paket seçilmedi</option>
                        {edit.versions
                          .filter((v) => v.verified)
                          .map((v) => (
                            <option key={v.id} value={v.runtime}>
                              {v.id} · {v.runtime}
                            </option>
                          ))}
                      </select>
                    </Field>
                    <p className="muted">
                      Tarayıcı / Unity build’i kontrollü paket aktarımı ve
                      tarayıcı doğrulamasından sonra burada seçilir. Kurulum ve
                      kaynak arşivleri Dosyalar sekmesinden yüklenir.
                    </p>
                  </div>
                )}
                <Field label="Bu sürümde neler değişti?">
                  <textarea
                    maxLength={3000}
                    rows={5}
                    value={edit.changelog}
                    onChange={(e) => field("changelog", e.target.value)}
                  />
                </Field>
                <label className="check-label">
                  <input
                    type="checkbox"
                    checked={edit.featured}
                    onChange={(e) => field("featured", e.target.checked)}
                  />
                  Ana sayfada öne çıkar
                </label>
                <details className="advanced-settings">
                  <summary>Adres ve kimlik</summary>
                  <Field label="Proje kimliği">
                    <input
                      disabled={persisted}
                      value={edit.id}
                      onChange={(e) => field("id", e.target.value)}
                      pattern="[a-z0-9-]+"
                    />
                  </Field>
                  <Field label="Adres adı">
                    <input
                      value={edit.slug}
                      onChange={(e) => field("slug", e.target.value)}
                      pattern="[a-z0-9-]+"
                    />
                  </Field>
                </details>
              </>
            )}
          </section>
          <aside className="editor-guide panel">
            <span className="eyebrow">YAYIN KONTROLÜ</span>
            <h3>Hazır olduğunda paylaş.</h3>
            {[
              [Boolean(edit.title && edit.description), "Proje bilgileri"],
              [Boolean(edit.cover), "Kapak görseli (isteğe bağlı)"],
              [
                Boolean(
                  edit.files.some((f) => f.version === edit.version) ||
                  edit.repository ||
                  edit.versions.some(
                    (v) => v.verified && v.id === edit.version,
                  ),
                ),
                "Dosya, depo veya tarayıcı paketi",
              ],
              [Boolean(edit.license), "Lisans bilgisi"],
              [Boolean(edit.platforms.length), "Desteklenen platformlar"],
            ].map(([ok, label]) => (
              <div
                className={`check-item ${ok ? "done" : ""}`}
                key={String(label)}
              >
                <Check size={14} />
                <span>{label}</span>
              </div>
            ))}
            <hr />
            <p>
              Taslaklar yalnız yönetimde görünür. Kataloğa eklemek için yayın
              durumunu değiştirip kaydet.
            </p>
            {persisted && edit.status === "published" && (
              <Link to={`/proje/${edit.slug}`} className="button outline full">
                Projeyi görüntüle <ArrowUpRight size={16} />
              </Link>
            )}
          </aside>
        </div>
        {preview && (
          <ProjectPreview project={edit} onClose={() => setPreview(false)} />
        )}
        {leaveTo !== null && (
          <Modal
            title="Kaydedilmemiş değişiklikler var"
            onClose={() => setLeaveTo(null)}
            className="leave-dialog"
          >
            <p>
              {uploading || mediaBusy || busy
                ? "Devam eden işlem tamamlandıktan sonra bu sayfadan ayrılabilirsin."
                : "Yaptığın düzenlemeleri kaydetmeden ayrılırsan bu değişiklikler kaybolur."}
            </p>
            <div className="inline-actions">
              <button
                type="button"
                className="button outline"
                onClick={() => setLeaveTo(null)}
              >
                Düzenlemeye dön
              </button>
              <button
                type="button"
                className="button"
                disabled={uploading || mediaBusy || busy}
                onClick={() => {
                  const path = leaveTo;
                  setLeaveTo(null);
                  setEdit(null);
                  setBaseline("");
                  if (path) navigate(path);
                }}
              >
                Değişiklikleri bırak
              </button>
            </div>
          </Modal>
        )}
      </form>
    );
  const list = data.gamesCatalog.filter(
    (g) =>
      g.title.toLocaleLowerCase("tr").includes(q.toLocaleLowerCase("tr")) &&
      (filter === "all" || g.status === filter),
  );
  return (
    <>
      <div className="section-heading">
        <div>
          <span className="eyebrow">İÇERİK YÖNETİMİ</span>
          <h2>Proje kütüphanesi</h2>
        </div>
        <button
          className="button small"
          onClick={() =>
            open({
              ...blank,
              category: data.gameCategories.some((c) => c.id === "uygulama")
                ? "uygulama"
                : data.gameCategories[0]?.id || "",
            })
          }
        >
          <Plus size={17} /> Proje ekle
        </button>
      </div>
      <div className="panel admin-catalog-toolbar">
        <label className="catalog-search">
          <Search size={17} />
          <input
            aria-label="Yönetimde proje ara"
            placeholder="Proje ara…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </label>
        <select
          aria-label="Proje durumunu filtrele"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        >
          <option value="all">Tüm durumlar</option>
          <option value="published">Yayında</option>
          <option value="draft">Taslak</option>
          <option value="archived">Arşiv</option>
        </select>
        <span>{list.length} proje</span>
      </div>
      <div className="admin-games">
        {list.map((g) => (
          <article key={g.id} className="admin-game-row panel">
            <Art kind={g.cover} />
            <div>
              <strong>{g.title}</strong>
              <small>
                {kindOf(g).singular} · v{g.version} · {g.files?.length || 0}{" "}
                dosya
              </small>
            </div>
            <span className={`status-tag ${g.status}`}>
              {g.status === "published"
                ? "Yayında"
                : g.status === "draft"
                  ? "Taslak"
                  : "Arşiv"}
            </span>
            <button className="button outline small" onClick={() => open(g)}>
              Düzenle
            </button>
          </article>
        ))}
      </div>
      {!list.length && (
        <Empty
          title={q ? "Eşleşen proje bulunamadı." : "İlk projeni ekleyelim."}
        >
          Oyun, uygulama veya kaynak kod. Projeni taslak olarak oluştur, dosya
          ve görsellerini ekle, hazır olduğunda yayınla.
          <br />
          <button
            className="button outline"
            onClick={() =>
              open({
                ...blank,
                category: data.gameCategories.some((c) => c.id === "uygulama")
                  ? "uygulama"
                  : data.gameCategories[0]?.id || "",
              })
            }
          >
            <FolderOpen size={17} /> Yeni proje oluştur
          </button>
        </Empty>
      )}
    </>
  );
}
