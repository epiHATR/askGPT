# askGPT extension for VSCode

![askGPT for VSCode](images/banner.png?raw=true "askGPT")
<a href="https://www.buymeacoffee.com/hidetran"><img src="https://img.buymeacoffee.com/button-api/?text=Buy me a coffee&emoji=&slug=hidetran&button_colour=FFDD00&font_colour=000000&font_family=Cookie&outline_colour=000000&coffee_colour=ffffff" /></a>

This extension use official OpenAI API and its documentation, go to https://cloudcli.io to get full documentations and instructions.
Make sure you have your OpenAI API key added at https://platform.openai.com/account/api-keys

## Usage
- Write a comment ask for something you need chatGPT build for (e.g //create Terraform template that create an Azure Virtual machine)
- Select that comment (highlight it in VSCode)
- Right click ⤍ AskGPT: Show me code
- Wait & enjoys 😎

## Hot Keys
To use keyboard, you must selected your text in the VSCode editor then press one of key combination bellow:
- ```Ctrl/Cmd + F2```...................Go to Settings
- ```Ctrl/Cmd + F3```...................English grammar check
- ```Ctrl/Cmd + F4```...................Explain code block
- ```Ctrl/Cmd + Enter```............Search for code by chatGPT
- ```Ctrl/Cmd + Shift + F```...Refactor code

## Installation
Open your VSCode ⤍ Extensions and search for ```AskGPT for VSCode``` then ```Install```.
![Installation](images/install.gif)

Press ```cmd + shift + p``` and type ```askGPT> Set API Key``` to open to setup OpenAI API key.
![Installation](images/addkey.gif)

Write your code request under a comment, then ```Right Click + Action```
![ask](images/ask_code.gif)

Wait until result appears
![ask](images/result.gif)

It took few seconds to get code suggested then your comment will be replaced by code.