import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { isRecord } from "../src/recordGuard.ts";

interface RecordGuardCase {
    description: string;
    value: unknown;
    expected: boolean;
}

const cases: RecordGuardCase[] = [
    {
        description: "true for an an object",
        value: { key: "key", value: "value" },
        expected: true,
    },
    {
        description: "true for an an empty object",
        value: {},
        expected: true,
    },
    {
        description: "false for null",
        value: null,
        expected: false,
    },
    {
        description: "false for an an array",
        value: ["Esto", "es", "false"],
        expected: false,
    },
    {
        description: "false for an an empty array",
        value: [],
        expected: false,
    },
    {
        description: "false for an a number",
        value: 42,
        expected: false,
    },
    {
        description: "false for an a string",
        value: "Esto es false",
        expected: false,
    },
    {
        description: "false for an a boolean",
        value: true,
        expected: false,
    },
    {
        description: "false for undefined",
        value: undefined,
        expected: false,
    },
];

describe("isRecord", () => {
    for (const { description, value, expected } of cases) {
        it(`returns ${description}`, () => {
            const result = isRecord(value);
            assert.strictEqual(result, expected);
        });
    }
});
