import * as vscode from 'vscode';
import { showMessageWithTimeout } from './helper';
// eslint-disable-next-line @typescript-eslint/naming-convention
const { Configuration, OpenAIApi } = require("openai");

export const requestOpenAI = async (editor: vscode.TextEditor, type: string) => {
	const selection = editor?.selection;
	const selectedText = editor?.document.getText(selection);
	const config = vscode.workspace.getConfiguration('askgpt');

	if (config.openai["apikey"] === undefined || config.openai["apikey"].length <= 0) {
		const action = await vscode.window.showInformationMessage("You need to set your personal OpenAI API Key at Settings first!", "Go to Settings", "Cancel");
		if (action === "Go to Settings") {
			vscode.commands.executeCommand('workbench.action.openSettings', "askgpt");
		}
	}
	else {
		if (selection && selectedText) {
			const configuration = new Configuration({
				apiKey: config.openai["apikey"],
			});

			const openai = new OpenAIApi(configuration);

			vscode.window.withProgress({
				location: vscode.ProgressLocation.Window,
				cancellable: false,
				title: 'Asking chatGPT with your question'
			}, async (progress) => {
				try {
					progress.report({ increment: 0 });
					let prompt = "";
					switch (type) {
						case "askcode":
							prompt = selectedText;
							break;
						case "grammarcheck":
							prompt = "grammar check for " + selectedText;
							break;
						default:
							prompt = selectedText;
							break;
					}
					const response = await openai.createCompletion({
						model: config.openai["defaultModel"],
						prompt: prompt + "{}",
						// eslint-disable-next-line @typescript-eslint/naming-convention
						top_p: 1,
						temperature: config.openai["temperature"], // 0.64,
						// eslint-disable-next-line @typescript-eslint/naming-convention
						max_tokens: config.openai["tokens"], //2048
						stop: ["{}"]
					});

					if (response.data.choices) {
						console.log(response.data);
						const text = response.data.choices[0].text;
						if (text) {
							switch (type) {
								case "askcode":
									editor?.edit(builder => builder.replace(selection, selectedText + text));
									break;
								case "grammarcheck":
									editor?.edit(builder => builder.replace(selection, text));
									break;
								default:
									editor?.edit(builder => builder.replace(selection, text));
									break;
							}
						}
					}
					progress.report({ increment: 100 });
				}
				catch (e: any) {
					if (e.toString().indexOf("401") >= 0) {
						const action = await vscode.window.showInformationMessage("You need to set your personal OpenAI API Key at Settings first!", "Go to Settings", "Cancel");
						if (action === "Go to Settings") {
							vscode.commands.executeCommand('workbench.action.openSettings', "askgpt");
						}
					}
				}
			});
		}
		else {
			showMessageWithTimeout("You must select a text to start asking ChatGPT", 5000);
		}
	}
};

export function activate(context: vscode.ExtensionContext) {
	context.subscriptions.push(vscode.commands.registerCommand('askgpt.settings', () => {
		vscode.commands.executeCommand('workbench.action.openSettings', "askgpt");
	}));

	context.subscriptions.push(vscode.commands.registerCommand('askgpt.askgptforcompletion', async () => {
		const editor = vscode.window.activeTextEditor;
		if (editor) {
			requestOpenAI(editor, "askcode");
		}
	}));

	context.subscriptions.push(vscode.commands.registerCommand('askgpt.askgptforgrammarcheck', async () => {
		const editor = vscode.window.activeTextEditor;
		if (editor) {
			requestOpenAI(editor, "grammarcheck");
		}
	}));
}

export function deactivate() { }
