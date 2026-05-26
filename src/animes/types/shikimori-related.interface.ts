export interface ShikimoriRelated {
    id: string;
    relationKind: string;
    relationText: string;
    anime: { id: string; } | null;
    manga: { id: string; } | null;
}
