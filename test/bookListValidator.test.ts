import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
    type ValidatedBooks,
    validateBookList,
} from "../src/bookListValidator.ts";

interface ArrayListCase {
    description: string;
    value: unknown;
    expected: ValidatedBooks;
}

interface NonArrayListCase {
    description: string;
    value: unknown;
    message: RegExp;
}

const nonArrayCases: NonArrayListCase[] = [
    {
        description: "when value is a string",
        value: "Romeo y Julieta",
        message: /The book list response is not an array/,
    },
    {
        description: "when value is an object",
        value: { books: ["Romeo y Julieta"] },
        message: /The book list response is not an array/,
    },
    {
        description: "when value is null",
        value: null,
        message: /The book list response is not an array/,
    },
    {
        description: "when value is undefined",
        value: undefined,
        message: /The book list response is not an array/,
    },
];

const arrayCases: ArrayListCase[] = [
    {
        description: "two empty lists for an empty list",
        value: [],
        expected: {
            valid: [],
            invalid: [],
        },
    },
    {
        description: "valid list for one Book",
        value: [{ bookId: 42, bookTitle: "Romeo y Julieta" }],
        expected: {
            valid: [{ bookId: 42, bookTitle: "Romeo y Julieta" }],
            invalid: [],
        },
    },
    {
        description: "valid list for multiple Books",
        value: [
            { bookId: 42, bookTitle: "Romeo y Julieta" },
            { bookId: 4, bookTitle: "Ficciones" },
        ],
        expected: {
            valid: [
                { bookId: 42, bookTitle: "Romeo y Julieta" },
                { bookId: 4, bookTitle: "Ficciones" },
            ],
            invalid: [],
        },
    },
    {
        description: "valid list for one Book, invalid list for a string",
        value: [{ bookId: 42, bookTitle: "Romeo y Julieta" }, "Ficciones"],
        expected: {
            valid: [{ bookId: 42, bookTitle: "Romeo y Julieta" }],
            invalid: ["Ficciones"],
        },
    },
    {
        description:
            "valid list in correct order for multiple Books, invalid list for a string",
        value: [
            { bookId: 42, bookTitle: "Romeo y Julieta" },
            "Ficciones",
            { bookId: 55, bookTitle: "Hamlet" },
        ],
        expected: {
            valid: [
                { bookId: 42, bookTitle: "Romeo y Julieta" },
                { bookId: 55, bookTitle: "Hamlet" },
            ],
            invalid: ["Ficciones"],
        },
    },
    {
        description:
            "valid list for one Book, invalid list for an invalid Book",
        value: [
            { bookId: 42, bookTitle: "Romeo y Julieta" },
            { id: 4, title: "Ficciones" },
        ],
        expected: {
            valid: [{ bookId: 42, bookTitle: "Romeo y Julieta" }],
            invalid: [{ id: 4, title: "Ficciones" }],
        },
    },
    {
        description: "invalid list for multiple invalid Books",
        value: ["Romeo y Julieta", "Ficciones"],
        expected: {
            valid: [],
            invalid: ["Romeo y Julieta", "Ficciones"],
        },
    },
    {
        description: "invalid list for multiple invalid Books in mixed types",
        value: [
            "Romeo y Julieta",
            null,
            42,
            { bookId: "4", bookTitle: "Ficciones" },
        ],
        expected: {
            valid: [],
            invalid: [
                "Romeo y Julieta",
                null,
                42,
                { bookId: "4", bookTitle: "Ficciones" },
            ],
        },
    },
];

describe("validateBookList", () => {
    describe("array responses", () => {
        for (const { description, value, expected } of arrayCases) {
            it(`returns ${description}`, () => {
                const result = validateBookList(value);
                assert.deepStrictEqual(result, expected);
            });
        }
    });
    describe("non array responses", () => {
        for (const { description, value, message } of nonArrayCases) {
            it(`throws ${description}`, () => {
                assert.throws(() => validateBookList(value), {
                    name: "ApiResponseError",
                    message,
                });
            });
        }
    });
});
