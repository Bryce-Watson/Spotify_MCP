const {ipcMain, BrowserWindow} = require('electron')
const fs = require("fs");
const {Ollama} = require("ollama");

const ollama = new Ollama
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
                type: "function",
                function: {
                    name: "get_current_track", // Functions with underscores are used for MCP tool calls
                    description: "Get the current track playing on Spotify, You get one specific track",
                },
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

            let response = await invokeOllama(userInput)

            console.log(response.message.tool_calls)
            if (response.message.tool_calls !== undefined) {
                for (let toolCall of response.message.tool_calls) {
                    if (MCP_Tool_Functions.myFunctions[toolCall.function.name]) {
                        await mainWindow.webContents.send("displayText", "Calling Function " + toolCall.function.name)
                        const toolResult = await MCP_Tool_Functions.myFunctions[toolCall.function.name](toolCall.function.arguments) // needs the arguments later
                        const toolCalledResponse = "Tool " + toolCall.function.name + " Has already been called, do not call it again"
                        const secondResponse = await invokeOllama(toolCalledResponse + " " + toolResult)

                        console.log(secondResponse)
                        await mainWindow.webContents.send("displayText", secondResponse.message.content)

                    }
                }
            } else {
                await mainWindow.webContents.send("displayText", response.message.content)
            }
        }
    })

    ipcMain.handle("checkOllamaSetup", async (event, userInput) => {
        // returns true or false if ollama and the AI model is setup correctly
        const ollamaRunning = await fetch("http://localhost:11434/")
        console.log("Ollama is running: " + ollamaRunning.ok)
        if (! ollamaRunning.ok) {
            await mainWindow.webContents.send("displayText", "Ollama is not installed on your computer, go to https://ollama.com/download and download for your OS.")
            return false
        } else {
            const ollamaModels = await ollama.list()
            const hasModel = ollamaModels.models.some(model => model.name === modelused)
            console.log("Ollama has model: " + hasModel)

            if (hasModel) {
                userHasOllama = true
                await mainWindow.webContents.send("displayText", "Ollama is setup correctly!\n\n Have Fun and Thanks for Using my App ;)")
                return true
            } else {
                await mainWindow.webContents.send("displayText", "Ollama is setup correctly, but it does not have the " + modelused + " model.\n" +
                    " Please download it from https://ollama.com/library/" + modelused + " or download it within the application")
                return false
            }
            
        }
    })
}




