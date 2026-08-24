import { Plugin, Notice, RequestUrlResponse, requestUrl } from "obsidian";
import {
    GrimmorySyncSettings,
    GrimmorySettingTab,
    DEFAULT_SETTINGS,
} from "./settings";

export interface Annotation {
    id: number;
    userId: number;
    bookId: number;
    cfi: string;
    text: string;
    color: string;
    note: string;
    chapterTitle: string;
    createdAt: string;
    updatedAt: string;
}

export interface BookNote {
    id: number;
    userId: number;
    bookId: number;
    cfi: string;
    selectedText: string;
    noteContent: string;
    color: string;
    chapterTitle: string;
    createdAt: string;
    updatedAt: string;
}

export interface BookEntry {
    cfi: string;
    highlightText?: string;
    noteText?: string;
    color?: string;
    chapterTitle?: string;
    createdAt?: string;
}

export default class GrimmorySync extends Plugin {
    settings!: GrimmorySyncSettings;
    async onload(): Promise<void> {
        await this.loadSettings();
        this.addSettingTab(new GrimmorySettingTab(this.app, this));
        new Notice("Plugin cargado");
    }
    async loadSettings() {
        this.settings = Object.assign(
            {},
            DEFAULT_SETTINGS,
            await this.loadData(),
        );
    }

    async saveSettings() {
        await this.saveData(this.settings);
    }

    async authorizedRequest(
        path: string,
        options?: {
            method?: string;
            body?: string;
        },
    ): Promise<RequestUrlResponse> {
        if (Date.now() > this.settings.tokenExpiresAt) {
            try {
                const response = await requestUrl({
                    url: `${this.settings.baseUrl}/api/v1/auth/refresh`,
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        refreshToken: this.settings.refreshToken,
                    }),
                });
                this.settings.accessToken = response.json.accessToken;
                this.settings.refreshToken = response.json.refreshToken;
                const seconds = response.json.expires;
                const miliseconds = seconds * 1000;
                const expires = Date.now() + miliseconds;
                this.settings.tokenExpiresAt = expires;
                await this.saveSettings();
            } catch (error) {
                new Notice("You need to login again");
                throw error;
            }
        }
        const response = await requestUrl({
            url: this.settings.baseUrl + path,
            method: options?.method ?? "GET",
            headers: {
                Authorization: `Bearer ${this.settings.accessToken}`,
            },
            body: options?.body,
        });
        return response;
    }

    async getBookEntries(bookId: number): Promise<BookEntry[]> {
        const promiseA = this.authorizedRequest(
            `/api/v1/annotations/book/${bookId}`,
        );
        const promiseB = this.authorizedRequest(
            `/api/v2/book-notes/book/${bookId}`,
        );
        const [requestAnnotations, requestBookNotes] = await Promise.all([
            promiseA,
            promiseB,
        ]);
        const fromHighlights: BookEntry[] = requestAnnotations.json.map(
            (itemAnnotation: Annotation) => {
                const itemNote = requestBookNotes.json.find(
                    (itemBookNotes: BookNote) =>
                        itemBookNotes.cfi == itemAnnotation.cfi,
                );
                return {
                    cfi: itemAnnotation.cfi,
                    highlightText: itemAnnotation.text,
                    noteText: itemNote?.noteContent,
                    color: itemAnnotation.color,
                    chapterTitle: itemAnnotation.chapterTitle,
                    createdAt: itemAnnotation.createdAt,
                };
            },
        );
        const fromOrphanNotes: BookEntry[] = requestBookNotes.json.filter(
            (itemBookNotes: BookNote) => {
                return !requestAnnotations.json.some(
                    (itemAnnotation: Annotation) =>
                        itemBookNotes.cfi === itemAnnotation.cfi,
                );
            },
        ).map((itemBookNotes: BookNote) => {
            return {
                cfi: itemBookNotes.cfi,
                noteText: itemBookNotes.noteContent,
                color: itemBookNotes.color,
                chapterTitle: itemBookNotes.chapterTitle,
                createdAt: itemBookNotes.createdAt,
            };
        });
        return [...fromHighlights, ...fromOrphanNotes];
    }
}
