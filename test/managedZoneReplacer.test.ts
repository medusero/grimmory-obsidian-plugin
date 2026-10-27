import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { replaceManagedZone } from "../src/managedZoneReplacer.ts";
import { separatorEnd, separatorStart } from "../src/markers.ts";

interface ZoneReplacerCase {
    description: string;
    fileContent: string;
    renderedEntries: string;
    expected: string;
}

const frontmatter = "---\ngs-state: active\ngs-book-id: 42\n---";
const prevText = "Esto es un comentario previo";
const postText = "Esto es un comentario posterior";
const oldZone = "## Capítulo 4\n\n> El viajero cruzó el puente al amanecer.";
const newZone = "## Capítulo 4\n\n> El viajero cruzó el puente al ATARDECER.";

const cases: ZoneReplacerCase[] = [
    {
        description: "only frontmatter before managed zone",
        fileContent: `${frontmatter}\n\n${separatorStart}\n\n${oldZone}\n\n${separatorEnd}`,
        renderedEntries: newZone,
        expected: `${frontmatter}\n\n${separatorStart}\n${newZone}\n${separatorEnd}`,
    },
    {
        description: "user text before managed zone",
        fileContent: `${frontmatter}\n\n${prevText}\n\n${separatorStart}\n\n${oldZone}\n\n${separatorEnd}`,
        renderedEntries: newZone,
        expected: `${frontmatter}\n\n${prevText}\n\n${separatorStart}\n${newZone}\n${separatorEnd}`,
    },
    {
        description: "user text after managed zone",
        fileContent: `${frontmatter}\n\n${separatorStart}\n\n${oldZone}\n\n${separatorEnd}\n\n${postText}`,
        renderedEntries: newZone,
        expected: `${frontmatter}\n\n${separatorStart}\n${newZone}\n${separatorEnd}\n\n${postText}`,
    },
    {
        description: "user text before and after managed zone",
        fileContent: `${frontmatter}\n\n${prevText}\n\n${separatorStart}\n\n${oldZone}\n\n${separatorEnd}\n\n${postText}`,
        renderedEntries: newZone,
        expected: `${frontmatter}\n\n${prevText}\n\n${separatorStart}\n${newZone}\n${separatorEnd}\n\n${postText}`,
    },
    {
        description: "no entries",
        fileContent: `${frontmatter}\n\n${prevText}\n\n${separatorStart}\n\n${oldZone}\n\n${separatorEnd}\n\n${postText}`,
        renderedEntries: "",
        expected: `${frontmatter}\n\n${prevText}\n\n${separatorStart}\n\n${separatorEnd}\n\n${postText}`,
    },
];

describe("replaceManagedZone", () => {
    for (const {
        description,
        fileContent,
        renderedEntries,
        expected,
    } of cases) {
        it(`returns ${description}`, () => {
            const result = replaceManagedZone(fileContent, renderedEntries);
            assert.strictEqual(result, expected);
        });
        it(`is idempotent for ${description}`, () => {
            const first = replaceManagedZone(fileContent, renderedEntries);
            const second = replaceManagedZone(first, renderedEntries);
            assert.strictEqual(first, second);
        });
    }
    it("throws when there are no markers", () => {
        assert.throws(
            () =>
                replaceManagedZone(
                    `${frontmatter}\n\n${prevText}\n\n${oldZone}`,
                    newZone,
                ),
            {
                name: "MarkerError",
            },
        );
    });
    it("throws when there is no initial marker", () => {
        assert.throws(
            () =>
                replaceManagedZone(
                    `${frontmatter}\n\n${prevText}\n\n${oldZone}\n\n${separatorEnd}`,
                    newZone,
                ),
            {
                name: "MarkerError",
            },
        );
    });
    it("throws when there is no final marker", () => {
        assert.throws(
            () =>
                replaceManagedZone(
                    `${frontmatter}\n\n${prevText}\n\n${separatorStart}\n\n${oldZone}`,
                    newZone,
                ),
            {
                name: "MarkerError",
            },
        );
    });
    it("throws when there is a duplicated start marker", () => {
        assert.throws(
            () =>
                replaceManagedZone(
                    `${frontmatter}\n\n${prevText}\n\n${separatorStart}\n\n${oldZone}\n\n${separatorStart}\n\n${oldZone}\n\n${separatorEnd}`,
                    newZone,
                ),
            {
                name: "MarkerError",
            },
        );
    });
    it("throws when there is a duplicated end marker", () => {
        assert.throws(
            () =>
                replaceManagedZone(
                    `${frontmatter}\n\n${prevText}\n\n${separatorStart}\n\n${oldZone}\n\n${separatorEnd}\n\n${oldZone}\n\n${separatorEnd}`,
                    newZone,
                ),
            {
                name: "MarkerError",
            },
        );
    });
    it("throws when there is a duplicated managed zone", () => {
        assert.throws(
            () =>
                replaceManagedZone(
                    `${frontmatter}\n\n${separatorStart}\n\n${oldZone}\n\n${separatorEnd}\n\n${postText}\n\n${separatorStart}\n\n${oldZone}\n\n${separatorEnd}`,
                    newZone,
                ),
            {
                name: "MarkerError",
            },
        );
    });
    it("throws when start and end markers in reversed order", () => {
        assert.throws(
            () =>
                replaceManagedZone(
                    `${frontmatter}\n\n${separatorEnd}\n\n${prevText}\n\n${oldZone}\n\n${separatorStart}`,
                    newZone,
                ),
            {
                name: "MarkerError",
            },
        );
    });
});
