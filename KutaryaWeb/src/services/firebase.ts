import { getApp, getApps, initializeApp } from "firebase/app";
import { connectAuthEmulator, getAuth } from "firebase/auth";
import { connectStorageEmulator, getStorage } from "firebase/storage";
import {
  connectFunctionsEmulator,
  getFunctions,
  httpsCallable,
} from "firebase/functions";
const e = import.meta.env;
export const local = e.VITE_USE_EMULATORS === "true";
const hostingDomains = [
  "kutarya.com",
  "www.kutarya.com",
  "kutarya-ai-3169.web.app",
  "kutarya-ai-3169.firebaseapp.com",
];
// Hosting'de auth helper aynı origin'de kalsın; Safari/Firefox redirect
// dönüşü üçüncü taraf depolamaya bağımlı olmasın.
const authDomain =
  !local && typeof window !== "undefined" && hostingDomains.includes(window.location.hostname)
    ? window.location.hostname
    : e.VITE_FIREBASE_AUTH_DOMAIN || "localhost";
export const configured = Boolean(
  e.VITE_FIREBASE_API_KEY && e.VITE_FIREBASE_PROJECT_ID,
);
// Geliştirme sırasında modül yenilendiğinde aynı bağlantıyı yeniden kullan.
const initialized = getApps().some((app) => app.name === "[DEFAULT]");
const app = initialized
  ? getApp()
  : initializeApp({
      apiKey: e.VITE_FIREBASE_API_KEY || "not-configured",
      authDomain,
      projectId: e.VITE_FIREBASE_PROJECT_ID || "unconfigured",
      appId: e.VITE_FIREBASE_APP_ID || "unconfigured",
      storageBucket:
        e.VITE_FIREBASE_STORAGE_BUCKET ||
        (local
          ? "demo-kutarya-games.appspot.com"
          : "kutarya-ai-3169.firebasestorage.app"),
      messagingSenderId: e.VITE_FIREBASE_MESSAGING_SENDER_ID,
      databaseURL: e.VITE_FIREBASE_DATABASE_URL,
      measurementId: e.VITE_FIREBASE_MEASUREMENT_ID,
    });
export const auth = getAuth(app);
export const storage = getStorage(app);
const functions = getFunctions(app, e.VITE_FUNCTIONS_REGION || "europe-west1");
if (local && !initialized) {
  connectAuthEmulator(auth, "http://127.0.0.1:9099", { disableWarnings: true });
  connectFunctionsEmulator(functions, "127.0.0.1", 5005);
  connectStorageEmulator(storage, "127.0.0.1", 9199);
}
export async function api<T = any>(
  op: string,
  data: Record<string, unknown> = {},
): Promise<T> {
  if (!configured) throw new Error("Site servisi henüz yapılandırılmamış.");
  try {
    const result = await httpsCallable(
      functions,
      "gamesService",
    )({ op, ...data });
    return result.data as T;
  } catch (error: any) {
    throw new Error(
      error.message === "internal"
        ? "Servise şu anda ulaşılamıyor. Lütfen tekrar dene."
        : error.message || "İşlem tamamlanamadı.",
    );
  }
}
