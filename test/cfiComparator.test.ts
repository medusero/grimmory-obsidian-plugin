import assert from "node:assert/strict";
import test from "node:test";
import { compareCfi } from "../src/cfiComparator.ts";

test("sorts an earlier paragraph before a later one in the same chapter", () => {
    const result = compareCfi(
        "epubcfi(/6/32!/4/6,/1:160,/1:344)",
        "epubcfi(/6/32!/4/8,/1:358,/1:904)",
    );
    assert.strictEqual(result < 0, true, `Result: ${result}`);
});
