const spotifyConnectionButton = document.getElementById('spot-connect-button') as HTMLButtonElement;
const spotifyStatusLabel = document.getElementById('spot-status-label-text') as HTMLSpanElement;

let popupOpen = false

async function userTokenExists() {
    const result = await window.spotifyIPC.checkToken();
    console.log(result)
    return result;
}

// Code Challenge

const generateRandomString = (length: number) => {
  const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const values = crypto.getRandomValues(new Uint8Array(length));
  return values.reduce((acc, x) => acc + possible[x % possible.length], "");
}

//

// spotify Token Events

window.spotifyIPC.authSuccess(() => {
    changeConnectionUI(true)
    popupOpen = false
})


window.spotifyIPC.authFailure(() => {
    changeConnectionUI(false)
    popupOpen = false
})

//

async function changeConnectionUI(on: boolean){
    if (on) {
        spotifyConnectionButton.classList.add("hidden")
        document.documentElement.style.setProperty('--spotConnectionColor', '#53d769');
        spotifyStatusLabel.textContent = "Connected"
    } else {
        console.log("not connected")
        document.documentElement.style.setProperty('--spotConnectionColor', '#e94560');
        spotifyStatusLabel.textContent = "Not Connected"
    }
}

changeConnectionUI(await userTokenExists())


spotifyConnectionButton.addEventListener('click', async () => {
    const tokenExists = await userTokenExists();
    if (!tokenExists && ! popupOpen) {
        popupOpen = true
        // since the button dissapears, this shouldnt be neccessary, but it is a failsave.
        // now use the spotify API to connect, later!

        const codeVerifier = generateRandomString(64)


        let worked = await window.spotifyIPC.spotUserAuth(codeVerifier)
        if (worked) {
            changeConnectionUI(true)
        }

    }
})