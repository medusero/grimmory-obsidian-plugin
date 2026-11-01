import {
    type App,
    normalizePath,
    Notice,
    PluginSettingTab,
    requestUrl,
    type Setting,
    type SettingDefinitionItem,
} from "obsidian";
import type GrimmorySync from "./main.ts";
import type { AuthResponse } from "./types.ts";

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

export function normalizeOutputFolder(path: string): string {
    const normalized = normalizePath(path);
    return normalized === "/" ? "" : normalized;
}

export class GrimmorySettingTab extends PluginSettingTab {
    plugin: GrimmorySync;

    constructor(app: App, plugin: GrimmorySync) {
        super(app, plugin);
        this.plugin = plugin;
    }

    async setControlValue(key: string, value: unknown): Promise<void> {
        if (key === "baseUrl" && typeof value === "string") {
            value = value.trim();
        }
        if (key === "headingLevel" && typeof value === "string") {
            value = Number(value);
        }
        if (key === "outputFolder" && typeof value === "string") {
            value = normalizeOutputFolder(value);
        }
        return super.setControlValue(key, value);
    }

    getControlValue(key: string): unknown {
        if (key === "headingLevel") {
            const value = String(this.plugin.settings.headingLevel);
            return value;
        }
        return super.getControlValue(key);
    }

    getSettingDefinitions(): SettingDefinitionItem[] {
        let localUsername = "";
        let localPassword = "";
        return [
            {
                name: "Base URL",
                desc: "URL from your Grimmory instance",
                control: {
                    type: "text",
                    key: "baseUrl",
                    placeholder: "Your Grimmory instance",
                    validate: (value: string) =>
                        /^(https?:\/\/)?((([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,})|(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}))(:\d{1,5})?(\/.*)?$/i.test(
                            value.trim(),
                        )
                            ? undefined
                            : "It has to be a valid URL",
                },
            },
            {
                name: "Note",
                desc: "Username and password are used once to obtain an access token and are not stored anywhere.",
            },
            {
                name: "Username",
                desc: "Your Grimmory's username",
                render: (setting: Setting) => {
                    setting.addText((text) => {
                        text.setPlaceholder("Your username")
                            .setValue(localUsername)
                            .onChange((value) => {
                                localUsername = value;
                            });
                    });
                },
            },
            {
                name: "Password",
                desc: "Your Grimmory's password",
                render: (setting: Setting) => {
                    setting.addText((text) => {
                        text.setPlaceholder("Your password")
                            .setValue(localPassword)
                            .onChange((value) => {
                                localPassword = value;
                            });
                        text.inputEl.type = "password";
                    });
                },
            },
            {
                name: "Login",
                desc: "Login into your Grimmory's instance",
                render: (setting: Setting) => {
                    setting.addButton((button) => {
                        button.setButtonText("Login").onClick(async () => {
                            try {
                                const response = await requestUrl({
                                    url: `${this.plugin.settings.baseUrl}/api/v1/auth/login`,
                                    method: "POST",
                                    headers: {
                                        "Content-Type": "application/json",
                                    },
                                    body: JSON.stringify({
                                        username: localUsername,
                                        password: localPassword,
                                    }),
                                });
                                const data = response.json as AuthResponse;
                                this.plugin.settings.accessToken =
                                    data.accessToken;
                                this.plugin.settings.refreshToken =
                                    data.refreshToken;
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
                },
            },
            {
                name: "Book's folder",
                desc: "Your book's folder",
                control: {
                    type: "folder",
                    key: "outputFolder",
                    includeRoot: true,
                    placeholder: "Your book's folder",
                },
            },
            {
                name: "Prefix",
                desc: "Add a prefix to your book's files",
                control: {
                    type: "text",
                    key: "notePrefix",
                },
            },
            {
                name: "Heading level",
                desc: "Heading level (H1-H6) for chapter titles",
                control: {
                    type: "dropdown",
                    key: "headingLevel",
                    defaultValue: "3",
                    options: {
                        1: "H1",
                        2: "H2",
                        3: "H3",
                        4: "H4",
                        5: "H5",
                        6: "H6",
                    },
                },
            },
            {
                name: "Label",
                desc: "Add a label to your book's notes",
                control: {
                    type: "text",
                    key: "noteLabel",
                },
            },
        ];
    }
}
