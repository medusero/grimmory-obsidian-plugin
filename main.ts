import { Plugin, Notice, RequestUrlResponse, TFile, requestUrl } from "obsidian";
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

export interface Book {
    bookId: number;
    bookTitle: string;
}

const separatorStart = '<!-- grimmory-sync:start -->'
const separatorEnd = '<!-- grimmory-sync:end -->'


export default class GrimmorySync extends Plugin {
    settings!: GrimmorySyncSettings;
    async onload(): Promise<void> {
        await this.loadSettings();
        this.addSettingTab(new GrimmorySettingTab(this.app, this));
        this.addCommand({
            id: 'sync-grimmory',
            name: 'Sync Notes from Grimmory',
            callback: async () => {
                try {
                    await this.syncAllBooks()
                }
                catch {
                    new Notice("Sync failed")
                }
            }
        })
        this.addRibbonIcon("book-open-check", "Sync Grimmory", async () => {
            try {
                await this.syncAllBooks()
            }
            catch {
                new Notice("Sync failed")
            }
        })
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

    async getBooks(): Promise<Book[]> {
        const response = await this.authorizedRequest(`/api/v1/notebook/books`)
        return response.json;
    }

    findNoteFile(bookId: number): TFile | undefined {
        const checkNote = this.app.vault.getMarkdownFiles().find(
            (file) =>
                this.app.metadataCache.getFileCache(file)?.frontmatter?.['grimmory-book-id'] == bookId)
        return checkNote
    }

    isNoteActive(file: TFile): boolean {
        const checkProperty = this.app.metadataCache.getFileCache(file)?.frontmatter?.['grimmory-sync'] == 'active'
        return checkProperty;
    }

    sanitizeTitle(title: string): string {
        return title.replace(/[:/\\?"*<>|]/g, '');
    }

    cfiToNumbers(cfi: string): number[] {
        const cfiStrings = cfi.match(/\d+/g)
        const cfiNumbers = cfiStrings?.map(Number) ?? []
        return cfiNumbers
    }

    compareCfi(a: string, b: string): number {
        const cfiA = this.cfiToNumbers(a)
        const cfiB = this.cfiToNumbers(b)
        const length = Math.min(cfiA.length, cfiB.length)
        for (let i = 0; i < length; i++) {
            if (cfiA[i] !== cfiB[i])
                return cfiA[i] - cfiB[i]
        }
        return cfiA.length - cfiB.length
    }

    buildNotePath(bookTitle: string): string {
        const fileName = this.settings.notePrefix + this.sanitizeTitle(bookTitle) + '.md';
        return this.settings.outputFolder
            ? `${this.settings.outputFolder}/${fileName}`
            : fileName;
    }

    renderEntries(entries: BookEntry[]): string {
        const sorted = [...entries].sort((a, b) => this.compareCfi(a.cfi, b.cfi));
        const headingPrefix = '#'.repeat(this.settings.headingLevel);
        const breakline = '***';
        let output = '';
        let lastChapter: string | undefined = undefined;
        for (const entry of sorted) {
            if (entry.chapterTitle !== lastChapter) {
                lastChapter = entry.chapterTitle
                output += `${ headingPrefix } ${ lastChapter }\n\n`
            }
            if (entry.highlightText) {
                output += `> ${entry.highlightText}\n\n`
            }
            if (entry.noteText) {
                output += `${this.settings.noteLabel}${entry.noteText}\n\n`
            }
            output += `${breakline}\n\n`
        }
        return output
    }

    buildInitialContent(bookId: number, entries: BookEntry[]): string {
        const separator = '---'
        const propertySync = 'grimmory-sync: active'
        const propertyBookId = 'grimmory-book-id: '
        const grimmoryFrontmatter = `${separator}\n${propertySync}\n${propertyBookId}${bookId}\n${separator}\n`
        const grimmoryZoneStart = `\n${separatorStart}\n`
        const grimmoryZoneEnd = `\n${separatorEnd}`
        const bookNote = grimmoryFrontmatter + grimmoryZoneStart + this.renderEntries(entries) + grimmoryZoneEnd
        return bookNote
    }

    async createNote(book: Book, entries: BookEntry[]): Promise<void> {
        if (this.settings.outputFolder && !this.app.vault.getAbstractFileByPath(this.settings.outputFolder)) {
            await this.app.vault.createFolder(this.settings.outputFolder);
        }
        await this.app.vault.create(this.buildNotePath(book.bookTitle),
            this.buildInitialContent(book.bookId, entries),
        )
    };

    replaceManagedZone(content: string, entries: BookEntry[]): string {
        const [before, rest] = content.split(separatorStart)
        const [, after] = rest.split(separatorEnd)
        return before + `${separatorStart}\n` + this.renderEntries(entries) + `\n${separatorEnd}` + after
    }

    async updateNote(file: TFile, entries: BookEntry[]): Promise<void> {
        if (!this.isNoteActive(file)) {
            return
        }
        await this.app.vault.process(file, (data) =>
            this.replaceManagedZone(data, entries))
    }

    async syncBook(book: Book): Promise<void> {
        const entries = await this.getBookEntries(book.bookId)
        const file = this.findNoteFile(book.bookId)
        if (file) {
            await this.updateNote(file, entries)
        }
        else {
            await this.createNote(book, entries)
        }
    }

    async syncAllBooks(): Promise<void> {
        const books = await this.getBooks()
        let succeeded = 0
        const errors: string[] = []
        for (const book of books) {
            try {
                await this.syncBook(book)
                succeeded += 1
            } catch (error) {
                errors.push(`${book.bookTitle}`)
                console.error(error)
            }
        }
        let message = `${succeeded} notes synced.`
        if (errors.length > 0) {
            message += ` ${errors.length} failed: ${errors.join(", ")}`
        }
        new Notice(message)
    }
}
