import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { validateBookNoteList } from "../src/bookNoteListValidator.ts";
import type { ParsedList } from "../src/listParser.ts";
import type { BookNote } from "../src/types.ts";

interface ArrayListCase {
    description: string;
    value: unknown;
    expected: ParsedList<BookNote>;
}

interface NonArrayListCase {
    description: string;
    value: unknown;
    message: RegExp;
}

const nonArrayCases: NonArrayListCase[] = [
    {
        description: "when value is null",
        value: null,
        message: /The book note list response is not an array/,
    },
];

const arrayCases: ArrayListCase[] = [
    {
        description: "valid list for one BookNote",
        value: [
            {
                cfi: "epubcfi(/6/22!/4/534,/1:0,/1:357)",
                noteContent: "El viajero cruzó el puente al amanecer.",
            },
        ],
        expected: {
            valid: [
                {
                    cfi: "epubcfi(/6/22!/4/534,/1:0,/1:357)",
                    noteContent: "El viajero cruzó el puente al amanecer.",
                },
            ],
            invalid: [],
        },
    },
    {
        description:
            "valid list for one BookNote, invalid list for an invalid BookNote",
        value: [
            {
                cfi: "epubcfi(/6/22!/4/534,/1:0,/1:357)",
                noteContent: "El viajero cruzó el puente al amanecer.",
            },
            { cfi: 42, text: "Nadie recordó quién había construido la torre." },
        ],
        expected: {
            valid: [
                {
                    cfi: "epubcfi(/6/22!/4/534,/1:0,/1:357)",
                    noteContent: "El viajero cruzó el puente al amanecer.",
                },
            ],
            invalid: [
                {
                    cfi: 42,
                    text: "Nadie recordó quién había construido la torre.",
                },
            ],
        },
    },
];

describe("validateBookNoteList", () => {
    describe("array responses", () => {
        for (const { description, value, expected } of arrayCases) {
            it(`returns ${description}`, () => {
                const result = validateBookNoteList(value);
                assert.deepStrictEqual(result, expected);
            });
        }
    });
    describe("non array responses", () => {
        for (const { description, value, message } of nonArrayCases) {
            it(`throws ${description}`, () => {
                assert.throws(() => validateBookNoteList(value), {
                    name: "ApiResponseError",
                    message,
                });
            });
        }
    });
});
