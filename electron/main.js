const { app, BrowserWindow, dialog, ipcMain } = require('electron')
const path = require('path')
const isDev = process.env.NODE_ENV === 'development'

// Store window state for persistence
let windowState = {
  width: 1400,
  height: 900,
  x: undefined,
  y: undefined,
  isMaximized: false
}

let mainWindow

/**
 * Enhanced createWindow function with:
 * - Window size persistence
 * - Security best practices
 * - Proper error handling
 * - Development mode support
 */
function createWindow () {
  const win = new BrowserWindow({
    width: windowState.width,
    height: windowState.height,
    minWidth: 800,
    minHeight: 600,
    x: windowState.x,
    y: windowState.y,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,      // Security: disable Node integration
      contextIsolation: true,      // Security: isolate renderer context
      sandbox: true,               // Security: enable sandbox
      enableRemoteModule: false    // Security: disable remote module
    },
    icon: path.join(__dirname, 'assets', 'icon.png') // Add app icon
  })

  // Restore window maximized state
  if (windowState.isMaximized) {
    win.maximize()
  }

  // Save window state on close
  win.on('close', () => {
    windowState = win.getBounds()
    windowState.isMaximized = win.isMaximized()
  })

  // Load the app
  const startURL = isDev
    ? 'http://localhost:5173' // Vite dev server
    : `file://${path.join(__dirname, '../frontend/dist/index.html')}`

  win.loadURL(startURL).catch(err => {
    console.error('Failed to load application:', err)
    dialog.showErrorBox(
      'Startup Error',
      'Failed to load application. Please restart.\n\n' + err.message
    )
  })

  // Open DevTools in development
  if (isDev) {
    win.webContents.openDevTools()
  }

  return win
}

/**
 * App event handlers
 */

// Create window when app is ready
app.on('ready', () => {
  mainWindow = createWindow()
})

// Quit when all windows are closed
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

// Re-create window when app is activated (macOS)
app.on('activate', () => {
  if (mainWindow === null) {
    mainWindow = createWindow()
  }
})

/**
 * IPC handlers for secure communication
 * (Add your custom IPC handlers here)
 */

ipcMain.handle('get-app-version', () => {
  return app.getVersion()
})

ipcMain.handle('get-app-path', (event, name) => {
  return app.getPath(name)
})
