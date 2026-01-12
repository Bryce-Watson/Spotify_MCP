const {ipcMain, BrowserWindow} = require('electron')
const fs = require('fs')
const http = require("node:http");
const path = require("node:path");
const MCP_Tool_Functions = require("../MCP_Tool_Functions")
const spotifyClientID = "a22b7b37b77c44f18a7530b663131498"

// Spotify Functions

// using refresh token to get new access token

exports.renewSpotToken = async () => {
    console.log(Date.now() > MCP_Tool_Functions.getSpotExpiresIn())
    if (Date.now() > MCP_Tool_Functions.getSpotExpiresIn()) {
        MCP_Tool_Functions.replaceSpotToken()
        const urlHeaders = {
            'Content-Type': 'application/x-www-form-urlencoded',
        }
        const urlparams = new URLSearchParams({
            grant_type: "refresh_token",
            refresh_token: MCP_Tool_Functions.getSpotRefreshToken(),
            client_id: spotifyClientID
        }).toString()
        const response = await fetch("https://accounts.spotify.com/api/token",
            {method: "POST", headers: urlHeaders, body: urlparams})
        const responseJson = await response.json()
        responseJson.expires_in = Date.now() + (responseJson.expires_in * 1000)
        fs.writeFileSync("Electron_Main/userSpotifyToken.txt", JSON.stringify(await response.json()))
    }
}

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
        if (!MCP_Tool_Functions.getSpotToken()) return false;
        exports.renewSpotToken();
        return true;
    })

    ipcMain.handle("spotUserAuth", async (event, codeVerifier) => { // getting User Token

        // needed codeVerifier for Token Exchange
        const codeChallengeMethod = "S256" // code challenge method
        const redirectUri = "http://[::1]:8888/" // redirect uri
        const clientId = spotifyClientID // client ID
        const hashed = await sha256(codeVerifier)

        const codeChallenge = base64encode(hashed) // code challenge

        const urlParams = new URLSearchParams({
            response_type: "code",
            client_id: clientId,
            scope: "user-read-private user-read-email user-read-currently-playing user-read-playback-state user-modify-playback-state",
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
            if (response.status !== 200) mainWindow.webContents.send("authFailure")
            // instead of sending only the access token to the txt file, we will send the entire json so we can use multiple componants of it
            responseJson.expires_in = Date.now() + (responseJson.expires_in * 1000)
            fs.writeFileSync("Electron_Main/userSpotifyToken.txt", JSON.stringify(responseJson)) // token in txt file
            tempWindow.close()
            mainWindow.webContents.send("displayText", "Successfully Connected to Spotify!\n\n Thank you for using my App ;)")
            mainWindow.webContents.send("authSuccess")
        })
    })

    ipcMain.handle("getSpotPFP", async () => {
        const urlHeaders = MCP_Tool_Functions.getHeader()
        const response = await fetch("https://api.spotify.com/v1/me", {headers: urlHeaders})
        const responseJson = await response.json()
        if (response.status === 200 && responseJson.images !== "") {
            return responseJson.images[1].url
        } else {
            return null
        }
    })
}








