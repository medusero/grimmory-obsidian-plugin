import type { GrimmorySyncSettings } from "./settings.ts";
import { TitleError } from "./titleError.ts";

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
    const sanitizedTitle = sanitizeTitle(bookTitle);
    if (sanitizedTitle.trim().length === 0) {
        throw new TitleError(
            `Book title ${JSON.stringify(bookTitle)} has no characters usable in a file name`,
        );
    }
    const fileName = settings.notePrefix + sanitizedTitle + ".md";
    return settings.outputFolder
        ? `${settings.outputFolder}/${fileName}`
        : fileName;
}
