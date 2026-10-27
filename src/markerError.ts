export class MarkerError extends Error {
    constructor(message: string) {
        super(message);
        this.name = "MarkerError";
    }
}
