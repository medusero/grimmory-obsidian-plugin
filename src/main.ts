import {
    Notice,
    Plugin,
    type RequestUrlResponse,
    type TFile,
    requestUrl,
} from "obsidian";
import { replaceManagedZone } from "./managedZoneReplacer.ts";
import {
    DEFAULT_SETTINGS,
    GrimmorySettingTab,
    type GrimmorySyncSettings,
} from "./settings.ts";
import type {
    Annotation,
    AuthResponse,
    Book,
    BookEntry,
    BookNote,
} from "./types.ts";

import { renderEntries } from "./entriesRenderer.ts";
import { MarkerError } from "./markerError.ts";
import { separatorEnd, separatorStart } from "./markers.ts";
import { buildNotePath } from "./notePathBuilder.ts";

export default class GrimmorySync extends Plugin {
    settings!: GrimmorySyncSettings;
    async onload(): Promise<void> {
        await this.loadSettings();
        this.addSettingTab(new GrimmorySettingTab(this.app, this));
        this.addCommand({
            id: "sync-grimmory",
            name: "Sync notes",
            callback: async () => {
                try {
                    await this.syncAllBooks();
                } catch {
                    new Notice("Sync failed");
                }
            },
        });
        this.addRibbonIcon("book-open-check", "Sync Grimmory", async () => {
            try {
                await this.syncAllBooks();
            } catch {
                new Notice("Sync failed");
            }
        });
    }
    async loadSettings() {
        this.settings = Object.assign(
            {},
            DEFAULT_SETTINGS,
            (await this.loadData()) as Partial<GrimmorySyncSettings>,
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
                const data = response.json as AuthResponse;
                this.settings.accessToken = data.accessToken;
                this.settings.refreshToken = data.refreshToken;
                const seconds = data.expires;
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
        const annotations = requestAnnotations.json as Annotation[];
        const bookNotes = requestBookNotes.json as BookNote[];
        const fromHighlights: BookEntry[] = annotations.map(
            (itemAnnotation: Annotation) => {
                const itemNote = bookNotes.find(
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
        const fromOrphanNotes: BookEntry[] = bookNotes
            .filter((itemBookNotes: BookNote) => {
                return !annotations.some(
                    (itemAnnotation: Annotation) =>
                        itemBookNotes.cfi === itemAnnotation.cfi,
                );
            })
            .map((itemBookNotes: BookNote) => {
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

    async getBooks(): Promise<Book[]> {
        const response = await this.authorizedRequest(`/api/v1/notebook/books`);
        return response.json as Book[];
    }

    findNoteFile(bookId: number): TFile | undefined {
        const checkNote = this.app.vault
            .getMarkdownFiles()
            .find(
                (file) =>
                    this.app.metadataCache.getFileCache(file)?.frontmatter?.[
                        "gs-book-id"
                    ] == bookId,
            );
        return checkNote;
    }

    isNoteActive(file: TFile): boolean {
        const checkProperty =
            this.app.metadataCache.getFileCache(file)?.frontmatter?.[
                "gs-state"
            ] == "active";
        return checkProperty;
    }

    buildInitialContent(bookId: number, entries: BookEntry[]): string {
        const separator = "---";
        const propertySync = "gs-state: active";
        const propertyBookId = "gs-book-id: ";
        const grimmoryFrontmatter = `${separator}\n${propertySync}\n${propertyBookId}${bookId}\n${separator}\n`;
        const grimmoryZoneStart = `\n${separatorStart}\n`;
        const grimmoryZoneEnd = `\n${separatorEnd}`;
        const bookNote =
            grimmoryFrontmatter +
            grimmoryZoneStart +
            renderEntries(entries, this.settings) +
            grimmoryZoneEnd;
        return bookNote;
    }

    async createNote(book: Book, entries: BookEntry[]): Promise<void> {
        if (
            this.settings.outputFolder &&
            !this.app.vault.getAbstractFileByPath(this.settings.outputFolder)
        ) {
            await this.app.vault.createFolder(this.settings.outputFolder);
        }
        await this.app.vault.create(
            buildNotePath(book.bookTitle, this.settings),
            this.buildInitialContent(book.bookId, entries),
        );
    }

    async updateNote(file: TFile, entries: BookEntry[]): Promise<void> {
        if (!this.isNoteActive(file)) {
            return;
        }
        const renderedEntries = renderEntries(entries, this.settings);
        await this.app.vault.process(file, (fileContent) =>
            replaceManagedZone(fileContent, renderedEntries),
        );
    }

    async syncBook(book: Book): Promise<void> {
        const entries = await this.getBookEntries(book.bookId);
        const file = this.findNoteFile(book.bookId);
        if (file) {
            await this.updateNote(file, entries);
        } else {
            await this.createNote(book, entries);
        }
    }

    async syncAllBooks(): Promise<void> {
        const books = await this.getBooks();
        let succeeded = 0;
        const markerErrors: string[] = [];
        const otherErrors: string[] = [];
        for (const book of books) {
            try {
                await this.syncBook(book);
                succeeded += 1;
            } catch (error) {
                console.error(error);
                if (error instanceof MarkerError) {
                    markerErrors.push(book.bookTitle);
                } else {
                    otherErrors.push(book.bookTitle);
                }
            }
        }
        let message = `${succeeded} notes synced.`;
        if (markerErrors.length > 0) {
            message += ` Check the gs markers in ${markerErrors.join(", ")}`;
        }
        if (otherErrors.length > 0) {
            message += ` ${otherErrors.length} failed: ${otherErrors.join(", ")}`;
        }
        const hasErrors = otherErrors.length > 0 || markerErrors.length > 0;
        new Notice(message, hasErrors ? 0 : undefined);
    }
}
