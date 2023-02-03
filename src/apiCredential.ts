import { ExtensionContext, SecretStorage } from "vscode"

export default class Settings {
    private static _instance: Settings

    constructor(private secretStorage: SecretStorage) {}

    static init(context: ExtensionContext): void {
        Settings._instance = new Settings(context.secrets)
    }

    static get instance(): Settings {
        return Settings._instance
    }

    async storeApiKey(apiKey?: string): Promise<void> {
        if (apiKey) {
            this.secretStorage.store("apiKey", apiKey)
        }
    }

    async getApiKey(): Promise<string | undefined> {

        return await this.secretStorage.get("apiKey")
    }
}
