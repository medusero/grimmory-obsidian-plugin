export type BookNoteAction<T> =
    | { action: "create" }
    | { action: "update"; note: T; inactiveCopies: T[] }
    | { action: "skip"; inactiveCopies: T[] }
    | { action: "duplicate"; inactiveCopies: T[]; conflictingCopies: T[] };

export function resolveBookNote<T>(
    activeNotes: T[],
    inactiveNotes: T[],
): BookNoteAction<T> {
    if (activeNotes.length > 1) {
        return {
            action: "duplicate",
            inactiveCopies: inactiveNotes,
            conflictingCopies: activeNotes,
        };
    }
    if (activeNotes.length === 1) {
        return {
            action: "update",
            note: activeNotes[0],
            inactiveCopies: inactiveNotes,
        };
    }
    if (inactiveNotes.length === 0) {
        return { action: "create" };
    }
    return {
        action: "skip",
        inactiveCopies: inactiveNotes.length > 1 ? inactiveNotes : [],
    };
}
