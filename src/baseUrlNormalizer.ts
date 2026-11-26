export function normalizeBaseUrl(url: string): string {
    const trimmed = url.trim();
    return trimmed.replace(/\/+$/, "");
}
