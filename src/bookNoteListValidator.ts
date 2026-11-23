import { toBookNote } from "./bookNoteParser.ts";
import { type ParsedList, parseList } from "./listParser.ts";
import type { BookNote } from "./types.ts";

export function validateBookNoteList(value: unknown): ParsedList<BookNote> {
    return parseList(value, toBookNote, "book note list");
}
