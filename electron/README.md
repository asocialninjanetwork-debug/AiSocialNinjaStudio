# Electron Desktop Application

AI Social Ninja Studio - Desktop wrapper for the web application.

## Setup

```bash
cd electron
npm install
```

## Development

In separate terminals:

```bash
# Terminal 1: Start Vite dev server
cd frontend
npm run dev

# Terminal 2: Start Electron app
cd electron
npm run dev
```

## Build

```bash
# Build frontend
cd frontend
npm run build

# Build Electron app
cd electron
npm run build-electron
```

## Features

✅ **Window State Persistence** - Remember user's window size and position  
✅ **Security** - Node integration disabled, context isolation enabled  
✅ **Development Mode** - Auto-open DevTools and Vite HMR support  
✅ **Error Handling** - User-friendly error dialogs  
✅ **Multi-platform** - Windows, macOS, Linux support  

## Structure

- `main.js` - Main process (window management, IPC)
- `preload.js` - Preload script (secure IPC exposure)
- `assets/` - App icons and resources

## IPC Communication

Use the exposed `window.electron` API in your React components:

```javascript
// In your React component
const version = await window.electron.getAppVersion()
console.log('App version:', version)
```
