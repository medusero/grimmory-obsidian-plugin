import { ApiResponseError } from "./apiResponseError.ts";
import { isBook } from "./bookGuard.ts";
import type { Book } from "./types.ts";

export type ValidatedBooks = {
    valid: Book[];
    invalid: unknown[];
};

export function validateBookList(value: unknown): ValidatedBooks {
    if (!Array.isArray(value)) {
        throw new ApiResponseError("The book list response is not an array.");
    }
    const valid: Book[] = [];
    const invalid: unknown[] = [];
    for (const item of value) {
        if (isBook(item)) {
            valid.push(item);
        } else {
            invalid.push(item);
        }
    }
    return { valid, invalid };
}
