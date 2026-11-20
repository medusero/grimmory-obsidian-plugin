export function isValidBookId(bookId: number): boolean {
    return Number.isSafeInteger(bookId) && bookId > 0;
}
