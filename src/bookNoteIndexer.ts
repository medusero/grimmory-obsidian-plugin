export type NoteWithBookId<T> = {
    item: T;
    bookId: unknown;
};

export type BookNoteIndex<T> = {
    byBookId: Map<number, T[]>;
    invalid: T[];
};

const onlyDigits = /^[0-9]+$/;

function toPositiveId(bookId: number): number | null {
    return Number.isSafeInteger(bookId) && bookId > 0 ? bookId : null;
}

function parseBookId(bookId: unknown): number | null {
    if (typeof bookId === "number") {
        return toPositiveId(bookId);
    }
    if (typeof bookId === "string") {
        const trimmed = bookId.trim();
        if (onlyDigits.test(trimmed)) {
            return toPositiveId(Number(trimmed));
        }
    }
    return null;
}

export function indexNotesByBookId<T>(
    notes: NoteWithBookId<T>[],
): BookNoteIndex<T> {
    const byBookId = new Map<number, T[]>();
    const invalid: T[] = [];
    for (const { item, bookId } of notes) {
        if (bookId === undefined || bookId === null) {
            continue;
        }
        const validId = parseBookId(bookId);
        if (validId !== null) {
            let list = byBookId.get(validId);
            if (!list) {
                list = [];
                byBookId.set(validId, list);
            }
            list.push(item);
        } else {
            invalid.push(item);
        }
    }
    return { byBookId, invalid };
}
