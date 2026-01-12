const ollamaConnectionButton = document.getElementById('ollama-connect-button') as HTMLButtonElement;
const sendButton = document.getElementById('send-button') as HTMLButtonElement;
const promptInput = document.getElementById('prompt-input') as HTMLInputElement;
const aiResponse = document.getElementById('response-placeholder') as HTMLParagraphElement;
const ollamaStatusLabel = document.getElementById('ollama-status-label-text') as HTMLSpanElement;

let debounce = false;
let userConnected = false

// TODO: Figure out a promise for this function, so it can use await, as it is breaking the backend right now
window.generalIPC.displayText(async (_event:Event, text:string) => {
    if (debounce) return;
    debounce = true;
    aiResponse.innerHTML = ""
    for (let i = 0; i < text.length; i++) {
        await new Promise(resolve => setTimeout(resolve, 10))
        const char = text[i]
        if (char === '\n') {
            aiResponse.innerHTML += '<br>'
        } else {
            aiResponse.innerHTML += char
        }
    }
    debounce = false;
})



sendButton.addEventListener('click', async () => {
    if (userConnected) { // check if ollama is setup
        console.log("send button clicked")
        const input = promptInput.value
        promptInput.value = ""
        await window.ollamaIPC.askOllama(input)
    }
})

ollamaConnectionButton.addEventListener('click', async () => {
    const ollamaIsSetup = await window.ollamaIPC.checkOllamaSetup()
    if (ollamaIsSetup) {
        await window.spotifyIPC.checkToken(); // refresh spotify token, since it might have expired
        userConnected = true
        ollamaStatusLabel.textContent = "Connected"
        ollamaConnectionButton.classList.add("hidden")
        document.documentElement.style.setProperty('--ollamaConnectionColor', '#53d769');
    }
})
