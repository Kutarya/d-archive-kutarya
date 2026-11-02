// Yeni servis sınırları ve geçici operatör izninin temizliği canlıdan okunur.
import assert from "node:assert/strict";
import { readFile, writeFile } from "node:fs/promises";
import { cloudGet, cloudRequest, projectId } from "./firebase-cloud.mjs";
import { arenaReleaseDirectory as out } from "./arena-release-paths.mjs";
const name = `projects/${projectId}/locations/europe-west1/services/kutarya-block-arena`;
const service = await cloudGet(`https://run.googleapis.com/v2/${name}`);
const policy = await cloudRequest(
  `https://cloudresourcemanager.googleapis.com/v1/projects/${projectId}:getIamPolicy`,
  "POST",
  {},
);
const account = `kutarya-arena-runtime@${projectId}.iam.gserviceaccount.com`;
const projectRoles = (policy.bindings || [])
  .filter((b) => b.members.includes(`serviceAccount:${account}`))
  .map((b) => b.role);
assert.deepEqual(projectRoles, []);
assert.equal(service.template.serviceAccount, account);
assert.equal(service.template.scaling.maxInstanceCount, 1);
assert.equal(service.template.scaling.minInstanceCount || 0, 0);
assert.equal(service.scaling.maxInstanceCount, 1);
assert.equal(service.scaling.minInstanceCount || 0, 0);
assert.equal(service.template.timeout, "3600s");
for (const stage of ["upload", "activate"]) {
  let before;
  try {
    before = JSON.parse(
      await readFile(`${out}/${stage}-iam-before.json`, "utf8"),
    );
  } catch (e) {
    if (e.code === "ENOENT" && stage === "activate") continue;
    throw e;
  }
  const current = await cloudRequest(
    `https://iam.googleapis.com/v1/projects/${projectId}/serviceAccounts/${projectId}@appspot.gserviceaccount.com:getIamPolicy?options.requestedPolicyVersion=3`,
    "POST",
  );
  const memberPresent =
    current.bindings?.some(
      (b) =>
        b.role === before.role &&
        !b.condition &&
        b.members.includes(before.member),
    ) || false;
  assert.equal(
    memberPresent,
    !before.temporaryAdded,
    `${stage}: geçici izin temizlenmedi.`,
  );
}
const proof = {
  at: new Date().toISOString(),
  passed: true,
  revision: service.latestReadyRevision,
  serviceAccount: account,
  projectRoles,
  scaling: service.template.scaling,
  serviceScaling: service.scaling,
  timeout: service.template.timeout,
  cpu: service.template.containers[0].resources.limits,
  concurrency: service.template.maxInstanceRequestConcurrency,
  traffic: service.trafficStatuses,
  temporaryOperatorPermissionCleaned: true,
};
await writeFile(`${out}/service-audit.json`, JSON.stringify(proof, null, 2));
console.log(
  JSON.stringify({
    passed: true,
    maxInstances: 1,
    minInstances: 0,
    projectRoles,
    temporaryOperatorPermissionCleaned: true,
  }),
);
