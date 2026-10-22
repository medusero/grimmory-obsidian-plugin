import type { GrimmorySyncSettings } from "./settings";

export type PathSettings = Pick<
    GrimmorySyncSettings,
    "notePrefix" | "outputFolder"
>;

function sanitizeTitle(title: string): string {
    const cleanTitle = title.replace(/[:/\\?"*<>|[\]#^]/g, "");
    return cleanTitle.replace(/^[.]+/, "");
}

export function buildNotePath(
    bookTitle: string,
    settings: PathSettings,
): string {
    const fileName = settings.notePrefix + sanitizeTitle(bookTitle) + ".md";
    return settings.outputFolder
        ? `${settings.outputFolder}/${fileName}`
        : fileName;
}
