const { app, BrowserWindow} = require('electron')
const path = require("node:path");
// Main Window
let mainWindow ;

// Initialize Handlers
const spotHandlers = require("./Handlers/SpotifyHandlers")
const ollamaHandlers = require("./Handlers/OllamaHandlers")

const createWindow = () => {
    mainWindow = new BrowserWindow({

    //autoHideMenuBar: true,
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'Preload.js')
    }
  })
  mainWindow.loadURL('http://[::1]:5173/')
}

app.whenReady().then(() => {
    // Register Handlers here
    createWindow() // create window first so that mainWindow can be sent to the handlers
    spotHandlers.registerHandlers(mainWindow);
    ollamaHandlers.registerHandlers(mainWindow);
})