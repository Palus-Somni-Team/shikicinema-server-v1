export const ANIME_SORT_FIELDS = ['id', 'score', 'aired_on', 'released_on', 'name', 'duration'] as const;

export type AnimeSortFieldsType = typeof ANIME_SORT_FIELDS[number];
