export interface OllamaIPC {
    askOllama: (userInput: string) => Promise<void>,
    checkOllamaSetup: () => Promise<boolean>,
    authSuccess: (callback: () => void) => void,
    authFailure: (callback: () => void) => void,
}

export interface SpotifyIPC {
    checkToken: () => Promise<boolean>,
    spotUserAuth: (data: string) => Promise<boolean>,
    getSpotPFP: () => Promise<string>,
    authSuccess: (callback: () => void) => void,
    authFailure: (callback: () => void) => void,
}

export interface GeneralIPC {
    displayText: (callback: (event: Event, text:string) => void) => void,
}

declare global {
    interface Window {
        ollamaIPC: OllamaIPC
        spotifyIPC: SpotifyIPC
        generalIPC: GeneralIPC
    }
}

