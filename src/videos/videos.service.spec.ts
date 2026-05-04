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
    it('returns max episode for given anime_id', async () => {
      const mockQueryBuilder: any = {
        select: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        getRawOne: jest.fn().mockResolvedValue({ max: '12' }),
      };
      videoRepo.createQueryBuilder.mockReturnValue(mockQueryBuilder);

      const result = await service.getAnimeLength(6);

      expect(result).toBe(12);
      expect(videoRepo.createQueryBuilder).toHaveBeenCalledWith('video');
      expect(mockQueryBuilder.select).toHaveBeenCalledWith(
        'MAX(video.episode)',
        'max',
      );
      expect(mockQueryBuilder.where).toHaveBeenCalledWith(
        'video.anime_id = :animeId',
        { animeId: 6 },
      );
    });

    it('returns 0 when anime has no videos', async () => {
      const mockQueryBuilder: any = {
        select: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        getRawOne: jest.fn().mockResolvedValue({ max: null }),
      };
      videoRepo.createQueryBuilder.mockReturnValue(mockQueryBuilder);

      const result = await service.getAnimeLength(99999);

      expect(result).toBe(0);
    });
  });
});
