import { isRecord } from "./recordGuard.ts";
import type { GrimmorySyncSettings } from "./settings.ts";

export function toSettings(
    value: unknown,
    defaults: GrimmorySyncSettings,
): GrimmorySyncSettings {
    if (!isRecord(value)) {
        return { ...defaults };
    }
    return {
        baseUrl:
            typeof value.baseUrl === "string"
                ? value.baseUrl
                : defaults.baseUrl,
        accessToken:
            typeof value.accessToken === "string"
                ? value.accessToken
                : defaults.accessToken,
        refreshToken:
            typeof value.refreshToken === "string"
                ? value.refreshToken
                : defaults.refreshToken,
        tokenExpiresAt:
            typeof value.tokenExpiresAt === "number" &&
            value.tokenExpiresAt >= 0
                ? value.tokenExpiresAt
                : defaults.tokenExpiresAt,
        outputFolder:
            typeof value.outputFolder === "string"
                ? value.outputFolder
                : defaults.outputFolder,
        notePrefix:
            typeof value.notePrefix === "string"
                ? value.notePrefix
                : defaults.notePrefix,
        headingLevel:
            typeof value.headingLevel === "number" &&
            Number.isInteger(value.headingLevel) &&
            value.headingLevel > 0 &&
            value.headingLevel <= 6
                ? value.headingLevel
                : defaults.headingLevel,
        noteLabel:
            typeof value.noteLabel === "string"
                ? value.noteLabel
                : defaults.noteLabel,
    };
}
