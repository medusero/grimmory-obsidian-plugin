import {
    App,
    PluginSettingTab,
    requestUrl,
    Setting,
    Notice,
    AbstractInputSuggest,
    TFolder,
} from "obsidian";
import GrimmorySync, { AuthResponse } from "./main";

export interface GrimmorySyncSettings {
    baseUrl: string;
    accessToken: string;
    refreshToken: string;
    tokenExpiresAt: number;
    outputFolder: string;
    notePrefix: string;
    headingLevel: number;
    noteLabel: string;
}

export const DEFAULT_SETTINGS: GrimmorySyncSettings = {
    baseUrl: "",
    accessToken: "",
    refreshToken: "",
    tokenExpiresAt: 0,
    outputFolder: "",
    notePrefix: "",
    headingLevel: 3,
    noteLabel: "**Note:** ",
};

export class FolderSuggest extends AbstractInputSuggest<TFolder> {
    constructor(app: App, textInputEl: HTMLInputElement) {
        super(app, textInputEl);
    }

    protected getSuggestions(query: string): TFolder[] | Promise<TFolder[]> {
        const folders = this.app.vault.getAllFolders(true);
        return folders.filter((folder) => folder.path.includes(query));
    }
    renderSuggestion(value: TFolder, el: HTMLElement): void {
        el.setText(value.isRoot() ? "/ [Vault root]" : value.path);
    }
}

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
        containerEl.empty();
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
        new Setting(containerEl).setDesc(
            createFragment((frag) => {
                frag.createEl("strong", { text: "Note: " });
                frag.appendText(
                    "Username and password are used once to obtain an access token and are not stored anywhere.",
                );
            }),
        );
        new Setting(containerEl)
            .setName("Username")
            .setDesc("Your Grimmory's username")
            .addText((text) =>
                text.setPlaceholder("Your username").onChange(async (value) => {
                    username = value;
                }),
            );
        new Setting(containerEl)
            .setName("Password")
            .setDesc("Your Grimmory's password")
            .addText((text) => {
                text.inputEl.type = "password";
                text.setPlaceholder("Your password").onChange(async (value) => {
                    password = value;
                });
            });
        new Setting(containerEl).addButton((button) => {
            button.setButtonText("Login").onClick(async () => {
                try {
                    const response = await requestUrl({
                        url: `${this.plugin.settings.baseUrl}/api/v1/auth/login`,
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            username: username,
                            password: password,
                        }),
                    });
                    const data = response.json as AuthResponse;
                    this.plugin.settings.accessToken = data.accessToken;
                    this.plugin.settings.refreshToken = data.refreshToken;
                    const seconds = data.expires;
                    const miliseconds = seconds * 1000;
                    const expires = Date.now() + miliseconds;
                    this.plugin.settings.tokenExpiresAt = expires;
                    await this.plugin.saveSettings();
                    new Notice("Login successful");
                } catch {
                    new Notice("Login failed");
                }
            });
        });
        new Setting(containerEl)
            .setName("Folder")
            .setDesc("Your book's folder")
            .addText((text) => {
                text.setPlaceholder("Your book's folder")
                    .setValue(this.plugin.settings.outputFolder)
                    .onChange(async (value) => {
                        this.plugin.settings.outputFolder = value;
                        await this.plugin.saveSettings();
                    });
                new FolderSuggest(this.app, text.inputEl).onSelect(
                    async (folder) => {
                        text.setValue(folder.path);
                        this.plugin.settings.outputFolder = folder.path;
                        await this.plugin.saveSettings();
                    },
                );
                return text;
            });
        new Setting(containerEl)
            .setName("Prefix")
            .setDesc("Add a prefix to your book's files")
            .addText((text) =>
                text
                    .setPlaceholder("Prefix")
                    .setValue(this.plugin.settings.notePrefix)
                    .onChange(async (value) => {
                        this.plugin.settings.notePrefix = value;
                        await this.plugin.saveSettings();
                    }),
            );
        new Setting(containerEl)
            .setName("Heading level")
            .setDesc("Heading level (H1-H6) for chapter titles")
            .addDropdown((dropdown) => {
                dropdown
                    .addOption("1", "H1")
                    .addOption("2", "H2")
                    .addOption("3", "H3")
                    .addOption("4", "H4")
                    .addOption("5", "H5")
                    .addOption("6", "H6")
                    .setValue(String(this.plugin.settings.headingLevel))
                    .onChange(async (value) => {
                        this.plugin.settings.headingLevel = Number(value);
                        await this.plugin.saveSettings();
                    });
            });
        new Setting(containerEl)
            .setName("Label")
            .setDesc("Add a label to your book's notes")
            .addText((text) =>
                text
                    .setPlaceholder("Label")
                    .setValue(this.plugin.settings.noteLabel)
                    .onChange(async (value) => {
                        this.plugin.settings.noteLabel = value;
                        await this.plugin.saveSettings();
                    }),
            );
    }
}
