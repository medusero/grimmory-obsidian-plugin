import { MarkerError } from "./markerError.ts";
import { separatorEnd, separatorStart } from "./markers.ts";

function assertValidMarkers(fileContent: string): void {
    const startCount = fileContent.split(separatorStart).length - 1;
    const endCount = fileContent.split(separatorEnd).length - 1;
    if (startCount === 0) {
        throw new MarkerError("There is no initial marker");
    }
    if (startCount > 1) {
        throw new MarkerError(`There are ${startCount} initial markers`);
    }
    if (endCount === 0) {
        throw new MarkerError("There is no final marker");
    }
    if (endCount > 1) {
        throw new MarkerError(`There are ${endCount} final markers`);
    }
    const startIndex = fileContent.indexOf(separatorStart);
    const endIndex = fileContent.indexOf(separatorEnd);
    if (startIndex > endIndex) {
        throw new MarkerError("Incorrect order of markers");
    }
}

export function replaceManagedZone(
    fileContent: string,
    renderedEntries: string,
): string {
    assertValidMarkers(fileContent);
    const [before, rest] = fileContent.split(separatorStart);
    const [, after] = rest.split(separatorEnd);
    return (
        before +
        `${separatorStart}\n` +
        renderedEntries +
        `\n${separatorEnd}` +
        after
    );
}
