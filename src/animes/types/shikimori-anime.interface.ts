export interface ShikimoriAnime {
    id: string;
    name: string;
    russian: string | null;
    licenseNameRu: string | null;
    english: string | null;
    japanese: string | null;
    synonyms: string[] | null;
    kind: string;
    rating: string | null;
    score: number | null;
    status: string | null;
    duration: number | null;
    airedOn: { year: number; month: number; day: number; date: string } | null;
    releasedOn: { year: number; month: number; day: number; date: string } | null;
    url: string | null;
    nextEpisodeAt: string | null;
    genres: { id: string; name: string; russian: string; kind: string }[] | null;
    studios: { id: string; name: string; imageUrl: string }[] | null;
    related: Array<{
        id: string;
        anime: { id: string; name: string } | null;
        manga: { id: string; name: string } | null;
        relationKind: string;
        relationText: string;
    }> | null;
    videos: Array<{
        id: string;
        url: string;
        name: string;
        kind: string;
        playerUrl: string;
        imageUrl:
        string
    }> | null;
    description: string | null;
    poster?: { originalUrl: string } | null;
}
