import { ANIME_SORT_FIELDS } from './anime-sort-fields.type';

export const ANIME_QUERY_SORT_FIELDS = [...ANIME_SORT_FIELDS, 'user_score', 'user_created', 'user_updated'] as const;

export type AnimeQuerySortFieldsType = typeof ANIME_QUERY_SORT_FIELDS[number];
