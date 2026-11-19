import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { validateAuthResponse } from "../src/authResponseValidator.ts";
import type { AuthResponse } from "../src/types.ts";

interface ValidCase {
    description: string;
    value: unknown;
    expected: AuthResponse;
}

interface InvalidCase {
    description: string;
    value: unknown;
    message: RegExp;
}

const validCases: ValidCase[] = [
    {
        description: "a valid AuthResponse for a valid response",
        value: {
            accessToken: "abc",
            refreshToken: "xyz",
            expires: 1,
        },
        expected: {
            accessToken: "abc",
            refreshToken: "xyz",
            expires: 1,
        },
    },
    {
        description:
            "a valid AuthResponse for a valid response with unused fields",
        value: {
            accessToken: "abc",
            refreshToken: "xyz",
            expires: 1,
            color: "blue",
        },
        expected: {
            accessToken: "abc",
            refreshToken: "xyz",
            expires: 1,
        },
    },
];

const invalidCases: InvalidCase[] = [
    {
        description: "when the response is null",
        value: null,
        message: /not a valid object/,
    },
    {
        description: "when the response is not an object",
        value: "Esto no es un objeto",
        message: /API/,
    },
    {
        description: "when the response is an array",
        value: ["Esto", "es", "un", "array"],
        message: /API/,
    },
    {
        description: "when 'accessToken' is missing",
        value: {
            refreshToken: "xyz",
            expires: 1,
        },
        message: /accessToken/,
    },
    {
        description: "when 'accessToken' is empty",
        value: {
            accessToken: "",
            refreshToken: "xyz",
            expires: 1,
        },
        message: /accessToken/,
    },
    {
        description: "when 'accessToken' is only spaces",
        value: {
            accessToken: "   ",
            refreshToken: "xyz",
            expires: 1,
        },
        message: /accessToken/,
    },
    {
        description: "when 'accessToken' is not a string",
        value: {
            accessToken: 42,
            refreshToken: "xyz",
            expires: 1,
        },
        message: /accessToken/,
    },
    {
        description: "when 'refreshToken is missing",
        value: {
            accessToken: "abc",
            expires: 1,
        },
        message: /refreshToken/,
    },
    {
        description: "when 'refreshToken' is empty",
        value: {
            accessToken: "abc",
            refreshToken: "",
            expires: 1,
        },
        message: /refreshToken/,
    },
    {
        description: "when 'refreshToken' is only spaces",
        value: {
            accessToken: "abc",
            refreshToken: "   ",
            expires: 1,
        },
        message: /refreshToken/,
    },
    {
        description: "when 'refreshToken' is not a string",
        value: {
            accessToken: "abc",
            refreshToken: 42,
            expires: 1,
        },
        message: /refreshToken/,
    },
    {
        description: "when 'expires' is missing",
        value: {
            accessToken: "abc",
            refreshToken: "xyz",
        },
        message: /expires/,
    },
    {
        description: "when 'expires' is not a number",
        value: {
            accessToken: "abc",
            refreshToken: "xyz",
            expires: "1",
        },
        message: /expires/,
    },
    {
        description: "when 'expires' is not a positive number",
        value: {
            accessToken: "abc",
            refreshToken: "xyz",
            expires: -1,
        },
        message: /expires/,
    },
    {
        description: "when 'expires' is zero",
        value: {
            accessToken: "abc",
            refreshToken: "xyz",
            expires: 0,
        },
        message: /expires/,
    },
];

describe("validateAuthResponse", () => {
    describe("valid responses", () => {
        for (const { description, value, expected } of validCases) {
            it(`returns ${description}`, () => {
                const result = validateAuthResponse(value);
                assert.deepStrictEqual(result, expected);
            });
        }
    });

    describe("invalid responses", () => {
        for (const { description, value, message } of invalidCases) {
            it(`throws ${description}`, () => {
                assert.throws(() => validateAuthResponse(value), {
                    name: "ApiResponseError",
                    message,
                });
            });
        }
    });
});
