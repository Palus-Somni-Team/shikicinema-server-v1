import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { mock } from 'jest-mock-extended';

import { VideosService } from './videos.service';
import { VideoEntity } from '../entities';

describe('VideosService', () => {
  let service: VideosService;
  let videoRepo: jest.Mocked<Repository<VideoEntity>>;

  beforeEach(async () => {
    videoRepo = mock<Repository<VideoEntity>>();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        VideosService,
        { provide: getRepositoryToken(VideoEntity), useValue: videoRepo },
      ],
    }).compile();

    service = module.get<VideosService>(VideosService);
  });

  describe('getAnimeLength', () => {
    const mockQb = () => ({
      select: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      getRawOne: jest.fn().mockResolvedValue({ max: null }),
    });

    it('queries MAX(episode) for given anime_id', async () => {
      const qb = mockQb();
      videoRepo.createQueryBuilder.mockReturnValue(qb as any);

      await service.getAnimeLength(6);

      expect(qb.select).toHaveBeenCalledWith('MAX(video.episode)', 'max');
      expect(qb.where).toHaveBeenCalledWith('video.anime_id = :animeId', {
        animeId: 6,
      });
    });

    it('returns 0 when no videos found', async () => {
      const qb = mockQb();
      videoRepo.createQueryBuilder.mockReturnValue(qb as any);

      const result = await service.getAnimeLength(99999);

      expect(result).toBe(0);
    });

    it('parses string max to number', async () => {
      const qb = mockQb();
      qb.getRawOne = jest.fn().mockResolvedValue({ max: '12' });
      videoRepo.createQueryBuilder.mockReturnValue(qb as any);

      const result = await service.getAnimeLength(6);

      expect(result).toBe(12);
    });
  });

  describe('getAuthors', () => {
    const mockQb = () => ({
      select: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      getRawMany: jest.fn().mockResolvedValue([]),
    });

    it('adds ILIKE when name is provided', async () => {
      const name = 'Анк';
      const qb = mockQb();
      videoRepo.createQueryBuilder.mockReturnValue(qb as any);

      await service.getAuthors({ name, limit: 20 });

      expect(qb.andWhere).toHaveBeenCalledWith('video.author ILIKE :name', {
        name: `%${name}%`,
      });
    });

    it('does not add ILIKE when name is not provided', async () => {
      const qb = mockQb();
      videoRepo.createQueryBuilder.mockReturnValue(qb as any);

      await service.getAuthors({ limit: 20 });

      expect(qb.andWhere).not.toHaveBeenCalled();
    });

    it('adds anime_id filter when animeId is provided', async () => {
      const qb = mockQb();
      videoRepo.createQueryBuilder.mockReturnValue(qb as any);

      await service.getAuthors({ animeId: 6, limit: 20 });

      expect(qb.andWhere).toHaveBeenCalledWith('video.anime_id = :animeId', {
        animeId: 6,
      });
    });

    it('maps rows to string array', async () => {
      const qb = mockQb();
      qb.getRawMany = jest
        .fn()
        .mockResolvedValue([{ author: 'Ancord' }, { author: 'AniDub' }]);
      videoRepo.createQueryBuilder.mockReturnValue(qb as any);

      const result = await service.getAuthors({ limit: 20 });

      expect(result).toEqual(['Ancord', 'AniDub']);
    });
  });
});
