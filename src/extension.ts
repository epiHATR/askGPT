import * as vscode from 'vscode';
import { showMessageWithTimeout } from './helper';
import  OpenAI  from "openai";

import Settings from "./apiCredential";

export const requestOpenAI = async (editor: vscode.TextEditor, type: string, apiKey: string | undefined) => {
	const selection = editor?.selection;
	const selectedText = editor?.document.getText(selection);
	const config = vscode.workspace.getConfiguration('askgpt');

	if (apiKey === undefined || apiKey.length <= 10) {
		const action = await vscode.window.showInformationMessage("You need to set your personal OpenAI API key first!", "Set API Key", "Cancel");
		if (action === "Set API Key") {
			const apiKey: string = await vscode.window.showInputBox({
				password: true,
				title: "OpenAI API Key",
				placeHolder: "sk-*********************************************"
			}) ?? '';

			if (apiKey !== undefined && apiKey.length >= 40) {
				const settingInstance = Settings.instance;
				await settingInstance.storeApiKey(apiKey);
				vscode.window.showInformationMessage("Your OpenAI API key was securely saved!", "Close");
			}
		}
	}
	else {
		if (selection && selectedText) {
			const openai = new OpenAI({
				apiKey: apiKey,
			});

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
					case "refactor":
						prompt = "refactor/format my code block bellow \n" + selectedText;
						break;
					default:
						prompt = selectedText;
						break;
				}
				const response = await openai.completions.create({
					model: config.openai["defaultModel"],
					prompt: prompt + "{}",
					// eslint-disable-next-line @typescript-eslint/naming-convention
					top_p: 1,
					temperature: config.openai["temperature"], // 0.64,
					// eslint-disable-next-line @typescript-eslint/naming-convention
					max_tokens: config.openai["tokens"], //2048
					stop: ["{}"]
				});

				if (response.choices) {
					console.log(response);
					const text = response.choices[0].text;
					if (text) {
						switch (type) {
							case "askcode":
								editor?.edit(builder => builder.replace(selection, selectedText + text));
								break;
							case "explaincode":
								editor?.edit(builder => builder.replace(selection, text.slice(4) + "\n\n" + selectedText));
								break;
							case "refactor":
								editor?.edit(builder => builder.replace(selection, text.slice(4)));
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
					const action = await vscode.window.showInformationMessage("You need to set your personal OpenAI API key first!", "Set API Key", "Cancel");
					if (action === "Set API Key") {
						const apiKey: string = await vscode.window.showInputBox({
							password: true,
							title: "OpenAI API Key",
							placeHolder: "sk-*********************************************"
						}) ?? '';

						if (apiKey !== undefined && apiKey.length >= 40) {
							const settingInstance = Settings.instance;
							await settingInstance.storeApiKey(apiKey);
							vscode.window.showInformationMessage("Your OpenAI API key was securely saved!", "Close");
						}
					}
				}
				else {
					vscode.window.showErrorMessage(e.toString());
				}
			}
		}
		else {
			showMessageWithTimeout("You must select a text to start asking ChatGPT", 5000);
		}
	}
};

export function activate(context: vscode.ExtensionContext) {
	Settings.init(context);
	const settingInstance = Settings.instance;

	context.subscriptions.push(vscode.commands.registerCommand('askgpt.settings', () => {
		vscode.commands.executeCommand('workbench.action.openSettings', "askgpt");
	}));

	context.subscriptions.push(vscode.commands.registerCommand('askgpt.askgptforcompletion', async () => {
		const editor = vscode.window.activeTextEditor;
		const apiKey = await settingInstance.getApiKey();
		if (editor) {
			vscode.window.withProgress({
				location: vscode.ProgressLocation.Notification,
				title: "askGPT - Creating your code",
				cancellable: true,
			}, async (progress): Promise<void> => {
				await requestOpenAI(editor, "askcode", apiKey);
				progress.report({ increment: 100 });
			});
		}
	}));

	context.subscriptions.push(vscode.commands.registerCommand('askgpt.askgptexplaincode', async () => {
		const editor = vscode.window.activeTextEditor;
		const apiKey = await settingInstance.getApiKey();
		if (editor) {
			vscode.window.withProgress({
				location: vscode.ProgressLocation.Notification,
				title: "askGPT - Thinking about your code",
				cancellable: true,
			}, async (progress): Promise<void> => {
				await requestOpenAI(editor, "explaincode", apiKey);
				progress.report({ increment: 100 });
			});
		}
	}));

	context.subscriptions.push(vscode.commands.registerCommand('askgpt.askgptformatcode', async () => {
		const editor = vscode.window.activeTextEditor;
		const apiKey = await settingInstance.getApiKey();
		if (editor) {
			vscode.window.withProgress({
				location: vscode.ProgressLocation.Notification,
				title: "askGPT - Refactoring your code block",
				cancellable: true,
			}, async (progress): Promise<void> => {
				await requestOpenAI(editor, "refactor", apiKey);
				progress.report({ increment: 100 });
			});
		}
	}));

	context.subscriptions.push(vscode.commands.registerCommand('askgpt.askgptforgrammarcheck', async () => {
		const editor = vscode.window.activeTextEditor;
		const apiKey = await settingInstance.getApiKey();
		if (editor) {
			vscode.window.withProgress({
				location: vscode.ProgressLocation.Notification,
				title: "askGPT - Checking your grammar",
				cancellable: true,
			}, async (progress): Promise<void> => {
				await requestOpenAI(editor, "grammarcheck", apiKey);
				progress.report({ increment: 100 });
			});
		}
	}));

	context.subscriptions.push(vscode.commands.registerCommand('askgpt.setKey', async () => {
		const apiKey: string = await vscode.window.showInputBox({
			password: true,
			title: "OpenAI API Key",
			placeHolder: "sk-*********************************************"
		}) ?? '';

		if (apiKey !== undefined && apiKey.length >= 40) {
			await settingInstance.storeApiKey(apiKey);
			vscode.window.showInformationMessage("Your OpenAI API key was securely saved!", "Close");
		}
	}));

	context.subscriptions.push(vscode.commands.registerCommand('askgpt.removeKey', async () => {
		const answer = await vscode.window.showWarningMessage("Do you want to remove OpenAI API key", "Yes, remove", "No");
		if (answer === "Yes, remove") {
			await settingInstance.storeApiKey("sk-");
			vscode.window.showInformationMessage("Your OpenAI API key was removed", "Close");
		}
	}));
}
export function deactivate() { }