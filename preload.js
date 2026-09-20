const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
  // Notes Storage
  loadNotes: () => ipcRenderer.invoke('get-notes'),
  saveNotes: (notesData) => ipcRenderer.invoke('save-notes', notesData),

  // Window Controls
  setOpacity: (val) => ipcRenderer.send('set-opacity', val),
  togglePin: (val) => ipcRenderer.send('toggle-pin', val),
  setGhostMode: (val) => ipcRenderer.send('set-ghost-mode', val),
  toggleCollapse: (val) => ipcRenderer.send('toggle-collapse', val),
  minimizeWindow: () => ipcRenderer.send('window-minimize'),
  hideWindow: () => ipcRenderer.send('window-hide'),
  quitApp: () => ipcRenderer.send('window-quit'),

  // Event Listeners from Main Process
  onGhostModeChanged: (callback) => {
    ipcRenderer.on('ghost-mode-changed', (_event, value) => callback(value));
  },
  onPinStatusChanged: (callback) => {
    ipcRenderer.on('pin-status-changed', (_event, value) => callback(value));
  }
});
