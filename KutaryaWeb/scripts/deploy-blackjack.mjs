// Yalnız bu yeni oyun servisi. Bu betik açık yayın onayı alınmadan çalıştırılmaz.
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { readFile, writeFile } from 'node:fs/promises';
import { cloudGet, cloudRequest, projectId } from './firebase-cloud.mjs';
const out = 'artifacts/releases/blackjack/2.0.0';
assert.equal(process.env.KUTARYA_RELEASE_APPROVED, 'true', 'Blackjack/Cloud Run ve site yayını için kullanıcı onayı gerekir.');
assert.equal(projectId, 'kutarya-ai-3169');
for (const name of ['browser', 'site']) assert.equal(JSON.parse(await readFile(`${out}/${name}-acceptance.json`, 'utf8')).passed, true);
const email = `kutarya-blackjack-runtime@${projectId}.iam.gserviceaccount.com`;
const existing = await cloudGet(`https://iam.googleapis.com/v1/projects/${projectId}/serviceAccounts`);
if (!existing.accounts?.some(a => a.email === email)) await cloudRequest(`https://iam.googleapis.com/v1/projects/${projectId}/serviceAccounts`, 'POST', { accountId: 'kutarya-blackjack-runtime', serviceAccount: { displayName: 'Kutarya Blackjack — veri/sır yetkisi olmayan runtime' } });
// Bu hesaba proje IAM rolü verilmez; konteks aynı sürümün kopyalanmış çekirdeğidir.
const args = ['run', 'deploy', 'kutarya-blackjack', `--project=${projectId}`, '--region=europe-west1', `--source=${out}/server`, '--min-instances=0', '--max-instances=1', '--max=1', '--min=0', '--concurrency=150', '--cpu=1', '--memory=256Mi', '--timeout=3600', '--allow-unauthenticated', `--service-account=${email}`, '--quiet', '--format=json'];
const child = spawn('C:/Program Files (x86)/Google/Cloud SDK/google-cloud-sdk/platform/bundledpython/python.exe', ['C:/Program Files (x86)/Google/Cloud SDK/google-cloud-sdk/lib/gcloud.py', ...args], { stdio: ['ignore', 'pipe', 'pipe'], windowsHide: true, env: { ...process.env, CLOUDSDK_CORE_DISABLE_PROMPTS: '1' } });
let output = '', err = '';
child.stdout.on('data', bytes => { output += bytes; }); child.stderr.on('data', bytes => { err += bytes; if (/(?:enter|provide|input)[^\n]{0,60}(?:password|parola|şifre)/i.test(err)) child.kill(); process.stdout.write(bytes); });
const exitCode = await new Promise((done, fail) => { child.on('exit', done); child.on('error', fail); });
await writeFile(`${out}/service-deploy.log`, err); assert.equal(exitCode, 0, 'Servis yayımlanamadı; etkileşimli login açılmaz.');
const response = JSON.parse(output), url = response.status?.url || response.uri;
assert(url && new URL(url).protocol === 'https:');
await writeFile(`${out}/service.json`, JSON.stringify({ at: new Date().toISOString(), projectId, url, revision: response.status?.latestReadyRevisionName || response.latestReadyRevision, serviceAccount: email, minInstances: 0, maxInstances: 1 }, null, 2));
console.log(`Blackjack servisi: ${url}. Runtime yeniden hazırlanmalı; gerçek bulut kabulü ayrıca gerekir.`);
