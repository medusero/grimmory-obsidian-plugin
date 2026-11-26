import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { normalizeBaseUrl } from "../src/baseUrlNormalizer.ts";

interface NormalizeBaseUrlCase {
    description: string;
    value: string;
    expected: string;
}

const cases: NormalizeBaseUrlCase[] = [
    {
        description: "empty url when it is empty",
        value: "",
        expected: "",
    },
    {
        description: "the same url when it is valid",
        value: "https://example.com",
        expected: "https://example.com",
    },
    {
        description: "normalized url when it is surrounded by space",
        value: "  https://example.com  ",
        expected: "https://example.com",
    },
    {
        description:
            "normalized url when it is surrounded by space and it ends in a slash",
        value: "  https://example.com/  ",
        expected: "https://example.com",
    },
    {
        description: "normalized url when it ends in a slash",
        value: "https://example.com/",
        expected: "https://example.com",
    },
    {
        description: "normalized url when it ends in two slashes",
        value: "https://example.com//",
        expected: "https://example.com",
    },
    {
        description:
            "normalized url when it includes a subpath and it ends in a slash",
        value: "https://example.com/grimmory/",
        expected: "https://example.com/grimmory",
    },
];

describe("normalizeUrl", () => {
    for (const { description, value, expected } of cases) {
        it(`returns ${description}`, () => {
            const result = normalizeBaseUrl(value);
            assert.strictEqual(result, expected);
        });
    }
});
