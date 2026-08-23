import {
    Plugin,
    Notice,
    RequestUrlResponse,
    requestUrl
} from 'obsidian';
 import {
     GrimmorySyncSettings,
     GrimmorySettingTab,
     DEFAULT_SETTINGS
 } from './settings';

export default class GrimmorySync extends Plugin {
    settings!: GrimmorySyncSettings;
    async onload(): Promise<void> {
        await this.loadSettings();
        this.addSettingTab(new GrimmorySettingTab(this.app, this))
        new Notice("Plugin cargado")
    }
    async loadSettings() {
        this.settings = Object.assign(
            {},
            DEFAULT_SETTINGS,
            await this.loadData()
        );
    }

    async saveSettings() {
        await this.saveData(this.settings);
    }

    async authorizedRequest(
        path: string, options?: {
            method?: string; body?: string
        }): Promise<RequestUrlResponse> {
        if (Date.now() > this.settings.tokenExpiresAt) {
            try {
                const response = await requestUrl({
                    url: `${this.settings.baseUrl}/api/v1/auth/refresh`,
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ "refreshToken": this.settings.refreshToken })
                    })
                this.settings.accessToken = response.json.accessToken
                this.settings.refreshToken = response.json.refreshToken
                const seconds = response.json.expires
                const miliseconds = seconds * 1000
                const expires = Date.now() + miliseconds
                this.settings.tokenExpiresAt = expires
                await this.saveSettings()
            } catch (error) {
                new Notice("You need to login again")
                throw error;
                }
            }
            const response = await requestUrl({
                url: this.settings.baseUrl + path,
                method: options?.method ?? 'GET',
                headers: {
                    "Authorization": `Bearer ${this.settings.accessToken}`
            },
                body: options?.body
            })
            return response;
        }

}
