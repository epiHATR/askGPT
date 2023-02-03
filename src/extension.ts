import * as vscode from 'vscode';
import { showMessageWithTimeout, sleep } from './helper';
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
			try {
				let prompt = "";
				switch (type) {
					case "askcode":
						prompt = selectedText;
						break;
					case "grammarcheck":
						prompt = "grammar check for " + selectedText;
						break;
					case "explaincode":
						prompt = "explain my code block bellow with comment each line \n" + selectedText;
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
							case "explaincode":
								editor?.edit(builder => builder.replace(selection,  text.slice(4) + "\n\n"+ selectedText));
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
			}
			catch (e: any) {
				if (e.toString().indexOf("401") >= 0) {
					const action = await vscode.window.showInformationMessage("You need to set your personal OpenAI API Key at Settings first!", "Go to Settings", "Cancel");
					if (action === "Go to Settings") {
						vscode.commands.executeCommand('workbench.action.openSettings', "askgpt");
					}
				}
			}
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
			vscode.window.withProgress({
				location: vscode.ProgressLocation.Notification,
				title: "askGPT - Creating your code",
				cancellable: true,
			}, async (progress): Promise<void> => {
				await requestOpenAI(editor, "askcode");
				progress.report({ increment: 100 });
			});
		}
	}));

	context.subscriptions.push(vscode.commands.registerCommand('askgpt.askgptexplaincode', async () => {
		const editor = vscode.window.activeTextEditor;
		if (editor) {
			vscode.window.withProgress({
				location: vscode.ProgressLocation.Notification,
				title: "askGPT - Thinking about your code",
				cancellable: true,
			}, async (progress): Promise<void> => {
				await requestOpenAI(editor, "explaincode");
				progress.report({ increment: 100 });
			});
		}
	}));

	context.subscriptions.push(vscode.commands.registerCommand('askgpt.askgptforgrammarcheck', async () => {
		const editor = vscode.window.activeTextEditor;
		if (editor) {
			vscode.window.withProgress({
				location: vscode.ProgressLocation.Notification,
				title: "askGPT - Checking your grammar",
				cancellable: true,
			}, async (progress): Promise<void> => {
				await requestOpenAI(editor, "grammarcheck");
				progress.report({ increment: 100 });
			});
		}
	}));
}

export function deactivate() { }
