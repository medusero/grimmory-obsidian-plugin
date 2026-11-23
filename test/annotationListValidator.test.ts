import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { validateAnnotationList } from "../src/annotationListValidator.ts";
import type { ParsedList } from "../src/listParser.ts";
import type { Annotation } from "../src/types.ts";

interface ArrayListCase {
    description: string;
    value: unknown;
    expected: ParsedList<Annotation>;
}

interface NonArrayListCase {
    description: string;
    value: unknown;
    message: RegExp;
}

const nonArrayCases: NonArrayListCase[] = [
    {
        description: "when value is null",
        value: null,
        message: /The annotation list response is not an array/,
    },
];

const arrayCases: ArrayListCase[] = [
    {
        description: "valid list for one Annotation",
        value: [
            {
                cfi: "epubcfi(/6/22!/4/534,/1:0,/1:357)",
                text: "El viajero cruzó el puente al amanecer.",
            },
        ],
        expected: {
            valid: [
                {
                    cfi: "epubcfi(/6/22!/4/534,/1:0,/1:357)",
                    text: "El viajero cruzó el puente al amanecer.",
                },
            ],
            invalid: [],
        },
    },
    {
        description:
            "valid list for one Annotation, invalid list for an invalid Annotation",
        value: [
            {
                cfi: "epubcfi(/6/22!/4/534,/1:0,/1:357)",
                text: "El viajero cruzó el puente al amanecer.",
            },
            {
                id: 42,
                noteContent: "Nadie recordó quién había construido la torre.",
            },
        ],
        expected: {
            valid: [
                {
                    cfi: "epubcfi(/6/22!/4/534,/1:0,/1:357)",
                    text: "El viajero cruzó el puente al amanecer.",
                },
            ],
            invalid: [
                {
                    id: 42,
                    noteContent:
                        "Nadie recordó quién había construido la torre.",
                },
            ],
        },
    },
];

describe("validateAnnotationList", () => {
    describe("array responses", () => {
        for (const { description, value, expected } of arrayCases) {
            it(`returns ${description}`, () => {
                const result = validateAnnotationList(value);
                assert.deepStrictEqual(result, expected);
            });
        }
    });
    describe("non array responses", () => {
        for (const { description, value, message } of nonArrayCases) {
            it(`throws ${description}`, () => {
                assert.throws(() => validateAnnotationList(value), {
                    name: "ApiResponseError",
                    message,
                });
            });
        }
    });
});
