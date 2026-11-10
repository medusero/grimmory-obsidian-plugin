import {
    Notice,
    Plugin,
    requestUrl,
    type RequestUrlResponse,
    type TFile,
} from "obsidian";
import { AuthError } from "./authError.ts";
import { replaceManagedZone } from "./managedZoneReplacer.ts";
import {
    DEFAULT_SETTINGS,
    GrimmorySettingTab,
    normalizeOutputFolder,
    type GrimmorySyncSettings,
} from "./settings.ts";
import type {
    Annotation,
    AuthResponse,
    Book,
    BookEntry,
    BookNote,
} from "./types.ts";

import {
    indexNotesByBookId,
    type BookNoteIndex,
    type NoteWithBookId,
} from "./bookNoteIndexer.ts";
import { resolveBookNote } from "./bookNoteResolver.ts";
import { renderEntries } from "./entriesRenderer.ts";
import { MarkerError } from "./markerError.ts";
import { separatorEnd, separatorStart } from "./markers.ts";
import { buildNotePath } from "./notePathBuilder.ts";
import { TitleError } from "./titleError.ts";

type SyncResult =
    | { kind: "created" }
    | { kind: "updated"; inactiveCopies: string[] }
    | { kind: "skipped"; inactiveCopies: string[] }
    | {
          kind: "blocked";
          inactiveCopies: string[];
          conflictingCopies: string[];
      };

type SyncResultKind = SyncResult["kind"];
type BookNotePaths = { bookId: number; bookTitle: string; paths: string[] };

function getFilePaths(notes: TFile[]): string[] {
    return notes.map((note) => note.path);
}

function formatPaths(paths: string[]): string {
    return paths.map((path) => JSON.stringify(path)).join(", ");
}

export default class GrimmorySync extends Plugin {
    settings!: GrimmorySyncSettings;
    private pendingRefresh: Promise<void> | null = null;
    async onload(): Promise<void> {
        await this.loadSettings();
        this.addSettingTab(new GrimmorySettingTab(this.app, this));
        this.addCommand({
            id: "sync-grimmory",
            name: "Sync notes",
            callback: async () => {
                await this.runSync();
            },
        });
        this.addRibbonIcon("book-open-check", "Sync Grimmory", async () => {
            await this.runSync();
        });
    }
    async loadSettings() {
        this.settings = Object.assign(
            {},
            DEFAULT_SETTINGS,
            (await this.loadData()) as Partial<GrimmorySyncSettings>,
        );
        this.settings.outputFolder = normalizeOutputFolder(
            this.settings.outputFolder,
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
            if (!this.pendingRefresh) {
                this.pendingRefresh = this.refreshSession().finally(() => {
                    this.pendingRefresh = null;
                });
            }
            await this.pendingRefresh;
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

    async refreshSession(): Promise<void> {
        let data: AuthResponse;
        try {
            const response = await requestUrl({
                url: `${this.settings.baseUrl}/api/v1/auth/refresh`,
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    refreshToken: this.settings.refreshToken,
                }),
            });
            data = response.json as AuthResponse;
        } catch (error) {
            const errorMessage =
                error instanceof Error ? error.message : String(error);
            throw new AuthError(errorMessage);
        }
        this.settings.accessToken = data.accessToken;
        this.settings.refreshToken = data.refreshToken;
        const seconds = data.expires;
        const milliseconds = seconds * 1000;
        const expires = Date.now() + milliseconds;
        this.settings.tokenExpiresAt = expires;
        await this.saveSettings();
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
        const notePath = buildNotePath(book.bookTitle, this.settings);
        if (
            this.settings.outputFolder &&
            !this.app.vault.getAbstractFileByPath(this.settings.outputFolder)
        ) {
            await this.app.vault.createFolder(this.settings.outputFolder);
        }
        await this.app.vault.create(
            notePath,
            this.buildInitialContent(book.bookId, entries),
        );
    }

    async updateNote(file: TFile, entries: BookEntry[]): Promise<void> {
        const renderedEntries = renderEntries(entries, this.settings);
        await this.app.vault.process(file, (fileContent) =>
            replaceManagedZone(fileContent, renderedEntries),
        );
    }

    async runSync(): Promise<void> {
        try {
            await this.syncAllBooks();
        } catch (error) {
            console.error(error);
            if (error instanceof AuthError) {
                new Notice(
                    "Could not refresh your session. Check your connection or log in again.",
                );
            } else {
                new Notice("Sync failed");
            }
        }
    }

    async syncBook(book: Book, notes: TFile[]): Promise<SyncResult> {
        const activeNotes = notes.filter((note) => this.isNoteActive(note));
        const inactiveNotes = notes.filter((note) => !this.isNoteActive(note));
        const action = resolveBookNote(activeNotes, inactiveNotes);
        switch (action.action) {
            case "create": {
                const entries = await this.getBookEntries(book.bookId);
                await this.createNote(book, entries);
                return { kind: "created" };
            }
            case "update": {
                const entries = await this.getBookEntries(book.bookId);
                await this.updateNote(action.note, entries);
                return {
                    kind: "updated",
                    inactiveCopies: getFilePaths(action.inactiveCopies),
                };
            }
            case "skip": {
                return {
                    kind: "skipped",
                    inactiveCopies: getFilePaths(action.inactiveCopies),
                };
            }
            case "duplicate": {
                return {
                    kind: "blocked",
                    inactiveCopies: getFilePaths(action.inactiveCopies),
                    conflictingCopies: getFilePaths(action.conflictingCopies),
                };
            }
        }
    }

    buildNoteIndex(): BookNoteIndex<TFile> {
        const notes: NoteWithBookId<TFile>[] = this.app.vault
            .getMarkdownFiles()
            .map((file) => {
                const bookId: unknown =
                    this.app.metadataCache.getFileCache(file)?.frontmatter?.[
                        "gs-book-id"
                    ];
                return {
                    item: file,
                    bookId,
                };
            });
        return indexNotesByBookId(notes);
    }

    async syncAllBooks(): Promise<void> {
        const books = await this.getBooks();
        const counts: Record<Exclude<SyncResultKind, "blocked">, number> = {
            created: 0,
            updated: 0,
            skipped: 0,
        };
        const markerErrors: string[] = [];
        const otherErrors: string[] = [];
        const titleErrors: number[] = [];
        const index = this.buildNoteIndex();
        const blockedBooks: BookNotePaths[] = [];
        const inactiveCopies: BookNotePaths[] = [];
        for (const book of books) {
            const notes = index.byBookId.get(book.bookId) ?? [];
            try {
                const result = await this.syncBook(book, notes);
                switch (result.kind) {
                    case "created":
                    case "updated":
                    case "skipped": {
                        counts[result.kind] += 1;
                        break;
                    }
                    case "blocked": {
                        blockedBooks.push({
                            bookId: book.bookId,
                            bookTitle: book.bookTitle,
                            paths: result.conflictingCopies,
                        });
                        break;
                    }
                }
                if (
                    "inactiveCopies" in result &&
                    result.inactiveCopies.length > 0
                ) {
                    inactiveCopies.push({
                        bookId: book.bookId,
                        bookTitle: book.bookTitle,
                        paths: result.inactiveCopies,
                    });
                }
            } catch (error) {
                if (error instanceof AuthError) {
                    throw error;
                } else if (error instanceof MarkerError) {
                    markerErrors.push(book.bookTitle);
                } else if (error instanceof TitleError) {
                    titleErrors.push(book.bookId);
                } else {
                    otherErrors.push(book.bookTitle);
                }
                console.error(error);
            }
        }
        for (const entry of inactiveCopies) {
            console.warn(
                `These inactive notes share the gs-book-id ${entry.bookId} (${JSON.stringify(entry.bookTitle)}):\n${formatPaths(entry.paths)}.`,
            );
        }
        let message = "";
        if (counts.created > 0) {
            message += `${counts.created} notes created.\n`;
        }
        if (counts.updated > 0) {
            message += `${counts.updated} notes updated.\n`;
        }
        if (counts.skipped > 0) {
            message += `${counts.skipped} notes skipped.\n`;
        }
        if (markerErrors.length > 0) {
            message += `Check the gs markers in ${markerErrors.join(", ")}.\n`;
        }
        if (titleErrors.length > 0) {
            message += `Rename in Grimmory the books with ids ${titleErrors.join(", ")}: their titles can't be used as file names.\n`;
        }
        if (otherErrors.length > 0) {
            message += `${otherErrors.length} failed: ${otherErrors.join(", ")}.\n`;
        }
        if (index.invalid.length > 0) {
            const paths = getFilePaths(index.invalid);
            message += `These notes have been ignored because they have an invalid gs-book-id. It must be a positive whole number. Check the README for more information:\n${formatPaths(paths)}.\n`;
        }
        if (blockedBooks.length > 0) {
            message += `These notes failed to sync because they share the same gs-book-id. Keep only one active note:\n`;
            for (const entry of blockedBooks) {
                message += `gs-book-id ${entry.bookId} (${JSON.stringify(entry.bookTitle)}): ${formatPaths(entry.paths)}.\n`;
            }
        }
        if (message.length === 0) {
            message = "Nothing to sync.";
        }
        const hasErrors =
            otherErrors.length > 0 ||
            markerErrors.length > 0 ||
            titleErrors.length > 0 ||
            index.invalid.length > 0 ||
            blockedBooks.length > 0;
        new Notice(message, hasErrors ? 0 : undefined);
    }
}
