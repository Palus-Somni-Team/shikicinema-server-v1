export interface AnimeSearchDocument {
    id: number;
    titles: Record<string, string[]>;
    score: number | null;
    poster: string;
}
