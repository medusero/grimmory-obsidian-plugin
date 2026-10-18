import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { compareCfi } from "../src/cfiComparator.ts";

interface ComparisonCase {
    description: string;
    input: [string, string];
    sign: -1 | 0 | 1;
}

const cases: ComparisonCase[] = [
    {
        description: "different chapters",
        input: [
            "epubcfi(/6/22!/4/534,/1:0,/1:357)",
            "epubcfi(/6/28!/4/312,/1:0,/1:548)",
        ],
        sign: -1,
    },
    {
        description: "same chapter, different paragraph",
        input: [
            "epubcfi(/6/32!/4/6,/1:160,/1:344)",
            "epubcfi(/6/32!/4/8,/1:358,/1:904)",
        ],
        sign: -1,
    },
    {
        description: "same paragraph, different initial character",
        input: [
            "epubcfi(/6/8!/4/56,/1:100,/1:500)",
            "epubcfi(/6/8!/4/56,/1:300,/1:500)",
        ],
        sign: -1,
    },
    {
        description: "same beginning, different ending",
        input: [
            "epubcfi(/6/8!/4/56,/1:100,/1:300)",
            "epubcfi(/6/8!/4/56,/1:100,/1:500)",
        ],
        sign: -1,
    },
    {
        description: "identical CFI",
        input: [
            "epubcfi(/6/8!/4/56,/1:100,/1:500)",
            "epubcfi(/6/8!/4/56,/1:100,/1:500)",
        ],
        sign: 0,
    },
    {
        description: "prefix",
        input: ["epubcfi(/6/8!/4/56)", "epubcfi(/6/8!/4/56,/1:100,/1:500)"],
        sign: -1,
    },
];

describe("compareCfi", () => {
    for (const { description, input, sign } of cases) {
        it(`orders ${description} correctly`, () => {
            const result = compareCfi(input[0], input[1]);
            assert.strictEqual(Math.sign(result), sign);
        });
        it(`is antisymmetric for ${description}`, () => {
            const signAB = Math.sign(compareCfi(input[0], input[1]));
            const signBA = Math.sign(compareCfi(input[1], input[0]));
            const sum = signAB + signBA;
            assert.strictEqual(
                sum,
                0,
                `Values (a, b): ${signAB}, Values (b, a): ${signBA}`,
            );
        });
    }
    it(
        "ignores [id] assertions when ordering",
        { todo: "cfiToNumbers reads digits inside [id] assertions" },
        () => {
            const a = "epubcfi(/6/8[chap03]!/4/56,/1:100,/1:500)";
            const b = "epubcfi(/6/8!/4/4,/1:0,/1:76)";
            const sign = Math.sign(compareCfi(a, b));
            assert.strictEqual(sign, 1);
        },
    );
});
