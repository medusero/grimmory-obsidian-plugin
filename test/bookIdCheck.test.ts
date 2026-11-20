import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { isValidBookId } from "../src/bookIdCheck.ts";

interface IdCase {
    description: string;
    id: number;
    expected: boolean;
}

const cases: IdCase[] = [
    {
        description: "true for the minimum valid id",
        id: 1,
        expected: true,
    },
    {
        description: "true for a normal value",
        id: 42,
        expected: true,
    },
    {
        description: "true for the maximum valid id",
        id: Number.MAX_SAFE_INTEGER,
        expected: true,
    },
    {
        description: "false for zero as id",
        id: 0,
        expected: false,
    },
    {
        description: "false for a negative id",
        id: -42,
        expected: false,
    },
    {
        description: "false for a decimal id",
        id: 4.2,
        expected: false,
    },
    {
        description: "false for an unsafe integer",
        id: Number.MAX_SAFE_INTEGER + 1,
        expected: false,
    },
    {
        description: "false for infinity",
        id: Infinity,
        expected: false,
    },
];

describe("isValidBookId", () => {
    for (const { description, id, expected } of cases) {
        it(`returns ${description}`, () => {
            const result = isValidBookId(id);
            assert.strictEqual(result, expected);
        });
    }
});
