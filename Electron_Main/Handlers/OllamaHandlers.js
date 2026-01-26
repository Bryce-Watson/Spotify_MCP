const {ipcMain, BrowserWindow} = require('electron')
const fs = require("fs");
const {Ollama} = require("ollama");

const ollama = new Ollama
//llama3.1:8b
const modelused = "llama3.1:8b"

const MCP_Tool_Functions = require("../MCP_Tool_Functions")

let userHasOllama = false

// Ask Ollama Function, where the ai returns a response, or calls tools

const invokeOllama = async(userInput) => {
     return await ollama.chat({
        model: modelused,
        messages: [
            { role: "system", content: "You are “Spotify_MCP”, a knowledgeable music assistant. \n" +
                    "You help users discover and understand music using available tools.\n" +
                    "\n" +
                    "Rules:\n" +
                    "1. Only call **one tool per turn**. Wait for the tool’s output before continuing.\n" +
                    "2. Interpret the results from the tool carefully.\n" +
                    "3. Use the tool output to answer the user's question accurately.\n" +
                    "4. Summarize or present information in a clear, concise, and engaging way for the user.\n" +
                    "5. Never invent or hallucinate data—if information is missing, indicate that clearly.\n" +
                    "6. Always produce a user-facing response after receiving tool output.\n" +
                    "\n" +
                    "Your goal is to help users with Spotify-related requests by calling tools when needed and explaining the results in plain, helpful language."},
            { role: "user", content: userInput}
        ],
        tools: [
            {
                //creating a function for the mcp to call if needed
                type: "function",
                function: {
                    name: "get_current_track", // Functions with underscores are used for MCP tool calls
                    description: "Get the current track playing on Spotify, returns album_name, track_name, artists, track_href, album_href, album_id, track_id",
                }
            },
            {
                //creating a function for the mcp to call if needed
                type: "function",
                function: {
                    name: "search_for_item", // Functions with underscores are used for MCP tool calls
                    description: "Searches for the following: album, artist, playlist, or track.",
                    parameters: {
                        type: "object",
                        properties: {
                            track: {
                                type: "string",
                                description: "The track name to search for."
                            },
                            artist: {
                                type: "string",
                                description: "The artist name to search for."
                            },
                            typeOfContent: {
                                type: "array",
                                items: {
                                    type: "string",
                                    enum: ["album", "artist", "playlist", "track"]
                                },
                                description: "The type of content to search for. You can choose more than one."
                            }
                        },
                        required: ["typeOfContent"]
                    }
                }
            }
        ]

     });
}


exports.registerHandlers = (mainWindow) => {

    ipcMain.handle("askOllama", async (event, userInput) => {
        // takes the user input and asks ollama to generate a response
        if (! userHasOllama) {
            mainWindow.webContents.send("displayText", "You Have to Connect With Ollama before using the application.")
        } else {

            mainWindow.webContents.send("displayText", userInput)

            let response = await invokeOllama(userInput)

            while (response.message.tool_calls !== undefined) {
                const currentTool = response.message.tool_calls[0]
                console.log(currentTool)
                if (MCP_Tool_Functions.myFunctions[currentTool.function.name]) {
                    mainWindow.webContents.send("displayText", "Calling Function " + currentTool.function.name)
                    const toolResult = await MCP_Tool_Functions.myFunctions[currentTool.function.name](currentTool.function.arguments) // needs the arguments later
                    const toolCalledResponse = "Tool " + currentTool.function.name + " Has already been called, do not call it again"
                    response = await invokeOllama(toolCalledResponse + " " + toolResult)
                }
            }
            console.log(response)
            mainWindow.webContents.send("displayText", response.message.content)
        }
    })

    ipcMain.handle("checkOllamaSetup", async (event, userInput) => {
        // returns true or false if ollama and the AI model is setup correctly
        const ollamaRunning = await fetch("http://localhost:11434/").catch(() => {
            mainWindow.webContents.send("displayText", "Ollama is not running, please start it from the application.")
            mainWindow.webContents.send("ollamaAuthFailure")
        })
        console.log("Ollama is running: " + ollamaRunning.ok)
        if (! ollamaRunning.ok) {
            mainWindow.webContents.send("displayText", "Ollama is not installed on your computer, go to https://ollama.com/download and download for your OS.")
            mainWindow.webContents.send("ollamaAuthFailure")
        } else {
            const ollamaModels = await ollama.list()
            const hasModel = ollamaModels.models.some(model => model.name === modelused)
            console.log("Ollama has model: " + hasModel)

            if (hasModel) {
                userHasOllama = true
                mainWindow.webContents.send("displayText", "Ollama is setup correctly!\n\n Have Fun and Thanks for Using my App ;)")
                mainWindow.webContents.send("ollamaAuthSuccess")
            } else {
                mainWindow.webContents.send("displayText", "Ollama is setup correctly, but it does not have the " + modelused + " model.\n" +
                    " Please download it from https://ollama.com/library/" + modelused + " or download it within the application")
                mainWindow.webContents.send("ollamaAuthFailure")
            }
            
        }
    })
}




