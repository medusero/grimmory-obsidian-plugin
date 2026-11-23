import { isBook } from "./bookGuard.ts";
import { type ParsedList, parseList } from "./listParser.ts";
import type { Book } from "./types.ts";

function toBook(value: unknown): Book | null {
    if (isBook(value)) {
        return value;
    }
    return null;
}

export function validateBookList(value: unknown): ParsedList<Book> {
    return parseList(value, toBook, "book list");
}
