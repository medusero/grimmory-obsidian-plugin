export class TitleError extends Error {
    constructor(message: string) {
        super(message);
        this.name = "TitleError";
    }
}
