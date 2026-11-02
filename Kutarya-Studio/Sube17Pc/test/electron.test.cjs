const assert = require('node:assert/strict');
const { EventEmitter } = require('node:events');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const vm = require('node:vm');
const { pathToFileURL } = require('node:url');
const { spawnSync } = require('node:child_process');
const { createHash } = require('node:crypto');
const test = require('node:test');

const projectRoot = path.resolve(__dirname, '..');

function temporaryDirectory(t) {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'sube17-electron-'));
  t.after(() => {
    // Yalnız bu testin oluşturduğu, doğrulanmış geçici klasörü kaldır.
    assert.equal(path.dirname(directory), path.resolve(os.tmpdir()));
    assert.match(path.basename(directory), /^sube17-electron-/);
    fs.rmSync(directory, { recursive: true, force: true });
  });
  return directory;
}

async function createHarness(t, options = {}) {
  const directory = temporaryDirectory(t);
  const audioPath = path.join(directory, 'song.mp3');
  fs.writeFileSync(audioPath, 'test-audio');
  const settingsPath = path.join(directory, 'audio-settings.json');
  if (options.saved) fs.writeFileSync(settingsPath, JSON.stringify({ selectedMusicPath: audioPath }));
  const handlers = new Map();
  const listeners = new Map();
  let window;
  let ready;
  let protocolHandler;
  const state = { dialogCalls: 0, failWrite: false, failFetch: false, fetchCalls: [] };

  class Window extends EventEmitter {
    constructor(settings) {
      super();
      this.settings = settings;
      this.webContents = new EventEmitter();
      this.webContents.mainFrame = { url: '', origin: '' };
      this.webContents.setWindowOpenHandler = (callback) => { this.openHandler = callback; };
      this.webContents.session = {
        setPermissionRequestHandler: (callback) => { this.permissionHandler = callback; },
        setPermissionCheckHandler: (callback) => { this.permissionCheck = callback; },
      };
      window = this;
    }
    isDestroyed() { return this.destroyed || false; }
    show() {}
    close() { this.destroyed = true; this.emit('closed'); }
    loadURL(url) {
      this.loadedUrl = url;
      this.webContents.mainFrame.url = url;
      this.webContents.mainFrame.origin = new URL(url).origin;
    }
    loadFile(filePath) { this.loadURL(pathToFileURL(filePath).href); }
    static getAllWindows() { return window && !window.isDestroyed() ? [window] : []; }
  }
  const electron = {
    app: {
      isPackaged: options.packaged || false,
      setName() {}, setAppUserModelId() {}, quit() {}, on() {},
      commandLine: { appendSwitch() {} },
      getPath: () => directory,
      whenReady: () => ({ then: (callback) => { ready = callback; } }),
    },
    BrowserWindow: Window,
    ipcMain: {
      on: (channel, callback) => listeners.set(channel, callback),
      handle: (channel, callback) => handlers.set(channel, callback),
    },
    dialog: { showOpenDialog: async () => {
      state.dialogCalls += 1;
      if (options.dialogFailure) throw new Error('dialog unavailable');
      return { canceled: false, filePaths: [state.nextAudioPath || audioPath] };
    } },
    protocol: {
      registerSchemesAsPrivileged() {},
      handle: (_scheme, callback) => { protocolHandler = callback; },
    },
    net: { fetch: async (...args) => {
      state.fetchCalls.push(args);
      if (state.failFetch) throw new Error('file disappeared');
      return new Response('audio', { status: 200 });
    } },
  };
  const sandbox = {
    require: (id) => {
      if (id === 'electron') return electron;
      if (id === 'node:fs') return {
        ...fs,
        writeFileSync(...args) {
          if (state.failWrite) throw new Error('disk full');
          return fs.writeFileSync(...args);
        },
      };
      return require(id);
    },
    __dirname: path.join(projectRoot, 'electron'),
    process: { platform: process.platform, env: { VITE_DEV_SERVER_URL: options.devUrl } },
    URL, Response,
  };
  vm.runInNewContext(fs.readFileSync(path.join(projectRoot, 'electron', 'main.cjs'), 'utf8'), sandbox);
  await ready();
  const event = () => ({ sender: window.webContents, senderFrame: window.webContents.mainFrame });
  return {
    directory, audioPath, settingsPath, state, window, event,
    invoke: (channel, input = event()) => handlers.get(channel)(input),
    send: (channel, input = event()) => listeners.get(channel)(input),
    requestAudio: (url = 'sube17-audio://selected/track', method = 'GET') => protocolHandler({ url, method, headers: { Range: 'bytes=0-4' } }),
  };
}

test('Paketlenmiş oyun geliştirme adresini dikkate almaz', async (t) => {
  const h = await createHarness(t, { packaged: true, devUrl: 'http://127.0.0.1:5173' });
  assert.equal(new URL(h.window.loadedUrl).protocol, 'file:');
  assert.equal(h.window.settings.webPreferences.sandbox, true);
  assert.equal(h.window.settings.webPreferences.nodeIntegration, false);
});

test('Geliştirme yalnız yerel HTTP adresini yükler', async (t) => {
  const local = await createHarness(t, { devUrl: 'http://127.0.0.1:5173' });
  assert.equal(local.window.loadedUrl, 'http://127.0.0.1:5173/');
  const remote = await createHarness(t, { devUrl: 'http://127.0.0.1.evil.example:5173' });
  assert.equal(new URL(remote.window.loadedUrl).protocol, 'file:');
});

test('Sayfa yönlendirmesi, alt çerçeve ve yeni pencere oyun dışına çıkamaz', async (t) => {
  const h = await createHarness(t);
  for (const type of ['will-navigate', 'will-redirect']) {
    let prevented = false;
    h.window.webContents.emit(type, { preventDefault() { prevented = true; } }, 'https://untrusted.example/');
    assert.equal(prevented, true, type);
    prevented = false;
    h.window.webContents.emit(type, { preventDefault() { prevented = true; } }, h.window.loadedUrl);
    assert.equal(prevented, false, `${type} yerel belge`);
  }
  let prevented = false;
  h.window.webContents.emit('will-frame-navigate', {
    isMainFrame: false, url: h.window.loadedUrl, preventDefault() { prevented = true; },
  });
  assert.equal(prevented, true);
  assert.equal(h.window.openHandler({ url: h.window.loadedUrl }).action, 'deny');
  assert.equal(h.window.permissionCheck(), false);
});

test('Yabancı pencere ve alt çerçeve IPC ile müzik okuyamaz veya seçemez', async (t) => {
  const h = await createHarness(t, { saved: true });
  const untrusted = [
    { sender: {}, senderFrame: h.event().senderFrame },
    { sender: h.event().sender, senderFrame: { ...h.event().senderFrame } },
    { sender: h.event().sender, senderFrame: null },
  ];
  for (const event of untrusted) {
    assert.equal(await h.invoke('music:get-selection', event), null);
    assert.equal((await h.invoke('music:select', event)).error, 'untrusted-sender');
    assert.equal((await h.invoke('music:clear-selection', event)).cleared, false);
    h.send('app:quit', event);
    assert.equal(h.window.isDestroyed(), false);
  }
  assert.equal(h.state.dialogCalls, 0);
});

test('Geliştirme ana çerçevesi belge ve origin ile doğrulanır', async (t) => {
  const h = await createHarness(t, { saved: true, devUrl: 'http://127.0.0.1:5173' });
  assert.equal((await h.invoke('music:get-selection')).name, 'song.mp3');
  h.window.webContents.mainFrame.origin = 'https://evil.example';
  assert.equal(await h.invoke('music:get-selection'), null);
});

test('Seçilen müzik atomik kaydedilir ve temizlenir', async (t) => {
  const h = await createHarness(t);
  const selected = await h.invoke('music:select');
  assert.equal(selected.canceled, false);
  assert.equal(selected.selection.name, 'song.mp3');
  assert.equal(JSON.parse(fs.readFileSync(h.settingsPath)).selectedMusicPath, h.audioPath);
  assert.equal(fs.existsSync(`${h.settingsPath}.tmp`), false);
  assert.equal((await h.invoke('music:clear-selection')).cleared, true);
  assert.equal(await h.invoke('music:get-selection'), null);
  assert.equal(JSON.parse(fs.readFileSync(h.settingsPath)).selectedMusicPath, null);
});

test('Disk hatası önceki müzik seçimini kaybetmez ve beklenen hata döner', async (t) => {
  const h = await createHarness(t, { saved: true });
  const before = fs.readFileSync(h.settingsPath, 'utf8');
  h.state.failWrite = true;
  assert.equal((await h.invoke('music:select')).error, 'settings-write-failed');
  assert.equal((await h.invoke('music:clear-selection')).error, 'settings-write-failed');
  assert.equal((await h.invoke('music:get-selection')).name, 'song.mp3');
  assert.equal(fs.readFileSync(h.settingsPath, 'utf8'), before);
});

test('Diyalog hatası IPC promise reddi yerine kontrollü cevap verir', async (t) => {
  const h = await createHarness(t, { dialogFailure: true });
  assert.equal((await h.invoke('music:select')).error, 'dialog-failed');
});

test('Ses uzantılı klasör ve eksik dosya seçim olarak kabul edilmez', async (t) => {
  const h = await createHarness(t);
  h.state.nextAudioPath = path.join(h.directory, 'folder.mp3');
  fs.mkdirSync(h.state.nextAudioPath);
  assert.equal((await h.invoke('music:select')).error, 'unsupported-file');
  h.state.nextAudioPath = path.join(h.directory, 'missing.mp3');
  assert.equal((await h.invoke('music:select')).error, 'unsupported-file');
});

test('Ses protokolü yalnız seçili parçayı sunar ve dosya kaybını karşılar', async (t) => {
  const h = await createHarness(t, { saved: true });
  assert.equal((await h.requestAudio()).status, 200);
  assert.equal(h.state.fetchCalls[0][1].headers.Range, 'bytes=0-4');
  for (const url of ['sube17-audio://elsewhere/track', 'sube17-audio://selected/private.txt']) {
    assert.equal((await h.requestAudio(url)).status, 404);
  }
  assert.equal((await h.requestAudio(undefined, 'POST')).status, 404);
  h.state.failFetch = true;
  assert.equal((await h.requestAudio()).status, 404);
});

test('Yayın kontrolü alt klasördeki kayıtlı varlığı kabul eder, kayıtsızı bulur', (t) => {
  const directory = temporaryDirectory(t);
  fs.mkdirSync(path.join(directory, 'scripts'));
  fs.mkdirSync(path.join(directory, 'public', 'assets', 'audio'), { recursive: true });
  const script = path.join(directory, 'scripts', 'check-publication.cjs');
  fs.copyFileSync(path.join(projectRoot, 'scripts', 'check-publication.cjs'), script);
  const data = 'original audio';
  fs.writeFileSync(path.join(directory, 'public', 'assets', 'audio', 'door.wav'), data);
  fs.writeFileSync(path.join(directory, 'asset-provenance.json'), JSON.stringify({ assets: [{
    path: 'public/assets/audio/door.wav', origin: 'Test kaynağı', rightsBasis: 'Özgün',
    publishable: true, sha256: createHash('sha256').update(data).digest('hex').toUpperCase(),
  }] }));
  fs.writeFileSync(path.join(directory, 'package-lock.json'), JSON.stringify({ packages: { '': {} } }));
  let result = spawnSync(process.execPath, [script], { encoding: 'utf8' });
  assert.equal(result.status, 0, result.stderr);
  fs.writeFileSync(path.join(directory, 'public', 'assets', 'audio', 'unknown.wav'), 'unknown');
  result = spawnSync(process.execPath, [script], { encoding: 'utf8' });
  assert.equal(result.status, 1);
  assert.match(result.stderr, /audio\/unknown\.wav kaynak manifestinde/);
});
