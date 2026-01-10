// Put all the contextbridges in this file

const {contextBridge, ipcRenderer} = require('electron')

// Spotify ContextBridge

contextBridge.exposeInMainWorld('spotifyIPC', {

    //Checks to see if the spotify token is stored in userSpotifyToken.txt
    checkToken: () => ipcRenderer.invoke("checkToken"),

    //opens browser window of spotify auth page, and waits for user to authorize
    spotUserAuth: (codeVerifier) => ipcRenderer.invoke("spotUserAuth", codeVerifier),

    // gets your Spotify Profile Picture in 30 x 30
    getSpotPFP: () => ipcRenderer.invoke("getSpotPFP"),

    // Sent when auth is successful
    authSuccess: (callback) => ipcRenderer.on("authSuccess", callback),

    // Sent when auth fails
    authFailure: (callback) => ipcRenderer.on("authFailure", callback),

})

contextBridge.exposeInMainWorld('ollamaIPC', {

    // userInput interacts with the ollama model
    askOllama: (userInput) => ipcRenderer.invoke("askOllama", userInput),

    // checks to see if ollama is setup correctly, and returns a boolean otherwise
    checkOllamaSetup: () => ipcRenderer.invoke("checkOllamaSetup"),


})

contextBridge.exposeInMainWorld('generalIPC', {

    // Displays text in the main window on the renderer
    displayText: (text) => ipcRenderer.on("displayText", text),

})