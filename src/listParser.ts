import { ApiResponseError } from "./apiResponseError.ts";

type Parser<T> = (value: unknown) => T | null;

export type ParsedList<T> = {
    valid: T[];
    invalid: unknown[];
};

export function parseList<T>(
    value: unknown,
    parseItem: Parser<T>,
    listName: string,
): ParsedList<T> {
    if (!Array.isArray(value)) {
        throw new ApiResponseError(`The ${listName} response is not an array.`);
    }
    const valid: T[] = [];
    const invalid: unknown[] = [];
    for (const item of value) {
        const parsed = parseItem(item);
        if (parsed !== null) {
            valid.push(parsed);
        } else {
            invalid.push(item);
        }
    }
    return { valid, invalid };
}
