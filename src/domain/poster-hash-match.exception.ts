export class PosterHashMatch extends Error {
    constructor(path: string) {
        super(`Poster up-to-date: ${path}`);
        this.name = 'PosterHashMatch';
    }
}
