import { createRequire } from "node:module";
import { writeFile } from "node:fs/promises";
const require = createRequire(import.meta.url);
const cliRoot = process.env.APPDATA + "/npm/node_modules/firebase-tools/lib/";
const cliAuth = require(cliRoot + "auth.js");
const account = cliAuth.getGlobalDefaultAccount();
if (!account) throw new Error("Firebase CLI hesabı bulunamadı.");
const token = await cliAuth.getAccessToken(account.tokens.refresh_token, [
  "https://www.googleapis.com/auth/cloud-platform",
  "https://www.googleapis.com/auth/firebase",
]);
async function get(url) {
  const r = await fetch(url, {
    headers: { Authorization: `Bearer ${token.access_token}` },
  });
  if (!r.ok) return { status: r.status };
  return r.json();
}
const project = "kutarya-ai-3169";
const [auth, domains, billing, accounts, google, mailSecret, buckets] =
  await Promise.all([
    get(
      `https://identitytoolkit.googleapis.com/admin/v2/projects/${project}/config`,
    ),
    get(
      `https://firebasehosting.googleapis.com/v1beta1/projects/${project}/sites/${project}/customDomains`,
    ),
    get(
      `https://cloudbilling.googleapis.com/v1/projects/${project}/billingInfo`,
    ),
    get(
      `https://identitytoolkit.googleapis.com/v1/projects/${project}/accounts:batchGet?maxResults=1`,
    ),
    get(
      `https://identitytoolkit.googleapis.com/admin/v2/projects/${project}/defaultSupportedIdpConfigs/google.com`,
    ),
    get(
      `https://secretmanager.googleapis.com/v1/projects/${project}/secrets/MOBILE_MAIL_PASS/versions/latest`,
    ),
    get(
      `https://storage.googleapis.com/storage/v1/b?project=${project}&fields=items(name,location)`,
    ),
  ]);
const summary = {
  at: new Date().toISOString(),
  project,
  auth: {
    status: auth.status || 200,
    authorizedDomains: auth.authorizedDomains,
    emailSignIn: auth.signIn?.email?.enabled,
    googleSignIn: google.enabled,
    hasUsers: Boolean(accounts.users?.length),
  },
  domains: {
    status: domains.status || 200,
    items: domains.customDomains?.map((d) => ({
      name: d.name,
      hostState: d.hostState,
      ownershipState: d.ownershipState,
      certState: d.cert?.state,
    })),
  },
  billing: { status: billing.status || 200, enabled: billing.billingEnabled },
  mailSecret: { status: mailSecret.status || 200, state: mailSecret.state },
  storage: { status: buckets.status || 200, buckets: buckets.items },
};
const release = await get(
  `https://firebaserules.googleapis.com/v1/projects/${project}/releases/cloud.firestore`,
);
if (release.rulesetName) {
  const ruleset = await get(
    `https://firebaserules.googleapis.com/v1/${release.rulesetName}`,
  );
  const file =
    ruleset.source?.files?.find((f) => f.name.endsWith(".rules")) ||
    ruleset.source?.files?.[0];
  if (file?.content) {
    await writeFile("artifacts/firebase-live-firestore.rules", file.content);
    summary.firestoreRules = {
      status: 200,
      rulesetName: release.rulesetName,
      captured: true,
    };
  }
} else summary.firestoreRules = { status: release.status, captured: false };
const storageReleases = await get(
  `https://firebaserules.googleapis.com/v1/projects/${project}/releases?pageSize=100`,
);
const storageRelease = storageReleases.releases?.find(
  (r) =>
    r.name.includes("firebase.storage/") &&
    r.name.endsWith("kutarya-ai-3169.firebasestorage.app"),
);
if (storageRelease?.rulesetName) {
  const ruleset = await get(
    `https://firebaserules.googleapis.com/v1/${storageRelease.rulesetName}`,
  );
  const file = ruleset.source?.files?.[0];
  if (file?.content) {
    await writeFile("artifacts/firebase-live-storage.rules", file.content);
    summary.storageRules = {
      captured: true,
      rulesetName: storageRelease.rulesetName,
    };
  }
} else
  summary.storageRules = {
    captured: false,
    status: storageReleases.status || 200,
  };
await writeFile(
  "artifacts/firebase-inventory.json",
  JSON.stringify(summary, null, 2),
);
console.log(JSON.stringify(summary));
