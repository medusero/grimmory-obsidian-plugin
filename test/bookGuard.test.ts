import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { isBook } from "../src/bookGuard.ts";

interface BookGuardCase {
    description: string;
    value: unknown;
    expected: boolean;
}

const cases: BookGuardCase[] = [
    {
        description: "true for a Book",
        value: { bookId: 42, bookTitle: "Romeo y Julieta" },
        expected: true,
    },
    {
        description: "true for a Book with extra fields",
        value: {
            bookId: 42,
            bookTitle: "Romeo y Julieta",
            author: "William Shakespeare",
        },
        expected: true,
    },
    {
        description: "false for a Book with a negative bookId",
        value: { bookId: -42, bookTitle: "Romeo y Julieta" },
        expected: false,
    },
    {
        description: "false for a Book with a decimal bookId",
        value: { bookId: 4.2, bookTitle: "Romeo y Julieta" },
        expected: false,
    },
    {
        description: "false for a Book with a zero as bookId",
        value: { bookId: 0, bookTitle: "Romeo y Julieta" },
        expected: false,
    },
    {
        description: "false for a Book with a string as bookId",
        value: { bookId: "42", bookTitle: "Romeo y Julieta" },
        expected: false,
    },
    {
        description: "false for a Book with missing bookId",
        value: { bookTitle: "Romeo y Julieta" },
        expected: false,
    },
    {
        description: "false for a Book with a missing bookTitle",
        value: { bookId: 42 },
        expected: false,
    },
    {
        description: "false for a Book with an empty bookTitle",
        value: { bookId: 42, bookTitle: "" },
        expected: false,
    },
    {
        description: "false for a Book with only spaces on bookTitle",
        value: { bookId: 42, bookTitle: "   " },
        expected: false,
    },
    {
        description: "false for a Book with a non-string bookTitle",
        value: { bookId: 42, bookTitle: ["Romeo y Julieta"] },
        expected: false,
    },
    {
        description: "false for an empty Book",
        value: {},
        expected: false,
    },
    {
        description: "false for null",
        value: null,
        expected: false,
    },
    {
        description: "false for an array",
        value: ["Esto", "es", "false"],
        expected: false,
    },
    {
        description: "false for an empty array",
        value: [],
        expected: false,
    },
    {
        description: "false for a number",
        value: 42,
        expected: false,
    },
    {
        description: "false for a string",
        value: "Esto es false",
        expected: false,
    },
    {
        description: "false for a boolean",
        value: true,
        expected: false,
    },
    {
        description: "false for undefined",
        value: undefined,
        expected: false,
    },
];

describe("isBook", () => {
    for (const { description, value, expected } of cases) {
        it(`returns ${description}`, () => {
            const result = isBook(value);
            assert.strictEqual(result, expected);
        });
    }
});
