import {
  GoogleAuthProvider,
  getRedirectResult,
  signInWithPopup,
  signInWithRedirect,
} from "firebase/auth";
import { auth } from "./firebase";
import { createGoogleFlow } from "./google-flow";

auth.languageCode = "tr";
function provider() {
  const google = new GoogleAuthProvider();
  google.setCustomParameters({ prompt: "select_account" });
  return google;
}
export const googleFlow = createGoogleFlow({
  popup: () => signInWithPopup(auth, provider()),
  redirect: () => signInWithRedirect(auth, provider()),
  result: () => getRedirectResult(auth),
  session: () => window.sessionStorage,
});
