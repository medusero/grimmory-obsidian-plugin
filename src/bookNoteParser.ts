import { isRecord } from "./recordGuard.ts";
import type { BookNote } from "./types.ts";

export function toBookNote(value: unknown): BookNote | null {
    if (!isRecord(value)) {
        return null;
    }
    if (typeof value.cfi !== "string" || value.cfi.trim() === "") {
        return null;
    }
    if (typeof value.noteContent !== "string") {
        return null;
    }
    return {
        cfi: value.cfi,
        noteContent: value.noteContent,
        ...(typeof value.chapterTitle === "string"
            ? { chapterTitle: value.chapterTitle }
            : {}),
    };
}
