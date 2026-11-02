// Yalnız belirtilen mevcut Auth hesabını okur; claim veya hesap değiştirmez.
import { createRequire } from "node:module";
import { writeFile } from "node:fs/promises";
const email = process.argv[2];
if (!email || !email.includes("@"))
  throw new Error("Mevcut admin hesabının e-posta adresini belirt.");
const require = createRequire(import.meta.url);
const cliAuth = require(
  process.env.APPDATA + "/npm/node_modules/firebase-tools/lib/auth.js",
);
const account = cliAuth.getGlobalDefaultAccount();
if (!account) throw new Error("Firebase CLI hesabı bulunamadı.");
const token = await cliAuth.getAccessToken(account.tokens.refresh_token, [
  "https://www.googleapis.com/auth/cloud-platform",
  "https://www.googleapis.com/auth/firebase",
]);
const response = await fetch(
  "https://identitytoolkit.googleapis.com/v1/projects/kutarya-ai-3169/accounts:lookup",
  {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token.access_token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email: [email] }),
  },
);
if (!response.ok)
  throw new Error(`Hesap metadata erişimi başarısız: ${response.status}`);
const user = (await response.json()).users?.[0];
const claims = JSON.parse(user?.customAttributes || "{}");
const result = {
  at: new Date().toISOString(),
  project: "kutarya-ai-3169",
  email,
  exists: Boolean(user),
  uid: user?.localId,
  emailVerified: user?.emailVerified === true,
  gamesAdmin: claims.gamesAdmin === true,
  providers: user?.providerUserInfo?.map((p) => p.providerId),
  modified: false,
};
await writeFile(
  "artifacts/admin-account-inventory.json",
  JSON.stringify(result, null, 2),
);
console.log(
  `Belirtilen mevcut hesap: ${result.exists ? "bulundu" : "bulunamadı"}; doğrulanmış e-posta: ${result.emailVerified}; oyun admin yetkisi: ${result.gamesAdmin}; hiçbir değişiklik yapılmadı.`,
);
