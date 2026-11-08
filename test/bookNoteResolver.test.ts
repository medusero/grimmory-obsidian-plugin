import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
    resolveBookNote,
    type BookNoteAction,
} from "../src/bookNoteResolver.ts";

interface ResolveCase {
    description: string;
    activeNotes: string[];
    inactiveNotes: string[];
    expected: BookNoteAction<string>;
}

const cases: ResolveCase[] = [
    {
        description: "creates when there are no notes",
        activeNotes: [],
        inactiveNotes: [],
        expected: { action: "create" },
    },
    {
        description:
            "skips without warning when there are no active notes and one inactive copy",
        activeNotes: [],
        inactiveNotes: ["Libros/Ficciones.md"],
        expected: { action: "skip", inactiveCopies: [] },
    },
    {
        description:
            "skips and reports the inactive copies when there are no active notes and multiple inactive copies",
        activeNotes: [],
        inactiveNotes: ["Libros/Ficciones.md", "Libros/Ficciones (copia).md"],
        expected: {
            action: "skip",
            inactiveCopies: [
                "Libros/Ficciones.md",
                "Libros/Ficciones (copia).md",
            ],
        },
    },
    {
        description:
            "updates the active note when there is one active note and no inactive copies",
        activeNotes: ["Libros/Ficciones.md"],
        inactiveNotes: [],
        expected: {
            action: "update",
            note: "Libros/Ficciones.md",
            inactiveCopies: [],
        },
    },
    {
        description:
            "updates the active note and reports the inactive copy when there is one active note and one inactive copy",
        activeNotes: ["Libros/Ficciones.md"],
        inactiveNotes: ["Libros/Ficciones (copia).md"],
        expected: {
            action: "update",
            note: "Libros/Ficciones.md",
            inactiveCopies: ["Libros/Ficciones (copia).md"],
        },
    },
    {
        description:
            "reports a conflict when there are multiple active notes and no inactive copies",
        activeNotes: ["Libros/Ficciones.md", "Libros/Ficciones (copia).md"],
        inactiveNotes: [],
        expected: {
            action: "duplicate",
            inactiveCopies: [],
            conflictingCopies: [
                "Libros/Ficciones.md",
                "Libros/Ficciones (copia).md",
            ],
        },
    },
    {
        description:
            "reports a conflict when there are multiple active notes and one inactive copy",
        activeNotes: ["Libros/Ficciones.md", "Libros/Ficciones (copia).md"],
        inactiveNotes: ["Libros/Ficciones (borrador).md"],
        expected: {
            action: "duplicate",
            inactiveCopies: ["Libros/Ficciones (borrador).md"],
            conflictingCopies: [
                "Libros/Ficciones.md",
                "Libros/Ficciones (copia).md",
            ],
        },
    },
];

describe("resolveBookNote", () => {
    for (const { description, activeNotes, inactiveNotes, expected } of cases) {
        it(description, () => {
            const result = resolveBookNote(activeNotes, inactiveNotes);
            assert.deepStrictEqual(result, expected);
        });
    }
});
