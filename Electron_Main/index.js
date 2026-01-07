const { app, BrowserWindow} = require('electron')
const path = require("node:path");
// Main Window
let mainWindow ;

// Initialize Handlers
const spotHandlers = require("./Handlers/SpotifyHandlers")

const createWindow = () => {
    mainWindow = new BrowserWindow({

    //autoHideMenuBar: true,
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'Preload.js')
    }
  })
    console.log(mainWindow)
  mainWindow.loadURL('http://[::1]:5173/')
}

app.whenReady().then(() => {
    // Register Handlers here
    console.log(mainWindow)
    createWindow() // create window first so that mainWindow can be sent to the handlers
    spotHandlers.registerHandlers(mainWindow);
})