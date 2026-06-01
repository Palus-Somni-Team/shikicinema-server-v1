import { AnimeSeasonEnum } from './anime-season.enum';

export const SEASON_MONTHS = {
    winter: [1, 2, 3],
    spring: [4, 5, 6],
    summer: [7, 8, 9],
    fall: [10, 11, 12],
} as const satisfies Record<AnimeSeasonEnum, readonly number[]>;
