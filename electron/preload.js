const { contextBridge, ipcRenderer } = require('electron')

/**
 * Preload script for secure IPC communication
 * Exposes only safe APIs to the renderer process
 */

contextBridge.exposeInMainWorld('electron', {
  // App version
  getAppVersion: () => ipcRenderer.invoke('get-app-version'),
  
  // App paths
  getAppPath: (name) => ipcRenderer.invoke('get-app-path', name),
  
  // Add your custom IPC methods here
  // Example:
  // processFile: (filePath) => ipcRenderer.invoke('process-file', filePath)
})
