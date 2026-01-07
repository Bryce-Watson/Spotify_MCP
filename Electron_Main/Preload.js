// Put all the contextbridges in this file

const {contextBridge, ipcRenderer} = require('electron')

// Spotify ContextBridge

contextBridge.exposeInMainWorld('spotifyIPC', {

    checkToken: () => ipcRenderer.invoke("checkToken"),

    spotUserAuth: (codeVerifier) => ipcRenderer.invoke("spotUserAuth", codeVerifier),

    authSuccess: (callback) => ipcRenderer.on("authSuccess", callback),

    authFailure: (callback) => ipcRenderer.on("authFailure", callback),

})