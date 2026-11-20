import { isValidBookId } from "./bookIdCheck.ts";
import { isRecord } from "./recordGuard.ts";
import type { Book } from "./types.ts";

export function isBook(value: unknown): value is Book {
    return (
        isRecord(value) &&
        typeof value.bookId === "number" &&
        isValidBookId(value.bookId) &&
        typeof value.bookTitle === "string" &&
        value.bookTitle.trim().length > 0
    );
}
