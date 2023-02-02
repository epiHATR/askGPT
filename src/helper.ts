import * as vscode from 'vscode';

export const showMessageWithTimeout = (message: string, timeout = 3000): void => {
	void vscode.window.withProgress(
		{
			location: vscode.ProgressLocation.Notification,
			title: message,
			cancellable: false,
		},

		async (progress): Promise<void> => {
			await waitFor(timeout, () => { return false; });
			progress.report({ increment: 100 });
		},
	);
};

export const waitFor = async (timeout: number, condition: () => boolean): Promise<boolean> => {
	while (!condition() && timeout > 0) {
		timeout -= 100;
		await sleep(100);
	}

	return timeout > 0 ? true : false;
};

export const sleep = (ms: number): Promise<unknown> => {
	return new Promise((resolve) => {
		return setTimeout(resolve, ms);
	});
};