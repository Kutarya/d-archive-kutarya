import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { onIdTokenChanged, signOut, type User } from "firebase/auth";
import { api, auth, local } from "./services/firebase";
import type { Catalog, Profile } from "./types";
const empty: Catalog = {
  games: [],
  categories: [],
  announcements: [],
  settings: {
    title: "Kutarya",
    tagline: "Fikirden projeye. Projeden sana.",
    notice: "",
    maintenance: false,
    contact: "kutaryaai@gmail.com",
  },
};
type State = {
  catalog: Catalog;
  loading: boolean;
  error: string;
  catalogAvailable: boolean;
  reload: () => Promise<void>;
  user: User | null;
  profile: Profile | null;
  admin: boolean;
  authLoading: boolean;
  refreshProfile: () => Promise<void>;
  toast: (s: string) => void;
  logout: () => Promise<void>;
  local: boolean;
};
const context = createContext<State>(null!);
// Yalnız genel katalog; hesap/claim/token bu HTML verisinden alınmaz.
function initialPublicCatalog(): Catalog | undefined {
  if (typeof document === "undefined") return;
  try {
    const value = JSON.parse(
      document.getElementById("kutarya-catalog")?.textContent || "null",
    );
    if (
      value &&
      Array.isArray(value.games) &&
      Array.isArray(value.categories) &&
      Array.isArray(value.announcements) &&
      typeof value.settings?.title === "string"
    )
      return value;
  } catch {
    /* Canlı API'den yükleme yolu korunur. */
  }
}
export function Provider({
  children,
  initialCatalog,
}: {
  children: ReactNode;
  initialCatalog?: Catalog;
}) {
  const [initial] = useState(() => initialCatalog || initialPublicCatalog());
  const [catalog, setCatalog] = useState(initial || empty),
    [catalogAvailable, setCatalogAvailable] = useState(Boolean(initial)),
    [loading, setLoading] = useState(!initial),
    [error, setError] = useState(""),
    [user, setUser] = useState<User | null>(null),
    [profile, setProfile] = useState<Profile | null>(null),
    [admin, setAdmin] = useState(false),
    [authLoading, setAuthLoading] = useState(true),
    [message, setMessage] = useState("");
  async function reload() {
    setError("");
    try {
      setCatalog(await api<Catalog>("catalog"));
      setCatalogAvailable(true);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }
  async function refreshProfile() {
    const currentUser = auth.currentUser;
    if (!currentUser) return;
    const uid = currentUser.uid;
    const token = await currentUser.getIdTokenResult();
    if (token.claims.gamesAdmin !== true || auth.currentUser?.uid !== uid)
      return;
    const next = await api<Profile>("me");
    // Eski hesaptan gelen geç yanıt yeni oturumun profilini değiştirmesin.
    if (auth.currentUser?.uid === uid && next.uid === uid) setProfile(next);
  }
  useEffect(() => {
    void reload();
    let revision = 0;
    const unsubscribe = onIdTokenChanged(auth, async (u) => {
      const current = ++revision;
      const active = () =>
        current === revision && auth.currentUser?.uid === u?.uid;
      setAuthLoading(true);
      setUser(null);
      setProfile(null);
      setAdmin(false);
      try {
        if (u) {
          const token = await u.getIdTokenResult();
          // Ziyaretçilerin eski oturumları yeni profil oluşturmasın.
          if (token.claims.gamesAdmin !== true || !active()) return;
          setUser(u);
          const next = await api<Profile>("me");
          if (active()) {
            setAdmin(u.emailVerified && !next.suspended);
            setProfile(next);
          }
        }
      } catch (e: any) {
        if (active()) setMessage(e.message);
      } finally {
        if (active()) setAuthLoading(false);
      }
    });
    return () => {
      revision++;
      unsubscribe();
    };
  }, []);
  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(() => setMessage(""), 4500);
    return () => clearTimeout(timer);
  }, [message]);
  return (
    <context.Provider
      value={{
        catalog,
        loading,
        error,
        catalogAvailable,
        reload,
        user,
        profile,
        admin,
        authLoading,
        refreshProfile,
        toast: setMessage,
        logout: () => signOut(auth),
        local,
      }}
    >
      {children}
      {message && (
        <div className="toast" role="status">
          {message}
          <button aria-label="Bildirimi kapat" onClick={() => setMessage("")}>
            ×
          </button>
        </div>
      )}
    </context.Provider>
  );
}
export const useApp = () => useContext(context);
