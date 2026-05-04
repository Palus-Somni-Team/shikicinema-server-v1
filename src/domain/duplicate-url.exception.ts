export class DuplicateUrlException extends Error {
    constructor(url: string) {
        super(`Record with this url already exists: ${url}`);
        this.name = 'DuplicateUrlException';
    }
}
