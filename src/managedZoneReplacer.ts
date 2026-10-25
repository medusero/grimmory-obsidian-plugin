import { separatorEnd, separatorStart } from "./markers.ts";

export function replaceManagedZone(
    fileContent: string,
    renderedEntries: string,
): string {
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
