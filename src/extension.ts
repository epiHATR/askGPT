import * as vscode from 'vscode';
// eslint-disable-next-line @typescript-eslint/naming-convention
const { Configuration, OpenAIApi } = require("openai");

export function activate(context: vscode.ExtensionContext) {
	context.subscriptions.push(vscode.commands.registerCommand('askgpt.settings', () => {
		vscode.commands.executeCommand('workbench.action.openSettings', "askgpt");
	}));

	context.subscriptions.push(vscode.commands.registerCommand('askgpt.askgptforcompletion', async () => {
		const editor = vscode.window.activeTextEditor;
		const selection = editor?.selection;
		const selectedText = editor?.document.getText(selection);
		const config = vscode.workspace.getConfiguration('askgpt');

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

				progress.report({ increment: 0 });

				const response = await openai.createCompletion({
					model: config.openai["defaultModel"],
					prompt: selectedText,
					temperature: config.openai["temperature"], // 0.64,
					// eslint-disable-next-line @typescript-eslint/naming-convention
					max_tokens: config.openai["tokens"] //2048

				});

				if (response.data.choices) {
					const text = response.data.choices[0].text;
					if (text) {
						editor?.edit(builder => builder.replace(selection, selectedText + text));
					}
				} else {
				}
				progress.report({ increment: 100 });
			});

		}
		else {
			vscode.window.showErrorMessage("You must select a text to start asking ChatGPT");
		}

	}));
}

export function deactivate() { }
