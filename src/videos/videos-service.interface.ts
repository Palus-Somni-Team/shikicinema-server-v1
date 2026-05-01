export interface VideosServiceInterface {
  getAnimeLength(animeId: number): Promise<number>;
}
