import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { isValidBaseUrl } from "../src/baseUrlCheck.ts";

interface ValidateUrlCase {
    description: string;
    value: string;
    expected: boolean;
}

const cases: ValidateUrlCase[] = [
    {
        description: "true when it is a valid URL",
        value: "http://example.com",
        expected: true,
    },
    {
        description: "true when it is a valid URL with HTTPS",
        value: "https://example.com",
        expected: true,
    },
    {
        description: "true when it is a valid URL on localhost",
        value: "http://localhost:6060",
        expected: true,
    },
    {
        description: "true when it is a valid URL with only one word",
        value: "http://grimmory:6060",
        expected: true,
    },
    {
        description: "true when it is a valid URL on local network over IPv4",
        value: "http://192.168.1.10:6080",
        expected: true,
    },
    {
        description: "true when it is a valid URL on local network over IPv6",
        value: "http://[::1]:6080",
        expected: true,
    },
    {
        description: "true when it is a valid URL with subpath",
        value: "http://example.com/grimmory",
        expected: true,
    },
    {
        description: "false when HTTP is missing",
        value: "example.com",
        expected: false,
    },
    {
        description: "false when protocol is not HTTP",
        value: "ftp://example/path",
        expected: false,
    },
    {
        description: "false when value is empty",
        value: "",
        expected: false,
    },
    {
        description: "false when value is not an URL",
        value: "esto no es una url",
        expected: false,
    },
    {
        description: "false when URL contains search parameters",
        value: "http://example.com/search?",
        expected: false,
    },
    {
        description: "false when URL contains search parameters with values",
        value: "http://example.com/search?a=1",
        expected: false,
    },
    {
        description: "false when URL contains hashes",
        value: "http://example.com/#",
        expected: false,
    },
];

describe("isValidBaseUrl", () => {
    for (const { description, value, expected } of cases) {
        it(`returns ${description}`, () => {
            const result = isValidBaseUrl(value);
            assert.strictEqual(result, expected);
        });
    }
});
