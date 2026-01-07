const {ipcMain, BrowserWindow} = require('electron')
const fs = require('fs')
const http = require("node:http");
const path = require("node:path");

// Getting Token Helper Methods

const base64encode = (input) => {
  return btoa(String.fromCharCode(...new Uint8Array(input)))
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
}

const sha256 = async (plain) => {
  const encoder = new TextEncoder()
  const data = encoder.encode(plain)
  return crypto.subtle.digest('SHA-256', data)
}

//
exports.registerHandlers = (mainWindow) => {
    ipcMain.handle("checkToken", async (event) => { // this will check if the Spotify token is empty or not
        const userToken = fs.readFileSync("renderer/public/userSpotifyToken.txt", "utf-8")
        console.log(userToken)
        if (userToken == "") {
          return false
        } else {
          return true
        }
    })

    ipcMain.handle("spotUserAuth", async (event, codeVerifier) => { // getting User Token
        console.log(mainWindow)
        // needed codeVerifier for Token Exchange
        const codeChallengeMethod = "S256" // code challenge method
        const redirectUri = "http://[::1]:8888/" // redirect uri
        const clientId = "a22b7b37b77c44f18a7530b663131498" // client ID
        const hashed = await sha256(codeVerifier)

        const codeChallenge = base64encode(hashed) // code challenge

        const urlParams = new URLSearchParams({
            response_type: "code",
            client_id: clientId,
            scope: "user-read-private user-read-email",
            redirect_uri: redirectUri,
            code_challenge_method: codeChallengeMethod,
            code_challenge: codeChallenge,
        }).toString()

        const fullUrl = "https://accounts.spotify.com/authorize?" + urlParams

        const tempWindow = new BrowserWindow({
            width: 800,
            height: 600,
            webPreferences: {
                nodeIntegration: false,      // never allow Node in auth page
                contextIsolation: true,      // isolate the page
            }
        })

        tempWindow.loadURL(fullUrl)

        tempWindow.webContents.on('will-navigate', async (event, newUrl) => { // intercepts the callback
            event.preventDefault()
            const code = new URL(newUrl).searchParams.get("code") // code, need to exchange this for token

            urlparams = new URLSearchParams({
                grant_type: "authorization_code",
                code,
                redirect_uri: redirectUri,
                client_id: clientId,
                code_verifier: codeVerifier
            }).toString()

            const urlHeaders = {
                'Content-Type': 'application/x-www-form-urlencoded',
            }

            const response = await fetch("https://accounts.spotify.com/api/token?" + urlparams,
                {method: "POST", headers: urlHeaders})
            const responseJson = await response.json()
            if (response.status != 200) mainWindow.webContents.send("authFailure")
            const accessToken = responseJson.access_token // TOKEN SUCCESS
            console.log(accessToken)
            fs.writeFileSync("renderer/public/userSpotifyToken.txt", accessToken) // token in txt file
            tempWindow.close()
            mainWindow.webContents.send("authSuccess")
        })
    })
}








