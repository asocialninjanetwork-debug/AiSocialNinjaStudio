const { contextBridge, ipcRenderer } = require('electron')

/**
 * Preload script for secure IPC communication
 * Exposes a limited, safe API to the renderer process
 */

contextBridge.exposeInMainWorld('api', {
  /**
   * Send a message to the main process
   * @param {string} channel - The channel name
   * @param {any} data - The data to send
   */
  send: (channel, data) => {
    const validChannels = ['app:close', 'app:minimize', 'app:maximize']
    if (validChannels.includes(channel)) {
      ipcRenderer.send(channel, data)
    }
  },

  /**
   * Receive a message from the main process
   * @param {string} channel - The channel name
   * @param {function} callback - The callback function
   */
  receive: (channel, callback) => {
    const validChannels = ['app:ready', 'app:error']
    if (validChannels.includes(channel)) {
      ipcRenderer.on(channel, (event, ...args) => callback(...args))
    }
  },

  /**
   * Invoke an IPC handler in the main process
   * @param {string} channel - The channel name
   * @param {any} data - The data to send
   * @returns {Promise} The response from the main process
   */
  invoke: (channel, data) => {
    const validChannels = ['api:query', 'api:library', 'app:version']
    if (validChannels.includes(channel)) {
      return ipcRenderer.invoke(channel, data)
    }
    return Promise.reject(new Error(`Invalid channel: ${channel}`))
  }
})

console.log('Preload script loaded with context isolation enabled')
