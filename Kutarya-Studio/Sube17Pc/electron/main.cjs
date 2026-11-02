const { app, BrowserWindow, dialog, ipcMain, net, protocol } = require('electron');
const fs = require('node:fs');
const path = require('node:path');
const { pathToFileURL } = require('node:url');

// Paketlenmiş oyun ortam değişkeniyle uzak bir sayfaya yönlendirilemez.
function getDevServerUrl() {
  if (app.isPackaged || !process.env.VITE_DEV_SERVER_URL) return null;
  try {
    const url = new URL(process.env.VITE_DEV_SERVER_URL);
    if (
      url.protocol === 'http:' &&
      ['127.0.0.1', 'localhost', '[::1]'].includes(url.hostname) &&
      !url.username && !url.password
    ) return url.href;
  } catch {
    // Geçersiz geliştirme adresinde yerel derlemeyi kullan.
  }
  return null;
}

const DEV_SERVER_URL = getDevServerUrl();
const LOCAL_DOCUMENT_URL = pathToFileURL(path.join(__dirname, '..', 'dist', 'index.html')).href;
const SUPPORTED_AUDIO_EXTENSIONS = new Set([
  '.aac',
  '.flac',
  '.m4a',
  '.mp3',
  '.ogg',
  '.wav',
]);
let mainWindow = null;
let selectedMusicPath = null;

protocol.registerSchemesAsPrivileged([
  {
    scheme: 'sube17-audio',
    privileges: {
      standard: true,
      secure: true,
      stream: true,
      supportFetchAPI: true,
      corsEnabled: true,
    },
  },
]);

app.setName('Şube 17');
app.commandLine.appendSwitch('autoplay-policy', 'no-user-gesture-required');

if (process.platform === 'win32') {
  app.setAppUserModelId('com.kutaryastudio.sube17');
}

function getAudioSettingsPath() {
  return path.join(app.getPath('userData'), 'audio-settings.json');
}

function isSupportedAudioFile(filePath) {
  try {
    if (
      typeof filePath !== 'string' ||
      !path.isAbsolute(filePath) ||
      !SUPPORTED_AUDIO_EXTENSIONS.has(path.extname(filePath).toLowerCase()) ||
      !fs.statSync(filePath).isFile()
    ) return false;
    fs.accessSync(filePath, fs.constants.R_OK);
    return true;
  } catch {
    return false;
  }
}

function loadSelectedMusicPath() {
  try {
    const settings = JSON.parse(fs.readFileSync(getAudioSettingsPath(), 'utf8'));
    const savedPath = settings?.selectedMusicPath;

    if (isSupportedAudioFile(savedPath)) {
      return savedPath;
    }
  } catch {
    return null;
  }

  return null;
}

function saveSelectedMusicPath(nextPath) {
  const settingsPath = getAudioSettingsPath();
  const temporaryPath = `${settingsPath}.tmp`;
  fs.mkdirSync(path.dirname(settingsPath), { recursive: true });
  fs.writeFileSync(
    temporaryPath,
    JSON.stringify({ selectedMusicPath: nextPath }, null, 2),
    'utf8',
  );
  // Kesilen yazma önceki geçerli ayar dosyasını bozmasın.
  fs.renameSync(temporaryPath, settingsPath);
}

function getSelectedMusicInfo() {
  if (!isSupportedAudioFile(selectedMusicPath)) {
    selectedMusicPath = null;
    return null;
  }

  return {
    name: path.basename(selectedMusicPath),
    source: `sube17-audio://selected/track?revision=${Date.now()}`,
  };
}

function isTrustedDocument(rawUrl) {
  try {
    const candidate = new URL(rawUrl);
    const expected = new URL(DEV_SERVER_URL || LOCAL_DOCUMENT_URL);
    return (
      candidate.protocol === expected.protocol &&
      candidate.host === expected.host &&
      candidate.pathname === expected.pathname &&
      !candidate.username && !candidate.password
    );
  } catch {
    return false;
  }
}

function isTrustedSender(event) {
  if (!mainWindow || mainWindow.isDestroyed()) return false;
  const contents = mainWindow.webContents;
  const frame = event.senderFrame;
  return (
    event.sender === contents &&
    frame != null && frame === contents.mainFrame &&
    isTrustedDocument(frame.url) &&
    (!DEV_SERVER_URL || frame.origin === new URL(DEV_SERVER_URL).origin)
  );
}

function createWindow() {
  const iconPath = DEV_SERVER_URL
    ? path.join(__dirname, '..', 'public', 'assets', 'app-icon.png')
    : path.join(__dirname, '..', 'dist', 'assets', 'app-icon.png');

  mainWindow = new BrowserWindow({
    width: 1440,
    height: 900,
    minWidth: 1024,
    minHeight: 640,
    backgroundColor: '#0b0b0a',
    icon: iconPath,
    autoHideMenuBar: true,
    show: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
    },
  });

  mainWindow.once('ready-to-show', () => mainWindow?.show());
  mainWindow.once('closed', () => {
    mainWindow = null;
  });

  const contents = mainWindow.webContents;
  contents.setWindowOpenHandler(() => ({ action: 'deny' }));
  contents.on('will-navigate', (event, url) => {
    if (!isTrustedDocument(event.url || url)) event.preventDefault();
  });
  contents.on('will-redirect', (event, url) => {
    if (!isTrustedDocument(event.url || url)) event.preventDefault();
  });
  contents.on('will-frame-navigate', (event) => {
    if (!event.isMainFrame || !isTrustedDocument(event.url)) event.preventDefault();
  });
  contents.on('will-attach-webview', (event) => event.preventDefault());
  contents.session.setPermissionRequestHandler((_contents, _permission, callback) => callback(false));
  contents.session.setPermissionCheckHandler(() => false);

  if (DEV_SERVER_URL) {
    mainWindow.loadURL(DEV_SERVER_URL);
  } else {
    mainWindow.loadFile(path.join(__dirname, '..', 'dist', 'index.html'));
  }
}

ipcMain.on('app:quit', (event) => {
  if (isTrustedSender(event)) mainWindow.close();
});

ipcMain.handle('music:get-selection', (event) => (
  isTrustedSender(event) ? getSelectedMusicInfo() : null
));

ipcMain.handle('music:select', async (event) => {
  if (!isTrustedSender(event)) return { canceled: true, error: 'untrusted-sender' };
  let result;
  try {
    result = await dialog.showOpenDialog(mainWindow, {
      title: 'Arka plan müziği seç',
      properties: ['openFile'],
      filters: [
        {
          name: 'Desteklenen ses dosyaları',
          extensions: ['mp3', 'wav', 'ogg', 'm4a', 'aac', 'flac'],
        },
      ],
    });
  } catch {
    return { canceled: true, error: 'dialog-failed' };
  }

  if (!isTrustedSender(event)) return { canceled: true };

  if (result.canceled || result.filePaths.length === 0) {
    return { canceled: true };
  }

  const [filePath] = result.filePaths;

  if (!isSupportedAudioFile(filePath)) {
    return { canceled: true, error: 'unsupported-file' };
  }

  try {
    saveSelectedMusicPath(filePath);
  } catch {
    return { canceled: true, error: 'settings-write-failed' };
  }
  selectedMusicPath = filePath;

  return {
    canceled: false,
    selection: getSelectedMusicInfo(),
  };
});

ipcMain.handle('music:clear-selection', (event) => {
  if (!isTrustedSender(event)) return { cleared: false, error: 'untrusted-sender' };
  try {
    saveSelectedMusicPath(null);
  } catch {
    return { cleared: false, error: 'settings-write-failed' };
  }
  selectedMusicPath = null;
  return { cleared: true };
});

app.whenReady().then(() => {
  selectedMusicPath = loadSelectedMusicPath();

  protocol.handle('sube17-audio', async (request) => {
    const requestUrl = new URL(request.url);

    if (
      requestUrl.hostname !== 'selected' ||
      requestUrl.pathname !== '/track' ||
      !['GET', 'HEAD'].includes(request.method) ||
      !isSupportedAudioFile(selectedMusicPath)
    ) {
      return new Response('Ses dosyası bulunamadı.', { status: 404 });
    }

    try {
      return await net.fetch(pathToFileURL(selectedMusicPath).toString(), {
        method: request.method,
        headers: request.headers,
      });
    } catch {
      return new Response('Ses dosyası okunamadı.', { status: 404 });
    }
  });

  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
