export class PosterNotFound extends Error {
    constructor(animeId: number | string) {
        super(`Poster not found for anime id: ${animeId}`);
        this.name = 'PosterNotFound';
    }
}
