import { App, PluginSettingTab, requestUrl, Setting, Notice} from "obsidian";
import GrimmorySync from "./main";

export interface GrimmorySyncSettings {
    baseUrl: string;
    accessToken: string;
    refreshToken: string;
    tokenExpiresAt: number;
}

export const DEFAULT_SETTINGS: GrimmorySyncSettings = {
    baseUrl: "",
    accessToken: "",
    refreshToken: "",
    tokenExpiresAt: 0,
};

export class GrimmorySettingTab extends PluginSettingTab {
    plugin: GrimmorySync;

    constructor(app: App, plugin: GrimmorySync) {
        super(app, plugin);
        this.plugin = plugin;
    }

    display(): void {
        let username = "";
        let password = "";
        const { containerEl } = this;
        new Setting(containerEl)
            .setName("Base URL")
            .setDesc("URL from your Grimmory instance")
            .addText((text) =>
                text
                    .setPlaceholder("Your Grimmory instance")
                    .setValue(this.plugin.settings.baseUrl)
                    .onChange(async (value) => {
                        this.plugin.settings.baseUrl = value;
                        await this.plugin.saveSettings();
                    }),
            );
        new Setting(containerEl)
            .setName("Username")
            .setDesc("Your Grimmory's username")
            .addText((text) =>
                text
                    .setPlaceholder("Your username")
                    .onChange(async (value) => {
                        username = value;
                    }),
            );
        new Setting(containerEl)
            .setName("Password")
            .setDesc("Your Grimmory's password")
            .addText((text) => {
                text.inputEl.type = "password"
                text
                    .setPlaceholder("Your password")
                    .onChange(async (value) => {
                        password = value;
                    })
            });
        new Setting(containerEl)
            .addButton((button) => {
                button
                    .setButtonText("Login")
                    .onClick(async () => {
                        try {
                            const response = await requestUrl({
                                url: `${this.plugin.settings.baseUrl}/api/v1/auth/login`,
                                method: "POST",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify({ "username": username, "password": password }),
                            });
                            this.plugin.settings.accessToken = response.json.accessToken
                            this.plugin.settings.refreshToken = response.json.refreshToken
                            const seconds = response.json.expires
                            const miliseconds = seconds * 1000
                            const expires = Date.now() + miliseconds
                            this.plugin.settings.tokenExpiresAt = expires
                            await this.plugin.saveSettings()
                            new Notice("Login successful")
                        } catch (error) {
                            new Notice("Something had failed")
                        }
                    })
            })
    }
}
