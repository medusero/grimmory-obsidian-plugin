export function isValidBaseUrl(url: string): boolean {
    try {
        const parsed = new URL(url);
        const hasHttp =
            parsed.protocol === "http:" || parsed.protocol === "https:";
        //checking vith `href` makes it unnecessary to use the `search` and `hash` methods.
        const hasSearch = parsed.href.includes("?");
        const hasHash = parsed.href.includes("#");
        return hasHttp && !hasSearch && !hasHash;
    } catch {
        return false;
    }
}
