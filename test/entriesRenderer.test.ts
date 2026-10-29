import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { type RenderSettings, renderEntries } from "../src/entriesRenderer.ts";
import type { BookEntry } from "../src/types.ts";

interface RenderCase {
    description: string;
    entries: BookEntry[];
    settings: RenderSettings;
    expected: string;
}

const defaultSettings: RenderSettings = {
    noteLabel: "**Note:** ",
    headingLevel: 2,
};

const cases: RenderCase[] = [
    {
        description: "highlight without note",
        entries: [
            {
                cfi: "epubcfi(/6/8!/4/56,/1:100,/1:300)",
                highlightText: "El viajero cruzó el puente al amanecer.",
                chapterTitle: "Capítulo 4",
            },
        ],
        settings: defaultSettings,
        expected:
            "## Capítulo 4\n\n> El viajero cruzó el puente al amanecer.\n\n",
    },
    {
        description: "highlight with note",
        entries: [
            {
                cfi: "epubcfi(/6/8!/4/58,/1:0,/1:120)",
                highlightText: "Nadie recordó quién había construido la torre.",
                noteText: "Comparar con el capítulo 3.",
                chapterTitle: "Capítulo 4",
            },
        ],
        settings: defaultSettings,
        expected:
            "## Capítulo 4\n\n> Nadie recordó quién había construido la torre.\n\n**Note:** Comparar con el capítulo 3.\n\n",
    },
    {
        description: "orphan note",
        entries: [
            {
                cfi: "epubcfi(/6/10!/4/12)",
                noteText: "Aquí cambia el narrador.",
                chapterTitle: "Capítulo 5",
            },
        ],
        settings: defaultSettings,
        expected: "## Capítulo 5\n\n**Note:** Aquí cambia el narrador.\n\n",
    },
    {
        description: "three entries from two chapters",
        entries: [
            {
                cfi: "epubcfi(/6/8!/4/56,/1:100,/1:300)",
                highlightText: "El viajero cruzó el puente al amanecer.",
                chapterTitle: "Capítulo 4",
            },
            {
                cfi: "epubcfi(/6/8!/4/58,/1:0,/1:120)",
                highlightText: "Nadie recordó quién había construido la torre.",
                noteText: "Comparar con el capítulo 3.",
                chapterTitle: "Capítulo 4",
            },
            {
                cfi: "epubcfi(/6/10!/4/12)",
                noteText: "Aquí cambia el narrador.",
                chapterTitle: "Capítulo 5",
            },
        ],
        settings: defaultSettings,
        expected:
            "## Capítulo 4\n\n> El viajero cruzó el puente al amanecer.\n\n***\n\n> Nadie recordó quién había construido la torre.\n\n**Note:** Comparar con el capítulo 3.\n\n***\n\n## Capítulo 5\n\n**Note:** Aquí cambia el narrador.\n\n",
    },
    {
        description: "no chapter",
        entries: [
            {
                cfi: "epubcfi(/6/2!/4/2,/1:0,/1:40)",
                highlightText: "Para quien espera.",
            },
        ],
        settings: defaultSettings,
        expected: "> Para quien espera.\n\n",
    },
    {
        description: "empty list",
        entries: [],
        settings: defaultSettings,
        expected: "",
    },
    {
        description: "properly formatted quote block",
        entries: [
            {
                cfi: "epubcfi(/6/2!/4/2,/1:0,/1:90)",
                highlightText: "Para quien espera.\nLa muerte llega.",
                chapterTitle: "Capítulo 4",
            },
        ],
        settings: defaultSettings,
        expected: "## Capítulo 4\n\n> Para quien espera.\nLa muerte llega.\n\n",
    },
    {
        description: "headings at the configured level",
        entries: [
            {
                cfi: "epubcfi(/6/2!/4/2,/1:0,/1:90)",
                highlightText: "Para quien espera.",
                chapterTitle: "Capítulo 4",
            },
        ],
        settings: {
            noteLabel: "**Note:** ",
            headingLevel: 3,
        },
        expected: "### Capítulo 4\n\n> Para quien espera.\n\n",
    },
    {
        description: "highlight with empty note",
        entries: [
            {
                cfi: "epubcfi(/6/8!/4/58,/1:0,/1:120)",
                highlightText: "Nadie recordó quién había construido la torre.",
                noteText: "",
                chapterTitle: "Capítulo 4",
            },
        ],
        settings: defaultSettings,
        expected:
            "## Capítulo 4\n\n> Nadie recordó quién había construido la torre.\n\n",
    },
    {
        description: "repeated chapter title",
        entries: [
            {
                cfi: "epubcfi(/6/8!/4/56,/1:100,/1:300)",
                highlightText: "El viajero cruzó el puente al amanecer.",
                chapterTitle: "Interludio",
            },
            {
                cfi: "epubcfi(/6/10!/4/62,/1:90,/1:453)",
                highlightText: "El viento se llevó sus palabras.",
                chapterTitle: "Capítulo 5",
            },
            {
                cfi: "epubcfi(/6/12!/4/12,/1:0,/1:100)",
                highlightText: "Nadie recordó quién había construido la torre.",
                chapterTitle: "Interludio",
            },
        ],
        settings: defaultSettings,
        expected:
            "## Interludio\n\n> El viajero cruzó el puente al amanecer.\n\n***\n\n## Capítulo 5\n\n> El viento se llevó sus palabras.\n\n***\n\n## Interludio\n\n> Nadie recordó quién había construido la torre.\n\n",
    },
    {
        description: "entries in reading order",
        entries: [
            {
                cfi: "epubcfi(/6/8!/4/58,/1:0,/1:120)",
                highlightText: "Nadie recordó quién había construido la torre.",
                chapterTitle: "Capítulo 4",
            },
            {
                cfi: "epubcfi(/6/10!/4/62,/1:90,/1:453)",
                highlightText: "El viento se llevó sus palabras.",
                chapterTitle: "Capítulo 5",
            },
            {
                cfi: "epubcfi(/6/8!/4/56,/1:100,/1:300)",
                highlightText: "El viajero cruzó el puente al amanecer.",
                chapterTitle: "Capítulo 4",
            },
        ],
        settings: defaultSettings,
        expected:
            "## Capítulo 4\n\n> El viajero cruzó el puente al amanecer.\n\n***\n\n> Nadie recordó quién había construido la torre.\n\n***\n\n## Capítulo 5\n\n> El viento se llevó sus palabras.\n\n",
    },
    {
        description: "replacement of an unclosed marker within a highlight",
        entries: [
            {
                cfi: "epubcfi(/6/8!/4/56,/1:100,/1:300)",
                highlightText: "Su pantalla mostraba <!-- claramente.",
                chapterTitle: "Chapter 4",
            },
        ],
        settings: defaultSettings,
        expected:
            "## Chapter 4\n\n> Su pantalla mostraba &lt;!-- claramente.\n\n",
    },
    {
        description: "replacement of an unclosed marker within a note",
        entries: [
            {
                cfi: "epubcfi(/6/8!/4/56,/1:100,/1:300)",
                highlightText: "El viajero cruzó el puente al amanecer.",
                noteText: "Esto es un <!-- gs:start --> marcador",
                chapterTitle: "Chapter 4",
            },
        ],
        settings: defaultSettings,
        expected:
            "## Chapter 4\n\n> El viajero cruzó el puente al amanecer.\n\n**Note:** Esto es un &lt;!-- gs:start --> marcador\n\n",
    },
    {
        description: "replacement of an unclosed marker within a chapter title",
        entries: [
            {
                cfi: "epubcfi(/6/8!/4/56,/1:100,/1:300)",
                highlightText: "El viajero cruzó el puente al amanecer.",
                chapterTitle: "Chapter <!-- 4",
            },
        ],
        settings: defaultSettings,
        expected:
            "## Chapter &lt;!-- 4\n\n> El viajero cruzó el puente al amanecer.\n\n",
    },
    {
        description:
            "replacement of various unclosed marker within a highlight",
        entries: [
            {
                cfi: "epubcfi(/6/8!/4/56,/1:100,/1:300)",
                highlightText: "Su pantalla mostraba <!-- <!-- claramente.",
                chapterTitle: "Chapter 4",
            },
        ],
        settings: defaultSettings,
        expected:
            "## Chapter 4\n\n> Su pantalla mostraba &lt;!-- &lt;!-- claramente.\n\n",
    },
    {
        description: "no chapter title when it's only spaces",
        entries: [
            {
                cfi: "epubcfi(/6/8!/4/56,/1:100,/1:300)",
                highlightText: "El viajero cruzó el puente al amanecer.",
                chapterTitle: "   ",
            },
        ],
        settings: defaultSettings,
        expected: "> El viajero cruzó el puente al amanecer.\n\n",
    },
    {
        description:
            "a single heading when an untitled entry sits between two of the same chapter",
        entries: [
            {
                cfi: "epubcfi(/6/8!/4/56,/1:100,/1:300)",
                highlightText: "Nadie recordó quién había construido la torre.",
                chapterTitle: "Capítulo 4",
            },
            {
                cfi: "epubcfi(/6/8!/4/58,/1:0,/1:120)",
                highlightText: "El viento se llevó sus palabras.",
            },
            {
                cfi: "epubcfi(/6/8!/4/62,/1:90,/1:453)",
                highlightText: "El viajero cruzó el puente al amanecer.",
                chapterTitle: "Capítulo 4",
            },
        ],
        settings: defaultSettings,
        expected:
            "## Capítulo 4\n\n> Nadie recordó quién había construido la torre.\n\n***\n\n> El viento se llevó sus palabras.\n\n***\n\n> El viajero cruzó el puente al amanecer.\n\n",
    },
    {
        description: "no heading for a first entry with an empty chapter",
        entries: [
            {
                cfi: "epubcfi(/6/8!/4/56,/1:100,/1:300)",
                highlightText: "El viajero cruzó el puente al amanecer.",
                chapterTitle: "",
            },
            {
                cfi: "epubcfi(/6/8!/4/58,/1:0,/1:120)",
                highlightText: "Nadie recordó quién había construido la torre.",
                chapterTitle: "Capítulo 4",
            },
        ],
        settings: defaultSettings,
        expected:
            "> El viajero cruzó el puente al amanecer.\n\n***\n\n## Capítulo 4\n\n> Nadie recordó quién había construido la torre.\n\n",
    },
    {
        description: "no heading for a second entry with an empty chapter",
        entries: [
            {
                cfi: "epubcfi(/6/8!/4/56,/1:100,/1:300)",
                highlightText: "El viajero cruzó el puente al amanecer.",
                chapterTitle: "Capítulo 4",
            },
            {
                cfi: "epubcfi(/6/8!/4/58,/1:0,/1:120)",
                highlightText: "Nadie recordó quién había construido la torre.",
                chapterTitle: "",
            },
        ],
        settings: defaultSettings,
        expected:
            "## Capítulo 4\n\n> El viajero cruzó el puente al amanecer.\n\n***\n\n> Nadie recordó quién había construido la torre.\n\n",
    },
    {
        description: "no heading for an entry without chapter",
        entries: [
            {
                cfi: "epubcfi(/6/8!/4/56,/1:100,/1:300)",
                highlightText: "El viajero cruzó el puente al amanecer.",
                chapterTitle: "Capítulo 4",
            },
            {
                cfi: "epubcfi(/6/8!/4/58,/1:0,/1:120)",
                highlightText: "Nadie recordó quién había construido la torre.",
            },
        ],
        settings: defaultSettings,
        expected:
            "## Capítulo 4\n\n> El viajero cruzó el puente al amanecer.\n\n***\n\n> Nadie recordó quién había construido la torre.\n\n",
    },
];

describe("renderEntries", () => {
    for (const { description, entries, settings, expected } of cases) {
        it(`returns ${description}`, () => {
            const result = renderEntries(entries, settings);
            assert.strictEqual(result, expected);
        });
    }
    it(
        "two lines in text doesn't break the quote",
        { todo: "right now the quote breaks" },
        () => {
            assert.strictEqual(
                renderEntries(
                    [
                        {
                            cfi: "epubcfi(/6/2!/4/2,/1:0,/1:90)",
                            highlightText:
                                "Para quien espera.\n\nLa muerte llega.",
                            chapterTitle: "Capítulo 4",
                        },
                    ],
                    defaultSettings,
                ),
                "## Capítulo 4\n\n> Para quien espera.\n>\n> La muerte llega.\n\n",
            );
        },
    );
    it("separator in text doesn't break managed zone", () => {
        assert.doesNotMatch(
            renderEntries(
                [
                    {
                        cfi: "epubcfi(/6/2!/4/2,/1:0,/1:90)",
                        highlightText: "Fin <!-- gs:end --> del texto.",
                        chapterTitle: "Capítulo 4",
                    },
                ],
                defaultSettings,
            ),
            /<!--\s*gs:(start|end)\s*-->/,
        );
    });
    it(
        "markdown character in text doesn't alter the format",
        { todo: "right now Obsidian renders the '#'" },
        () => {
            assert.strictEqual(
                renderEntries(
                    [
                        {
                            cfi: "epubcfi(/6/2!/4/2,/1:0,/1:90)",
                            highlightText: "# No es un título.",
                            chapterTitle: "Capítulo 4",
                        },
                    ],
                    defaultSettings,
                ),
                "## Capítulo 4\n\n> \\# No es un título.\n\n",
            );
        },
    );
    it(
        "skips entries without text",
        { todo: "right now the result is a chapterTitle alone" },
        () => {
            assert.strictEqual(
                renderEntries(
                    [
                        {
                            cfi: "epubcfi(/6/8!/4/58,/1:0,/1:120)",
                            highlightText: "",
                            noteText: "",
                            chapterTitle: "Capítulo 4",
                        },
                    ],
                    defaultSettings,
                ),
                "",
            );
        },
    );
    it(
        "skips first entry without text",
        { todo: "right now the result is a chapterTitle alone" },
        () => {
            assert.strictEqual(
                renderEntries(
                    [
                        {
                            cfi: "epubcfi(/6/8!/4/56,/1:100,/1:300)",
                            highlightText: "",
                            noteText: "",
                            chapterTitle: "Capítulo 4",
                        },
                        {
                            cfi: "epubcfi(/6/8!/4/58,/1:0,/1:120)",
                            highlightText:
                                "El viajero cruzó el puente al amanecer.",
                            noteText: "",
                            chapterTitle: "Capítulo 4",
                        },
                    ],
                    defaultSettings,
                ),
                "## Capítulo 4\n\n> El viajero cruzó el puente al amanecer.\n\n",
            );
        },
    );
});
