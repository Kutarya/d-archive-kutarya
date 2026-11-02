import { useEffect, useState } from "react";
import {
  Link,
  Navigate,
  useNavigate,
  useParams,
  useSearchParams,
} from "react-router-dom";
import {
  signInWithEmailAndPassword,
  signOut,
  confirmPasswordReset,
  verifyPasswordResetCode,
  applyActionCode,
} from "firebase/auth";
import {
  ArrowRight,
  Eye,
  EyeOff,
  ShieldCheck,
  Mail,
  ArrowUpRight,
} from "lucide-react";
import { useApp } from "../state";
import { api, auth } from "../services/firebase";
import { authDestination } from "../services/google-flow";
import { Field } from "../components/UI";
function human(e: any) {
  const code = e.code || "";
  if (code.includes("email-already-in-use"))
    return "Bu e-postayla kayıtlı bir hesap var. Giriş yapmayı dene.";
  if (code.includes("invalid-credential")) return "E-posta veya şifre hatalı.";
  if (code.includes("weak-password")) return "Daha güçlü bir şifre seç.";
  if (code.includes("too-many-requests"))
    return "Çok fazla deneme. Biraz sonra tekrar dene.";
  if (
    code.includes("expired-action-code") ||
    code.includes("invalid-action-code")
  )
    return "Bağlantı geçersiz veya süresi dolmuş. Yeni bir bağlantı iste.";
  return e.message || "İşlem tamamlanamadı.";
}
export default function AuthPage() {
  const { mode = "login" } = useParams();
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { user, toast, refreshProfile, local } = useApp();
  const [email, setEmail] = useState(""),
    [password, setPassword] = useState(""),
    [code, setCode] = useState(""),
    [show, setShow] = useState(false),
    [busy, setBusy] = useState(false),
    [error, setError] = useState(""),
    [success, setSuccess] = useState(""),
    [cooldown, setCooldown] = useState(0),
    [actionValid, setActionValid] = useState(false);
  const next = params.get("next");
  const safeNext = authDestination(next);
  const destination =
    /^\/admin(?:\/|$)/.test(safeNext) &&
    !/^\/admin\/auth(?:\/|$)/.test(safeNext)
      ? safeNext
      : "/admin";
  const forgot = mode === "forgot-password",
    verify = mode === "verify-email",
    action = mode === "action";
  useEffect(() => {
    setError("");
    setSuccess("");
    setCode("");
  }, [mode]);
  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setTimeout(() => setCooldown(cooldown - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);
  useEffect(() => {
    if (!action) return;
    const actionCode = params.get("oobCode") || "";
    if (params.get("mode") === "verifyEmail") {
      applyActionCode(auth, actionCode)
        .then(() => {
          setSuccess("E-posta adresin doğrulandı. Giriş yapabilirsin.");
        })
        .catch((e) => setError(human(e)));
    } else
      verifyPasswordResetCode(auth, actionCode)
        .then((e) => {
          setEmail(e);
          setActionValid(true);
        })
        .catch((e) => setError(human(e)));
  }, [action]);
  async function sendCode() {
    setBusy(true);
    setError("");
    try {
      await api("sendCode");
      setCooldown(45);
      setSuccess("Doğrulama kodu e-posta adresine gönderildi.");
    } catch (e) {
      setError(human(e));
    } finally {
      setBusy(false);
    }
  }
  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess("");
    setBusy(true);
    try {
      if (verify) {
        await api("verifyCode", { code });
        await auth.currentUser?.reload();
        await auth.currentUser?.getIdToken(true);
        await refreshProfile();
        toast("Yönetici e-postası doğrulandı.");
        navigate(destination);
      } else if (forgot) {
        await api("resetPassword", { email });
        setSuccess(
          "Bu adresle bir hesabın varsa şifre sıfırlama bağlantısı gönderildi.",
        );
      } else if (action) {
        await confirmPasswordReset(auth, params.get("oobCode") || "", password);
        setSuccess("Şifren yenilendi. Artık giriş yapabilirsin.");
        setActionValid(false);
      } else {
        const r = await signInWithEmailAndPassword(
          auth,
          email.trim(),
          password,
        );
        const token = await r.user.getIdTokenResult();
        if (token.claims.gamesAdmin !== true) {
          await signOut(auth);
          throw new Error("Bu hesapta proje yönetimi yetkisi bulunmuyor.");
        }
        await refreshProfile();
        navigate(
          r.user.emailVerified
            ? destination
            : `/admin/auth/verify-email?next=${encodeURIComponent(destination)}`,
        );
      }
    } catch (err) {
      setError(human(err));
    } finally {
      setBusy(false);
    }
  }
  const title = verify
    ? "Son bir küçük adım."
    : forgot
      ? "Yeniden başlayalım."
      : action
        ? "Yeni şifreni belirle."
        : "Yönetici girişi.";
  if (!["login", "forgot-password", "verify-email", "action"].includes(mode))
    return <Navigate replace to="/admin/auth/login" />;
  return (
    <section className="auth-layout">
      <aside className="auth-story">
        <span className="eyebrow">KUTARYA YÖNETİMİ</span>
        <h1>
          Projelerini
          <br />
          yönet,
          <br />
          <em>paylaş.</em>
        </h1>
        <img
          className="auth-photo"
          src="/media/kutarya-studio.png"
          alt="Kutarya çalışma masası"
        />
        <p>
          Yetkili yönetici hesabınla içerikleri düzenle,
          <br />
          dosyaları ve yeni sürümleri paylaş.
        </p>
        <div className="auth-feature">
          <ShieldCheck size={18} /> Yalnız yetkili yöneticiler için
        </div>
      </aside>
      <div className="auth-form-wrap">
        <Link to="/" className="back-link">
          ← Keşif alanına dön
        </Link>
        <div className="auth-form">
          <span className="eyebrow">
            {verify
              ? "E-POSTA DOĞRULAMA"
              : forgot || action
                ? "YÖNETİM ERİŞİMİ"
                : "YÖNETİCİ GİRİŞİ"}
          </span>
          <h2>{title}</h2>
          <p className="muted">
            {verify
              ? `${user?.email || "E-posta adresine"} gönderilen 6 haneli kodu yaz.`
              : forgot
                ? "E-posta adresini yaz; sana bir yenileme bağlantısı gönderelim."
                : action
                  ? "Yönetici hesabın için güvenli bir şifre seç."
                  : "Mevcut yetkili hesabınla yönetim paneline giriş yap."}
          </p>
          {error && (
            <div className="error-box" role="alert">
              {error}
            </div>
          )}
          {success && (
            <div className="success-box" role="status">
              {success}
            </div>
          )}
          {verify && !user ? (
            <div className="panel">
              Doğrulamaya devam etmek için{" "}
              <Link to="/admin/auth/login">yönetici girişi yap.</Link>
            </div>
          ) : (
            <form onSubmit={submit}>
              {!verify && !action && (
                <Field label="E-posta adresin">
                  <input
                    autoComplete="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="sen@ornek.com"
                  />
                </Field>
              )}
              {verify ? (
                <Field label="Doğrulama kodu">
                  <input
                    className="code-input"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    value={code}
                    onChange={(e) =>
                      setCode(e.target.value.replace(/\D/g, "").slice(0, 6))
                    }
                    pattern="[0-9]{6}"
                    required
                    placeholder="000000"
                    aria-label="Altı haneli doğrulama kodu"
                  />
                </Field>
              ) : (
                !forgot &&
                (!action || actionValid) && (
                  <Field label={action ? "Yeni şifren" : "Şifren"}>
                    <div className="password-field">
                      <input
                        type={show ? "text" : "password"}
                        autoComplete={
                          action ? "new-password" : "current-password"
                        }
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        minLength={action ? 8 : 6}
                        placeholder="••••••••"
                      />
                      <button
                        type="button"
                        aria-label={show ? "Şifreyi gizle" : "Şifreyi göster"}
                        onClick={() => setShow(!show)}
                      >
                        {show ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </Field>
                )
              )}
              {!verify && !forgot && !action && (
                <Link className="forgot-link" to="/admin/auth/forgot-password">
                  Şifremi unuttum
                </Link>
              )}
              {(!action || actionValid) && (
                <button className="button full" disabled={busy}>
                  {busy
                    ? "İşleniyor…"
                    : verify
                      ? "E-postamı doğrula"
                      : forgot
                        ? "Bağlantı gönder"
                        : action
                          ? "Şifremi yenile"
                          : "Yönetim paneline gir"}
                  <ArrowRight size={18} />
                </button>
              )}
            </form>
          )}
          {verify && user && (
            <button
              className="button outline full"
              onClick={() => void sendCode()}
              disabled={busy || cooldown > 0}
            >
              {cooldown > 0
                ? `Tekrar gönder (${cooldown})`
                : "Kodu tekrar gönder"}{" "}
              <Mail size={17} />
            </button>
          )}
          {(forgot || action) && (
            <Link to="/admin/auth/login" className="auth-bottom">
              Giriş ekranına dön <ArrowUpRight size={14} />
            </Link>
          )}
          {verify && (
            <p className="auth-bottom">
              Spam klasörünü de kontrol et. Kod 15 dakika geçerlidir.
            </p>
          )}
          {local && (
            <p className="local-note">
              Yerel test ortamı. E-postalar dışarı gönderilmez.
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
