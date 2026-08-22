import {
    Plugin,
    Notice
} from 'obsidian';
 import {
     GrimmorySyncSettings,
     DEFAULT_SETTINGS
 } from './settings';

export default class GrimmorySync extends Plugin {
    settings!: GrimmorySyncSettings;
    async onload(): Promise<void> {
        await this.loadSettings();
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
}
