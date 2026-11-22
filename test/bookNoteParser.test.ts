import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { toBookNote } from "../src/bookNoteParser.ts";
import type { BookNote } from "../src/types.ts";

interface BookNoteCase {
    description: string;
    value: unknown;
    expected: BookNote | null;
}

const cases: BookNoteCase[] = [
    {
        description: "a BookNote for a valid value",
        value: {
            cfi: "epubcfi(/6/22!/4/534,/1:0,/1:357)",
            noteContent: "El viento se levanta.",
            chapterTitle: "Capítulo 4",
        },
        expected: {
            cfi: "epubcfi(/6/22!/4/534,/1:0,/1:357)",
            noteContent: "El viento se levanta.",
            chapterTitle: "Capítulo 4",
        },
    },
    {
        description: "a BookNote for a valid value with empty noteContent",
        value: {
            cfi: "epubcfi(/6/22!/4/534,/1:0,/1:357)",
            noteContent: "",
            chapterTitle: "Capítulo 4",
        },
        expected: {
            cfi: "epubcfi(/6/22!/4/534,/1:0,/1:357)",
            noteContent: "",
            chapterTitle: "Capítulo 4",
        },
    },
    {
        description: "a BookNote for a valid value with null chapterTitle",
        value: {
            cfi: "epubcfi(/6/22!/4/534,/1:0,/1:357)",
            noteContent: "El viento se levanta.",
            chapterTitle: null,
        },
        expected: {
            cfi: "epubcfi(/6/22!/4/534,/1:0,/1:357)",
            noteContent: "El viento se levanta.",
        },
    },
    {
        description: "a BookNote for a valid value with invalid chapterTitle",
        value: {
            cfi: "epubcfi(/6/22!/4/534,/1:0,/1:357)",
            noteContent: "El viento se levanta.",
            chapterTitle: 42,
        },
        expected: {
            cfi: "epubcfi(/6/22!/4/534,/1:0,/1:357)",
            noteContent: "El viento se levanta.",
        },
    },
    {
        description: "a BookNote for a valid value with unexpected fields",
        value: {
            cfi: "epubcfi(/6/22!/4/534,/1:0,/1:357)",
            noteContent: "El viento se levanta.",
            chapterTitle: "Capítulo 4",
            color: "#FF555",
            id: 42,
        },
        expected: {
            cfi: "epubcfi(/6/22!/4/534,/1:0,/1:357)",
            noteContent: "El viento se levanta.",
            chapterTitle: "Capítulo 4",
        },
    },
    {
        description: "null for a non-string CFI",
        value: {
            cfi: 42,
            noteContent: "El viento se levanta.",
            chapterTitle: "Capítulo 4",
        },
        expected: null,
    },
    {
        description: "null for a missing CFI",
        value: {
            noteContent: "El viento se levanta.",
            chapterTitle: "Capítulo 4",
        },
        expected: null,
    },
    {
        description: "null for an empty CFI",
        value: {
            cfi: "",
            noteContent: "El viento se levanta.",
            chapterTitle: "Capítulo 4",
        },
        expected: null,
    },
    {
        description: "null for a CFI with only spaces",
        value: {
            cfi: "   ",
            noteContent: "El viento se levanta.",
            chapterTitle: "Capítulo 4",
        },
        expected: null,
    },
    {
        description: "null for a non-string noteContent",
        value: {
            cfi: "epubcfi(/6/22!/4/534,/1:0,/1:357)",
            noteContent: 42,
            chapterTitle: "Capítulo 4",
        },
        expected: null,
    },
    {
        description: "null for a missing noteContent",
        value: {
            cfi: "epubcfi(/6/22!/4/534,/1:0,/1:357)",
            chapterTitle: "Capítulo 4",
        },
        expected: null,
    },
    {
        description: "null for an array as value",
        value: ["Esto no es BookNote"],
        expected: null,
    },
    {
        description: "null for null as value",
        value: null,
        expected: null,
    },
];

describe("toBookNote", () => {
    for (const { description, value, expected } of cases) {
        it(`returns ${description}`, () => {
            const result = toBookNote(value);
            assert.deepStrictEqual(result, expected);
        });
    }
});
