export interface GrimmorySyncSettings {
    baseUrl: string;
    accessToken: string;
    refreshToken: string;
    tokenExpiresAt: number;
}

export const DEFAULT_SETTINGS: GrimmorySyncSettings = {
    baseUrl: "",
    accessToken: "",
    refreshToken: "",
    tokenExpiresAt: 0,
}
