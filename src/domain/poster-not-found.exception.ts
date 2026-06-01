export class PosterNotFound extends Error {
    constructor(message: string) {
        super(`Poster not found: ${message}`);
        this.name = 'PosterNotFound';
    }
}
