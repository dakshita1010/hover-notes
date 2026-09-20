const { app, BrowserWindow, ipcMain, globalShortcut, Tray, Menu, nativeImage, screen } = require('electron');
const path = require('path');
const fs = require('fs');

let mainWindow = null;
let tray = null;
let isGhostMode = false;
let isPinned = true;
let isCollapsed = false;
let normalBounds = { width: 380, height: 480 };

// Ensure single instance lock
const gotTheLock = app.requestSingleInstanceLock();
if (!gotTheLock) {
  app.quit();
} else {
  app.on('second-instance', () => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.show();
      mainWindow.focus();
    }
  });
}

// Storage path for notes
const getNotesFilePath = () => {
  return path.join(app.getPath('userData'), 'hover-notes-data.json');
};

function createTray() {
  const iconPath = path.join(__dirname, 'assets', 'icon.png');
  const trayIcon = nativeImage.createFromPath(iconPath);

  tray = new Tray(trayIcon);
  tray.setToolTip('HoverNotes - Floating Notes');

  const contextMenu = Menu.buildFromTemplate([
    {
      label: 'Show / Hide Note',
      accelerator: 'Alt+Shift+N',
      click: () => toggleWindowVisibility()
    },
    {
      label: 'Toggle Ghost Mode (Click-Through)',
      accelerator: 'Alt+Shift+G',
      click: () => toggleGhostMode()
    },
    {
      label: 'Always on Top',
      type: 'checkbox',
      checked: isPinned,
      click: (item) => {
        isPinned = item.checked;
        mainWindow.setAlwaysOnTop(isPinned, 'screen-saver');
        mainWindow.webContents.send('pin-status-changed', isPinned);
      }
    },
    { type: 'separator' },
    {
      label: 'Reset Position',
      click: () => resetWindowPosition()
    },
    { type: 'separator' },
    {
      label: 'Quit HoverNotes',
      click: () => {
        app.isQuitting = true;
        app.quit();
      }
    }
  ]);

  tray.setContextMenu(contextMenu);
  tray.on('click', () => toggleWindowVisibility());
}

function resetWindowPosition() {
  if (!mainWindow) return;
  const primaryDisplay = screen.getPrimaryDisplay();
  const { width: screenWidth, height: screenHeight } = primaryDisplay.workAreaSize;
  const winWidth = 380;
  const winHeight = 480;
  mainWindow.setBounds({
    x: Math.round(screenWidth - winWidth - 24),
    y: Math.round((screenHeight - winHeight) / 3),
    width: winWidth,
    height: winHeight
  });
}

function createWindow() {
  const primaryDisplay = screen.getPrimaryDisplay();
  const { width: screenWidth, height: screenHeight } = primaryDisplay.workAreaSize;

  const defaultWidth = 380;
  const defaultHeight = 480;
  const defaultX = Math.round(screenWidth - defaultWidth - 28);
  const defaultY = Math.round(80);

  mainWindow = new BrowserWindow({
    width: defaultWidth,
    height: defaultHeight,
    x: defaultX,
    y: defaultY,
    minWidth: 260,
    minHeight: 180,
    frame: false,
    transparent: true,
    alwaysOnTop: true,
    skipTaskbar: false,
    hasShadow: true,
    resizable: true,
    icon: path.join(__dirname, 'assets', 'icon.png'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
      spellcheck: false
    }
  });

  // Windows topmost layering to stay above all normal apps & browsers
  mainWindow.setAlwaysOnTop(true, 'screen-saver');
  mainWindow.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true });

  mainWindow.loadFile(path.join(__dirname, 'src', 'index.html'));

  mainWindow.on('close', (event) => {
    if (!app.isQuitting) {
      event.preventDefault();
      mainWindow.hide();
    }
  });

  // Track window size before collapse
  mainWindow.on('resize', () => {
    if (!isCollapsed && mainWindow) {
      const bounds = mainWindow.getBounds();
      normalBounds = { width: bounds.width, height: bounds.height };
    }
  });
}

function toggleWindowVisibility() {
  if (!mainWindow) return;
  if (mainWindow.isVisible()) {
    mainWindow.hide();
  } else {
    mainWindow.show();
    mainWindow.focus();
  }
}

function toggleGhostMode(forceVal) {
  if (!mainWindow) return;
  isGhostMode = forceVal !== undefined ? forceVal : !isGhostMode;

  if (isGhostMode) {
    // When ghost mode is enabled, clicks pass straight through the window
    mainWindow.setIgnoreMouseEvents(true, { forward: true });
  } else {
    // Standard mode: window handles clicks
    mainWindow.setIgnoreMouseEvents(false);
  }

  mainWindow.webContents.send('ghost-mode-changed', isGhostMode);
}

// Global Shortcuts
function registerGlobalShortcuts() {
  // Alt+Shift+N to summon or dismiss the note from any app
  globalShortcut.register('Alt+Shift+N', () => {
    toggleWindowVisibility();
  });

  // Alt+Shift+G to quickly toggle Ghost (Click-Through) mode
  globalShortcut.register('Alt+Shift+G', () => {
    toggleGhostMode();
  });
}

// App Lifecycle
app.whenReady().then(() => {
  createWindow();
  createTray();
  registerGlobalShortcuts();

  if (process.env.HOVERNOTES_TEST === '1') {
    mainWindow.webContents.once('did-finish-load', () => {
      console.log('HOVERNOTES_READY: App loaded window and tray cleanly.');
      setTimeout(() => {
        app.isQuitting = true;
        app.exit(0);
      }, 500);
    });
  }

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('will-quit', () => {
  globalShortcut.unregisterAll();
});

// IPC Handlers
ipcMain.handle('get-notes', async () => {
  try {
    const filePath = getNotesFilePath();
    if (fs.existsSync(filePath)) {
      const data = fs.readFileSync(filePath, 'utf-8');
      return JSON.parse(data);
    }
  } catch (err) {
    console.error('Error reading notes file:', err);
  }
  return null;
});

ipcMain.handle('save-notes', async (event, notesData) => {
  try {
    const filePath = getNotesFilePath();
    fs.writeFileSync(filePath, JSON.stringify(notesData, null, 2), 'utf-8');
    return { success: true };
  } catch (err) {
    console.error('Error saving notes file:', err);
    return { success: false, error: err.message };
  }
});

ipcMain.on('set-opacity', (event, opacity) => {
  if (mainWindow) {
    const safeOpacity = Math.max(0.15, Math.min(1.0, parseFloat(opacity)));
    mainWindow.setOpacity(safeOpacity);
  }
});

ipcMain.on('toggle-pin', (event, pinState) => {
  if (mainWindow) {
    isPinned = pinState;
    mainWindow.setAlwaysOnTop(isPinned, 'screen-saver');
  }
});

ipcMain.on('set-ghost-mode', (event, enable) => {
  toggleGhostMode(enable);
});

ipcMain.on('toggle-collapse', (event, collapse) => {
  if (!mainWindow) return;
  isCollapsed = collapse;
  const currentBounds = mainWindow.getBounds();

  if (isCollapsed) {
    normalBounds = { width: currentBounds.width, height: currentBounds.height };
    mainWindow.setResizable(false);
    mainWindow.setSize(normalBounds.width, 46);
  } else {
    mainWindow.setSize(normalBounds.width, normalBounds.height);
    mainWindow.setResizable(true);
  }
});

ipcMain.on('window-minimize', () => {
  if (mainWindow) mainWindow.minimize();
});

ipcMain.on('window-hide', () => {
  if (mainWindow) mainWindow.hide();
});

ipcMain.on('window-quit', () => {
  app.isQuitting = true;
  app.quit();
});
