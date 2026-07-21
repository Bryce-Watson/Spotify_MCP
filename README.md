# Spotify MCP

An Electron desktop app that lets a local [Ollama](https://ollama.com) LLM control your Spotify playback through natural-language prompts. The model is given a small set of tools (search for a track, play a track, get the currently playing track) and calls them itself using Ollama's function-calling support, so you can ask things like *"play Dayvan Cowboy by Boards of Canada"* and it will search Spotify and start playback.

## How it works

- **Electron main process** (`Electron_Main/`) owns two integrations:
  - `Handlers/SpotifyHandlers.js` — runs the Spotify Authorization Code + PKCE flow in a popup `BrowserWindow`, exchanges the code for an access/refresh token pair, and persists them to `Electron_Main/userSpotifyToken.txt`.
  - `Handlers/OllamaHandlers.js` — sends the user's prompt to a local Ollama model (`llama3.1:8b`) along with the tool definitions, then loops: while the model responds with a tool call, it invokes the matching function, feeds the result back to the model, and repeats until the model returns plain text.
  - `MCP_Tool_Functions.js` — the actual tool implementations that call the Spotify Web API (`get_current_track`, `search_for_track`, `play_spotify_track`), plus token helpers.
  - `Preload.js` — exposes `spotifyIPC`, `ollamaIPC`, and `generalIPC` bridges to the renderer via `contextBridge`.
- **Renderer** (`renderer/`) is a Vite + TypeScript UI with "Connect to Ollama" / "Connect to Spotify" buttons and a prompt box that talks to the main process over IPC.

## Prerequisites

- [Node.js](https://nodejs.org/)
- [Ollama](https://ollama.com/download) installed and running locally, with the `llama3.1:8b` model pulled:
  ```
  ollama pull llama3.1:8b
  ```
- A Spotify account. Playback control (`play_spotify_track`) requires Spotify **Premium** and an active device.

## Setup

Install dependencies for both the Electron app and the renderer:

```bash
npm install
cd renderer && npm install && cd ..
```

## Running

The main process loads the renderer from `http://[::1]:5173/`, so start the Vite dev server first, then launch Electron in a second terminal:

```bash
# Terminal 1 - renderer
cd renderer
npm run dev

# Terminal 2 - Electron app
npm start
```

In the app window, click **Connect to Ollama** to verify Ollama is running with the required model, and **Connect to Spotify** to authorize your account. Once both show "Connected", enter a prompt and click **Send**.

## Notes

- `Electron_Main/userSpotifyToken.txt` stores your Spotify access/refresh tokens in plaintext and is currently tracked by git — add it to `.gitignore` before committing a populated token file.
- The Spotify OAuth redirect URI is hardcoded to `http://[::1]:8888/`.
