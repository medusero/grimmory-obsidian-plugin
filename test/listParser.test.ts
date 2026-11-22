import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { type ParsedList, parseList } from "../src/listParser.ts";

function parseNumber(value: unknown): number | null {
    return typeof value === "number" ? value : null;
}

interface ArrayListCase {
    description: string;
    value: unknown;
    expected: ParsedList<number>;
}

interface NonArrayListCase {
    description: string;
    value: unknown;
    listName: string;
    message: RegExp;
}

const arrayCases: ArrayListCase[] = [
    {
        description: "three numeric values in valid list",
        value: [0, 1, 2],
        expected: { valid: [0, 1, 2], invalid: [] },
    },
    {
        description:
            "three numeric values in valid list, one string value in invalid list",
        value: [0, 1, "a", 2],
        expected: { valid: [0, 1, 2], invalid: ["a"] },
    },
    {
        description: "the values in their original order",
        value: [2, "b", 0, 1, "a"],
        expected: { valid: [2, 0, 1], invalid: ["b", "a"] },
    },
    {
        description: "an empty valid and invalid lists",
        value: [],
        expected: { valid: [], invalid: [] },
    },
    {
        description: "an invalid list for only invalid values",
        value: [[1], "a", undefined],
        expected: { valid: [], invalid: [[1], "a", undefined] },
    },
];

const nonArrayCases: NonArrayListCase[] = [
    {
        description: "an ApiResponseError for a string value",
        value: "No soy un array",
        listName: "Lista A",
        message: /Lista A/,
    },
    {
        description: "an ApiResponseError for an object value",
        value: { items: [1, 2] },
        listName: "Lista A",
        message: /Lista A/,
    },
    {
        description: "an ApiResponseError for null as value",
        value: null,
        listName: "Lista A",
        message: /Lista A/,
    },
];

describe("parseList", () => {
    describe("array responses", () => {
        for (const { description, value, expected } of arrayCases) {
            it(`returns ${description}`, () => {
                const result = parseList(value, parseNumber, "Lista A");
                assert.deepStrictEqual(result, expected);
            });
        }
    });
    describe("non array responses", () => {
        for (const { description, value, listName, message } of nonArrayCases) {
            it(`throws ${description}`, () => {
                assert.throws(() => parseList(value, parseNumber, listName), {
                    name: "ApiResponseError",
                    message,
                });
            });
        }
    });
});
