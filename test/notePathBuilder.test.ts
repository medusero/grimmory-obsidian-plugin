import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { type PathSettings, buildNotePath } from "../src/notePathBuilder.ts";

interface FilenameCase {
    description: string;
    title: string;
    settings: PathSettings;
    expected: string;
}

const cases: FilenameCase[] = [
    {
        description: "filename with folder and prefix",
        title: "Romeo and Juliet",
        settings: {
            notePrefix: "Annotations from ",
            outputFolder: "Books",
        },
        expected: "Books/Annotations from Romeo and Juliet.md",
    },
    {
        description: "filename without folder or prefix",
        title: "Romeo and Juliet",
        settings: {
            notePrefix: "",
            outputFolder: "",
        },
        expected: "Romeo and Juliet.md",
    },
    {
        description: "filename with prefix but no folder",
        title: "Romeo and Juliet",
        settings: {
            notePrefix: "Annotations from ",
            outputFolder: "",
        },
        expected: "Annotations from Romeo and Juliet.md",
    },
    {
        description: "filename with folder but no prefix",
        title: "Romeo and Juliet",
        settings: {
            notePrefix: "",
            outputFolder: "Books",
        },
        expected: "Books/Romeo and Juliet.md",
    },
    {
        description: "filename without forbidden characters",
        title: "Shakespeare: Romeo/Juliet",
        settings: {
            notePrefix: "",
            outputFolder: "",
        },
        expected: "Shakespeare RomeoJuliet.md",
    },
    {
        description: "filename without initial dot",
        title: ".Romeo and Juliet",
        settings: {
            notePrefix: "",
            outputFolder: "",
        },
        expected: "Romeo and Juliet.md",
    },
    {
        description: "filename with non-initial dots",
        title: "Romeo.and.Juliet",
        settings: {
            notePrefix: "",
            outputFolder: "",
        },
        expected: "Romeo.and.Juliet.md",
    },
    {
        description: "filename without Obsidian's problematic characters",
        title: "#Romeo [and] ^Juliet",
        settings: {
            notePrefix: "",
            outputFolder: "",
        },
        expected: "Romeo and Juliet.md",
    },
    {
        description: "filename without a leading dot left after cleaning",
        title: "#.Romeo.and.Juliet",
        settings: {
            notePrefix: "",
            outputFolder: "",
        },
        expected: "Romeo.and.Juliet.md",
    },
];

describe("buildNotePath", () => {
    for (const { description, title, settings, expected } of cases) {
        it(`returns ${description}`, () => {
            const result = buildNotePath(title, settings);
            assert.strictEqual(result, expected);
        });
    }
    it(
        "throws when title is empty",
        { todo: "right now the result is '.md'" },
        () => {
            assert.throws(
                () => buildNotePath("", { notePrefix: "", outputFolder: "" }),
                Error,
            );
        },
    );
    it(
        "throws when title only contains illegal characters",
        { todo: "right now the result is '.md'" },
        () => {
            assert.throws(
                () =>
                    buildNotePath("::::", { notePrefix: "", outputFolder: "" }),
                Error,
            );
        },
    );
    it(
        "throws when title only contains dots",
        {
            todo: "right now the result is '.md'",
        },
        () => {
            assert.throws(
                () =>
                    buildNotePath("...", { notePrefix: "", outputFolder: "" }),
                Error,
            );
        },
    );
});
