import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
    indexNotesByBookId,
    type BookNoteIndex,
    type NoteWithBookId,
} from "../src/bookNoteIndexer.ts";

interface IndexCase {
    description: string;
    notes: NoteWithBookId<string>[];
    expected: BookNoteIndex<string>;
}

const cases: IndexCase[] = [
    {
        description: "empty list",
        notes: [],
        expected: {
            byBookId: new Map<number, string[]>(),
            invalid: [],
        },
    },
    {
        description: "only notes with ID",
        notes: [{ item: "Libros/Ficciones.md", bookId: 42 }],
        expected: {
            byBookId: new Map([[42, ["Libros/Ficciones.md"]]]),
            invalid: [],
        },
    },
    {
        description: "empty strings",
        notes: [
            { item: "Libros/Ficciones.md", bookId: "" },
            { item: "Libros/Cuentos.md", bookId: "  " },
        ],
        expected: {
            byBookId: new Map<number, string[]>(),
            invalid: ["Libros/Ficciones.md", "Libros/Cuentos.md"],
        },
    },
    {
        description: "valid numbers",
        notes: [
            { item: "Libros/Ficciones.md", bookId: 42 },
            { item: "Libros/Fábulas.md", bookId: 314 },
        ],
        expected: {
            byBookId: new Map([
                [42, ["Libros/Ficciones.md"]],
                [314, ["Libros/Fábulas.md"]],
            ]),
            invalid: [],
        },
    },
    {
        description: "too large numbers",
        notes: [
            { item: "Libros/Ficciones.md", bookId: 2 ** 60 },
            { item: "Libros/Fábulas.md", bookId: "999999999999999999999" },
        ],
        expected: {
            byBookId: new Map<number, string[]>(),
            invalid: ["Libros/Ficciones.md", "Libros/Fábulas.md"],
        },
    },
    {
        description: "two notes with same ID",
        notes: [
            { item: "Libros/Ficciones.md", bookId: 42 },
            { item: "Libros/Ficciones (copia).md", bookId: 42 },
        ],
        expected: {
            byBookId: new Map([
                [42, ["Libros/Ficciones.md", "Libros/Ficciones (copia).md"]],
            ]),
            invalid: [],
        },
    },
    {
        description: "two notes with same ID, despite their original type",
        notes: [
            { item: "Libros/Ficciones.md", bookId: 42 },
            { item: "Libros/Ficciones (copia).md", bookId: "42" },
        ],
        expected: {
            byBookId: new Map([
                [42, ["Libros/Ficciones.md", "Libros/Ficciones (copia).md"]],
            ]),
            invalid: [],
        },
    },
    {
        description: "valid key from a valid string",
        notes: [
            { item: "Libros/Ficciones.md", bookId: " 0042 " },
            { item: "Libros/Cuentos.md", bookId: "43" },
        ],
        expected: {
            byBookId: new Map([
                [42, ["Libros/Ficciones.md"]],
                [43, ["Libros/Cuentos.md"]],
            ]),
            invalid: [],
        },
    },
    {
        description: "invalid numbers",
        notes: [
            { item: "Libros/Ficciones.md", bookId: -42 },
            { item: "Libros/Fábulas.md", bookId: 0 },
            { item: "Libros/Cuentos.md", bookId: 4.2 },
        ],
        expected: {
            byBookId: new Map<number, string[]>(),
            invalid: [
                "Libros/Ficciones.md",
                "Libros/Fábulas.md",
                "Libros/Cuentos.md",
            ],
        },
    },
    {
        description: "invalid strings",
        notes: [
            { item: "Libros/Ficciones.md", bookId: "-42" },
            { item: "Libros/Fábulas.md", bookId: "0" },
            { item: "Libros/Cuentos.md", bookId: "4.2" },
            { item: "Libros/Novelas.md", bookId: "0x2A" },
            { item: "Libros/Ensayos.md", bookId: "4.2e1" },
            { item: "Libros/Artículos.md", bookId: "abc" },
        ],
        expected: {
            byBookId: new Map<number, string[]>(),
            invalid: [
                "Libros/Ficciones.md",
                "Libros/Fábulas.md",
                "Libros/Cuentos.md",
                "Libros/Novelas.md",
                "Libros/Ensayos.md",
                "Libros/Artículos.md",
            ],
        },
    },
    {
        description: "invalid types",
        notes: [
            { item: "Libros/Ficciones.md", bookId: true },
            { item: "Libros/Fábulas.md", bookId: { id: 42 } },
            { item: "Libros/Cuentos.md", bookId: [42, 314] },
        ],
        expected: {
            byBookId: new Map<number, string[]>(),
            invalid: [
                "Libros/Ficciones.md",
                "Libros/Fábulas.md",
                "Libros/Cuentos.md",
            ],
        },
    },
    {
        description: "nothing from undefined and null",
        notes: [
            { item: "Libros/Ficciones.md", bookId: undefined },
            { item: "Libros/Fábulas.md", bookId: null },
        ],
        expected: {
            byBookId: new Map<number, string[]>(),
            invalid: [],
        },
    },
];

describe("indexNotesByBookId", () => {
    for (const { description, notes, expected } of cases) {
        it(`returns ${description}`, () => {
            const result = indexNotesByBookId(notes);
            assert.deepStrictEqual(result, expected);
        });
    }
});
