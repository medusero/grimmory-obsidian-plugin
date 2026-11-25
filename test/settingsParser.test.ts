import assert from "node:assert/strict";
import { describe, it } from "node:test";
import type { GrimmorySyncSettings } from "../src/settings.ts";
import { toSettings } from "../src/settingsParser.ts";

interface SettingsCase {
    description: string;
    value: unknown;
    expected: GrimmorySyncSettings;
}

const defaults: GrimmorySyncSettings = {
    baseUrl: "https://example.com",
    accessToken: "100",
    refreshToken: "101",
    tokenExpiresAt: 10,
    outputFolder: "Books",
    notePrefix: "Anotaciones sobre ",
    headingLevel: 3,
    noteLabel: "Notas: ",
};

const newValues = {
    baseUrl: "https://example.net",
    accessToken: "200",
    refreshToken: "201",
    tokenExpiresAt: 20,
    outputFolder: "Libros",
    notePrefix: "Anotaciones: ",
    headingLevel: 6,
    noteLabel: "Notas sobre: ",
};

function without<K extends keyof typeof newValues>(
    key: K,
    value: typeof newValues,
): Omit<typeof newValues, K> {
    const { [key]: _omit, ...rest } = value;
    return rest;
}

const cases: SettingsCase[] = [
    {
        description: "valid settings when all is valid",
        value: newValues,
        expected: newValues,
    },
    {
        description: "the default settings for null",
        value: null,
        expected: defaults,
    },
    {
        description: "the default settings for an array",
        value: [newValues],
        expected: defaults,
    },
    {
        description: "default baseUrl when it is missing",
        value: without("baseUrl", newValues),
        expected: { ...newValues, baseUrl: defaults.baseUrl },
    },
    {
        description: "default baseUrl when it is invalid",
        value: { ...newValues, baseUrl: 42 },
        expected: { ...newValues, baseUrl: defaults.baseUrl },
    },
    {
        description: "default accessToken when it is missing",
        value: without("accessToken", newValues),
        expected: { ...newValues, accessToken: defaults.accessToken },
    },
    {
        description: "default accessToken when it is invalid",
        value: { ...newValues, accessToken: 42 },
        expected: { ...newValues, accessToken: defaults.accessToken },
    },
    {
        description: "default refreshToken when it is missing",
        value: without("refreshToken", newValues),
        expected: { ...newValues, refreshToken: defaults.refreshToken },
    },
    {
        description: "default refreshToken when it is invalid",
        value: { ...newValues, refreshToken: 42 },
        expected: { ...newValues, refreshToken: defaults.refreshToken },
    },
    {
        description: "default outputFolder when it is missing",
        value: without("outputFolder", newValues),
        expected: { ...newValues, outputFolder: defaults.outputFolder },
    },
    {
        description: "default outputFolder when it is invalid",
        value: { ...newValues, outputFolder: 42 },
        expected: { ...newValues, outputFolder: defaults.outputFolder },
    },
    {
        description: "default notePrefix when it is missing",
        value: without("notePrefix", newValues),
        expected: { ...newValues, notePrefix: defaults.notePrefix },
    },
    {
        description: "default notePrefix when it is invalid",
        value: { ...newValues, notePrefix: 42 },
        expected: { ...newValues, notePrefix: defaults.notePrefix },
    },
    {
        description: "default noteLabel when it is missing",
        value: without("noteLabel", newValues),
        expected: { ...newValues, noteLabel: defaults.noteLabel },
    },
    {
        description: "default noteLabel when it is invalid",
        value: { ...newValues, noteLabel: 42 },
        expected: { ...newValues, noteLabel: defaults.noteLabel },
    },
    {
        description: "default tokenExpiresAt when it is missing",
        value: without("tokenExpiresAt", newValues),
        expected: { ...newValues, tokenExpiresAt: defaults.tokenExpiresAt },
    },
    {
        description: "default tokenExpiresAt when it is a string",
        value: { ...newValues, tokenExpiresAt: "22" },
        expected: { ...newValues, tokenExpiresAt: defaults.tokenExpiresAt },
    },
    {
        description: "default tokenExpiresAt when it is a negative number",
        value: { ...newValues, tokenExpiresAt: -33 },
        expected: { ...newValues, tokenExpiresAt: defaults.tokenExpiresAt },
    },
    {
        description: "keeps tokenExpiresAt when it is zero",
        value: { ...newValues, tokenExpiresAt: 0 },
        expected: { ...newValues, tokenExpiresAt: 0 },
    },
    {
        description: "default headingLevel when it is missing",
        value: without("headingLevel", newValues),
        expected: { ...newValues, headingLevel: defaults.headingLevel },
    },
    {
        description: "default headingLevel when it is invalid",
        value: { ...newValues, headingLevel: "3" },
        expected: { ...newValues, headingLevel: defaults.headingLevel },
    },
    {
        description: "default headingLevel when it is greater than 6",
        value: { ...newValues, headingLevel: 7 },
        expected: { ...newValues, headingLevel: defaults.headingLevel },
    },
    {
        description: "default headingLevel when it is zero",
        value: { ...newValues, headingLevel: 0 },
        expected: { ...newValues, headingLevel: defaults.headingLevel },
    },
    {
        description: "default headingLevel when it is a negative number",
        value: { ...newValues, headingLevel: -1 },
        expected: { ...newValues, headingLevel: defaults.headingLevel },
    },
    {
        description: "default headingLevel when it is a decimal number",
        value: { ...newValues, headingLevel: 4.2 },
        expected: { ...newValues, headingLevel: defaults.headingLevel },
    },
];

describe("toSettings", () => {
    for (const { description, value, expected } of cases) {
        it(`returns ${description}`, () => {
            const result = toSettings(value, defaults);
            assert.deepStrictEqual(result, expected);
        });
    }
    it("returns a copy of the defaults, not the same object", () => {
        const result = toSettings(null, defaults);
        assert.notStrictEqual(result, defaults);
    });
});
