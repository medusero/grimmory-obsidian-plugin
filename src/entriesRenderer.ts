import { compareCfi } from "./cfiComparator.ts";
import type { GrimmorySyncSettings } from "./settings.ts";
import type { BookEntry } from "./types.ts";

export type RenderSettings = Pick<
    GrimmorySyncSettings,
    "noteLabel" | "headingLevel"
>;

function escapeHtmlComments(text: string): string {
    const result = text.replace(/<!--/g, "&lt;!--");
    return result;
}

function formatQuote(text: string): string {
    const lines = text.split(/\r?\n/);
    const result = lines.map((line) => line.replace(/^( {0,3})#/, "$1\\#"));
    return "> " + result.join("\n> ");
}

function hasContent(text: string | undefined): text is string {
    return typeof text === "string" && text.trim().length > 0;
}

function hasAnyText(entry: BookEntry): boolean {
    const hasHighlight = hasContent(entry.highlightText);
    const hasNote = hasContent(entry.noteText);
    return hasHighlight || hasNote;
}

export function renderEntries(
    entries: BookEntry[],
    settings: RenderSettings,
): string {
    const filteredEntries = entries.filter(hasAnyText);
    const sorted = filteredEntries.sort((a, b) => compareCfi(a.cfi, b.cfi));
    const headingPrefix = "#".repeat(settings.headingLevel);
    const breakline = "***";
    let output = "";
    let first = true;
    let lastChapter: string | undefined = undefined;
    for (const entry of sorted) {
        if (!first) {
            output += `${breakline}\n\n`;
        }
        first = false;
        if (
            entry.chapterTitle !== lastChapter &&
            hasContent(entry.chapterTitle)
        ) {
            const chapter = escapeHtmlComments(entry.chapterTitle);
            lastChapter = entry.chapterTitle;
            output += `${headingPrefix} ${chapter}\n\n`;
        }
        if (hasContent(entry.highlightText)) {
            const quote = escapeHtmlComments(entry.highlightText);
            const formattedQuote = formatQuote(quote);
            output += `${formattedQuote}\n\n`;
        }
        if (hasContent(entry.noteText)) {
            const note = escapeHtmlComments(entry.noteText);
            output += `${settings.noteLabel}${note}\n\n`;
        }
    }
    return output;
}
