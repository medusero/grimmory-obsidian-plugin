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

export function renderEntries(
    entries: BookEntry[],
    settings: RenderSettings,
): string {
    const sorted = [...entries].sort((a, b) => compareCfi(a.cfi, b.cfi));
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
            typeof entry.chapterTitle === "string" &&
            entry.chapterTitle.trim().length > 0
        ) {
            const chapter = escapeHtmlComments(entry.chapterTitle);
            lastChapter = entry.chapterTitle;
            output += `${headingPrefix} ${chapter}\n\n`;
        }
        if (entry.highlightText) {
            const quote = escapeHtmlComments(entry.highlightText);
            const formattedQuote = formatQuote(quote);
            output += `${formattedQuote}\n\n`;
        }
        if (entry.noteText) {
            const note = escapeHtmlComments(entry.noteText);
            output += `${settings.noteLabel}${note}\n\n`;
        }
    }
    return output;
}
