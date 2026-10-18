function cfiToNumbers(cfi: string): number[] {
    // Drop [id] assertions: they may contain digits that are not path steps.
    const cfiWithoutAssertions = cfi.replace(/\[[^\]]*\]/g, "");
    const cfiStrings = cfiWithoutAssertions.match(/\d+/g);
    const cfiNumbers = cfiStrings?.map(Number) ?? [];
    return cfiNumbers;
}

export function compareCfi(a: string, b: string): number {
    const cfiA = cfiToNumbers(a);
    const cfiB = cfiToNumbers(b);
    const length = Math.min(cfiA.length, cfiB.length);
    for (let i = 0; i < length; i++) {
        if (cfiA[i] !== cfiB[i]) return cfiA[i] - cfiB[i];
    }
    return cfiA.length - cfiB.length;
}
