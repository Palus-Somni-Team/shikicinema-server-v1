import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { mock } from 'jest-mock-extended';

import { VideosService } from './videos.service';
import { VideoEntity } from '../entities';
import { KindEnum, QualityEnum } from './dto';

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

  describe('getByAnimeId', () => {
    const mockQb = () => ({
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      take: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      getMany: jest.fn().mockResolvedValue([]),
    });

    it('filters by anime_id', async () => {
      const qb = mockQb();
      videoRepo.createQueryBuilder.mockReturnValue(qb as any);

      await service.getByAnimeId(6, {});

      expect(qb.where).toHaveBeenCalledWith('video.anime_id = :animeId', {
        animeId: 6,
      });
    });

    it('adds episode filter when provided', async () => {
      const qb = mockQb();
      videoRepo.createQueryBuilder.mockReturnValue(qb as any);

      await service.getByAnimeId(6, { episode: 5 });

      expect(qb.andWhere).toHaveBeenCalledWith('video.episode = :episode', {
        episode: 5,
      });
    });

    it('adds kind filter when provided', async () => {
      const qb = mockQb();
      videoRepo.createQueryBuilder.mockReturnValue(qb as any);

      await service.getByAnimeId(6, { kind: KindEnum.DUBBING });

      expect(qb.andWhere).toHaveBeenCalledWith('video.kind = :kind', {
        kind: KindEnum.DUBBING,
      });
    });

    it('adds lang filter when provided', async () => {
      const qb = mockQb();
      videoRepo.createQueryBuilder.mockReturnValue(qb as any);

      await service.getByAnimeId(6, { lang: 'ru' });

      expect(qb.andWhere).toHaveBeenCalledWith('video.language = :lang', {
        lang: 'ru',
      });
    });

    it('adds quality filter when provided', async () => {
      const qb = mockQb();
      videoRepo.createQueryBuilder.mockReturnValue(qb as any);

      await service.getByAnimeId(6, { quality: QualityEnum.BD });

      expect(qb.andWhere).toHaveBeenCalledWith('video.quality = :quality', {
        quality: QualityEnum.BD,
      });
    });

    it('adds author ILIKE when provided', async () => {
      const qb = mockQb();
      videoRepo.createQueryBuilder.mockReturnValue(qb as any);

      await service.getByAnimeId(6, { author: 'Ancord' });

      expect(qb.andWhere).toHaveBeenCalledWith('video.author ILIKE :author', {
        author: '%Ancord%',
      });
    });

    it('adds uploader filter when provided', async () => {
      const qb = mockQb();
      videoRepo.createQueryBuilder.mockReturnValue(qb as any);

      await service.getByAnimeId(6, { uploader: '12345' });

      expect(qb.andWhere).toHaveBeenCalledWith('video.uploader = :uploader', {
        uploader: '12345',
      });
    });

    it('applies offset and limit', async () => {
      const qb = mockQb();
      videoRepo.createQueryBuilder.mockReturnValue(qb as any);

      await service.getByAnimeId(6, { offset: 10, limit: 25 });

      expect(qb.skip).toHaveBeenCalledWith(10);
      expect(qb.take).toHaveBeenCalledWith(25);
    });

    it('uses default offset and limit when not provided', async () => {
      const qb = mockQb();
      videoRepo.createQueryBuilder.mockReturnValue(qb as any);

      await service.getByAnimeId(6, {});

      expect(qb.skip).toHaveBeenCalledWith(0);
      expect(qb.take).toHaveBeenCalledWith(50);
    });
  });
});
