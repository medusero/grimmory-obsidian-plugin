import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { toAnnotation } from "../src/annotationParser.ts";
import type { Annotation } from "../src/types.ts";

interface AnnotationCase {
    description: string;
    value: unknown;
    expected: Annotation | null;
}

const cases: AnnotationCase[] = [
    {
        description: "an Annotation for a valid value",
        value: {
            cfi: "epubcfi(/6/22!/4/534,/1:0,/1:357)",
            text: "El viento se levanta.",
            chapterTitle: "Capítulo 4",
        },
        expected: {
            cfi: "epubcfi(/6/22!/4/534,/1:0,/1:357)",
            text: "El viento se levanta.",
            chapterTitle: "Capítulo 4",
        },
    },
    {
        description: "an Annotation for a valid value with empty text",
        value: {
            cfi: "epubcfi(/6/22!/4/534,/1:0,/1:357)",
            text: "",
            chapterTitle: "Capítulo 4",
        },
        expected: {
            cfi: "epubcfi(/6/22!/4/534,/1:0,/1:357)",
            text: "",
            chapterTitle: "Capítulo 4",
        },
    },
    {
        description: "an Annotation for a valid value with null chapterTitle",
        value: {
            cfi: "epubcfi(/6/22!/4/534,/1:0,/1:357)",
            text: "El viento se levanta.",
            chapterTitle: null,
        },
        expected: {
            cfi: "epubcfi(/6/22!/4/534,/1:0,/1:357)",
            text: "El viento se levanta.",
        },
    },
    {
        description:
            "an Annotation for a valid value with invalid chapterTitle",
        value: {
            cfi: "epubcfi(/6/22!/4/534,/1:0,/1:357)",
            text: "El viento se levanta.",
            chapterTitle: 42,
        },
        expected: {
            cfi: "epubcfi(/6/22!/4/534,/1:0,/1:357)",
            text: "El viento se levanta.",
        },
    },
    {
        description: "an Annotation for a valid value with unexpected fields",
        value: {
            cfi: "epubcfi(/6/22!/4/534,/1:0,/1:357)",
            text: "El viento se levanta.",
            chapterTitle: "Capítulo 4",
            color: "#FF555",
            id: 42,
        },
        expected: {
            cfi: "epubcfi(/6/22!/4/534,/1:0,/1:357)",
            text: "El viento se levanta.",
            chapterTitle: "Capítulo 4",
        },
    },
    {
        description: "null for a non-string CFI",
        value: {
            cfi: 42,
            text: "El viento se levanta.",
            chapterTitle: "Capítulo 4",
        },
        expected: null,
    },
    {
        description: "null for a missing CFI",
        value: {
            text: "El viento se levanta.",
            chapterTitle: "Capítulo 4",
        },
        expected: null,
    },
    {
        description: "null for an empty CFI",
        value: {
            cfi: "",
            text: "El viento se levanta.",
            chapterTitle: "Capítulo 4",
        },
        expected: null,
    },
    {
        description: "null for a CFI with only spaces",
        value: {
            cfi: "   ",
            text: "El viento se levanta.",
            chapterTitle: "Capítulo 4",
        },
        expected: null,
    },
    {
        description: "null for a non-string text",
        value: {
            cfi: "epubcfi(/6/22!/4/534,/1:0,/1:357)",
            text: 42,
            chapterTitle: "Capítulo 4",
        },
        expected: null,
    },
    {
        description: "null for a missing text",
        value: {
            cfi: "epubcfi(/6/22!/4/534,/1:0,/1:357)",
            chapterTitle: "Capítulo 4",
        },
        expected: null,
    },
    {
        description: "null for an array as value",
        value: ["Esto no es Annotation"],
        expected: null,
    },
    {
        description: "null for null as value",
        value: null,
        expected: null,
    },
];

describe("toAnnotation", () => {
    for (const { description, value, expected } of cases) {
        it(`returns ${description}`, () => {
            const result = toAnnotation(value);
            assert.deepStrictEqual(result, expected);
        });
    }
});
