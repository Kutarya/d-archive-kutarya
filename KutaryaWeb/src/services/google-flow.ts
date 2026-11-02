import type { UserCredential } from "firebase/auth";

const returnKey = "kutarya-google-return";
const returnLifetime = 30 * 60 * 1000;
type Session = Pick<Storage, "getItem" | "setItem" | "removeItem">;
type Port = {
  popup: () => Promise<UserCredential>;
  redirect: () => Promise<void>;
  result: () => Promise<UserCredential | null>;
  session: () => Session;
  now?: () => number;
};

export function authDestination(value: string | null | undefined) {
  if (!value?.startsWith("/") || /[\\\u0000-\u0020]/.test(value))
    return "/kutuphanem";
  try {
    const base = "https://kutarya.invalid";
    const parsed = new URL(value, base);
    if (parsed.origin !== base || value.startsWith("//")) return "/kutuphanem";
    return parsed.pathname + parsed.search + parsed.hash;
  } catch {
    return "/kutuphanem";
  }
}

export function googleMessage(error: { code?: string }) {
  switch (error.code) {
    case "auth/popup-closed-by-user":
      return "Google girişini iptal ettin. İstersen yeniden deneyebilirsin.";
    case "auth/cancelled-popup-request":
      return "Diğer Google giriş penceresini tamamla veya kapatıp yeniden dene.";
    case "auth/popup-blocked":
      return "Tarayıcı giriş penceresini engelledi. Aynı sekmede giriş yapmayı dene.";
    case "auth/unauthorized-domain":
      return "Bu site adresi için Google girişi henüz etkinleştirilmemiş.";
    case "auth/operation-not-allowed":
      return "Google ile giriş bu ortamda etkinleştirilmemiş.";
    case "auth/network-request-failed":
      return "Google girişine bağlanamadık. İnternet bağlantını kontrol edip tekrar dene.";
    case "auth/web-storage-unsupported":
    case "auth/operation-not-supported-in-this-environment":
      return "Bu tarayıcı giriş için gereken depolamayı desteklemiyor. Normal bir tarayıcı sekmesinde yeniden dene.";
    case "auth/credential-already-in-use":
      return "Bu Google hesabı başka bir hesaba bağlı. O hesapla giriş yapmayı dene.";
    case "auth/user-disabled":
      return "Bu hesabın girişi devre dışı bırakılmış.";
    default:
      return "Google girişi tamamlanamadı. Yeniden deneyebilirsin.";
  }
}

// Pencere/redirect aynı sağlayıcıyı kullanır. Session'a yalnız hedef ve zaman
// yazılır; Google credential, token veya parola saklanmaz.
export function createGoogleFlow(port: Port) {
  const now = port.now || Date.now;
  let returning:
    | Promise<{
        credential: UserCredential | null;
        destination: string | null;
        attempted: boolean;
      }>
    | undefined;
  function pending() {
    try {
      const raw = port.session().getItem(returnKey);
      if (!raw) return null;
      const value = JSON.parse(raw);
      if (
        !Number.isFinite(value.at) ||
        value.at > now() ||
        now() - value.at > returnLifetime
      )
        return null;
      return { destination: authDestination(value.destination) };
    } catch {
      return null;
    }
  }
  function clear() {
    try {
      port.session().removeItem(returnKey);
    } catch {
      /* SDK hatası ayrıca açıklanır. */
    }
  }
  async function redirect(destination: string, onRedirect?: () => void) {
    onRedirect?.();
    try {
      port.session().setItem(
        returnKey,
        JSON.stringify({
          destination: authDestination(destination),
          at: now(),
        }),
      );
    } catch {
      throw { code: "auth/web-storage-unsupported" };
    }
    try {
      await port.redirect();
    } catch (error) {
      clear();
      throw error;
    }
    return { credential: null, redirecting: true } as const;
  }
  return {
    hasPending: () => Boolean(pending()),
    async start(destination: string, sameTab = false, onRedirect?: () => void) {
      if (sameTab) return redirect(destination, onRedirect);
      try {
        return { credential: await port.popup(), redirecting: false } as const;
      } catch (error: any) {
        // Kullanıcının iptalini veya ağ hatasını başka bir girişle değiştirme.
        if (error.code !== "auth/popup-blocked") throw error;
        return redirect(destination, onRedirect);
      }
    },
    finishRedirect() {
      // React StrictMode aynı sonucu iki kez tüketmesin.
      if (!returning) {
        const saved = pending();
        returning = port
          .result()
          .then((credential) => ({
            credential,
            destination: saved?.destination || null,
            attempted: Boolean(saved),
          }))
          .finally(clear);
      }
      return returning;
    },
    handledRedirect() {
      // Sonuç işlendiğinde sonraki login ziyaretine eski credential taşıma.
      returning = Promise.resolve({
        credential: null,
        destination: null,
        attempted: false,
      });
    },
  };
}
