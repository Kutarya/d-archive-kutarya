import assert from "node:assert/strict";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import {
  cloudGet,
  cloudAdmin,
  listCollection,
  decodeValue,
  projectId,
} from "./firebase-cloud.mjs";
import {
  arenaReleaseDirectory as out,
  arenaVersion,
} from "./arena-release-paths.mjs";
export { out };
const phase = process.argv[2];
assert(["before", "after"].includes(phase));
await mkdir(out, { recursive: true });
const [{ releases }, functions, run, firestore, storage, docs, { auth }] =
  await Promise.all([
    cloudGet(
      `https://firebasehosting.googleapis.com/v1beta1/sites/${projectId}/releases?pageSize=2`,
    ),
    cloudGet(
      `https://cloudfunctions.googleapis.com/v2/projects/${projectId}/locations/-/functions`,
    ),
    cloudGet(
      `https://run.googleapis.com/v2/projects/${projectId}/locations/europe-west1/services`,
    ),
    cloudGet(
      `https://firebaserules.googleapis.com/v1/projects/${projectId}/releases/cloud.firestore`,
    ),
    cloudGet(
      `https://firebaserules.googleapis.com/v1/projects/${projectId}/releases?pageSize=100`,
    ),
    listCollection("gamesCatalog"),
    cloudAdmin(),
  ]);
const admin = await auth.getUserByEmail("kutaryaai@gmail.com");
const current = {
  at: new Date().toISOString(),
  projectId,
  hosting: releases?.[0],
  functions: (functions.functions || [])
    .map((f) => ({ name: f.name, updateTime: f.updateTime, state: f.state }))
    .sort((a, b) => a.name.localeCompare(b.name)),
  run: (run.services || [])
    .filter((s) => !s.name.endsWith("/kutarya-block-arena"))
    .map((s) => ({
      name: s.name,
      generation: s.generation,
      updateTime: s.updateTime,
      latestReadyRevision: s.latestReadyRevision,
    }))
    .sort((a, b) => a.name.localeCompare(b.name)),
  rules: {
    firestore: firestore.rulesetName,
    storage: storage.releases
      ?.filter((r) => r.name.includes("firebase.storage/"))
      .map((r) => ({ name: r.name, rulesetName: r.rulesetName })),
  },
  admin: {
    uid: admin.uid,
    emailVerified: admin.emailVerified,
    claims: admin.customClaims,
  },
  catalog: docs
    .map((d) => ({
      id: d.name.split("/").at(-1),
      data: Object.fromEntries(
        Object.entries(d.fields).map(([k, v]) => [k, decodeValue(v)]),
      ),
    }))
    .sort((a, b) => a.id.localeCompare(b.id)),
};
await writeFile(`${out}/${phase}.json`, JSON.stringify(current, null, 2));
if (phase === "after") {
  const before = JSON.parse(await readFile(`${out}/before.json`, "utf8"));
  for (const k of ["functions", "run", "rules", "admin"])
    assert.deepEqual(current[k], before[k], `${k} değişti`);
  assert.deepEqual(
    current.catalog.filter((g) => g.id !== "pixelgun"),
    before.catalog.filter((g) => g.id !== "pixelgun"),
  );
  const old = before.catalog.find((g) => g.id === "pixelgun").data,
    newGame = current.catalog.find((g) => g.id === "pixelgun").data;
  for (const f of old.files)
    assert.deepEqual(
      newGame.files.find((x) => x.id === f.id),
      f,
      "Eski Arena paketi değişti.",
    );
  assert.equal(newGame.version, arenaVersion);
  await writeFile(
    `${out}/cloud-acceptance.json`,
    JSON.stringify(
      {
        at: current.at,
        passed: true,
        otherProjectsUnchanged: current.catalog.length - 1,
        oldFilesPreserved: true,
        functionsUnchanged: current.functions.length,
        rulesAndAdminUnchanged: true,
        hostingVersion: current.hosting.version?.name,
      },
      null,
      2,
    ),
  );
}
console.log(
  JSON.stringify({
    phase,
    projects: current.catalog.length,
    functions: current.functions.length,
    hosting: current.hosting.version?.name,
  }),
);
