import { isRecord } from "./recordGuard.ts";
import type { Annotation } from "./types.ts";

export function toAnnotation(value: unknown): Annotation | null {
    if (!isRecord(value)) {
        return null;
    }
    if (typeof value.cfi !== "string" || value.cfi.trim() === "") {
        return null;
    }
    if (typeof value.text !== "string") {
        return null;
    }
    return {
        cfi: value.cfi,
        text: value.text,
        ...(typeof value.chapterTitle === "string"
            ? { chapterTitle: value.chapterTitle }
            : {}),
    };
}
