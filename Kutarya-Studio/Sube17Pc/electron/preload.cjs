const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('sube17', {
  platform: process.platform,
  quit: () => ipcRenderer.send('app:quit'),
  getSelectedMusic: () => ipcRenderer.invoke('music:get-selection'),
  selectMusic: () => ipcRenderer.invoke('music:select'),
  clearSelectedMusic: () => ipcRenderer.invoke('music:clear-selection'),
  versions: {
    chrome: process.versions.chrome,
    electron: process.versions.electron,
  },
});
