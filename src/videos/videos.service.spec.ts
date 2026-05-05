import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ILike, QueryFailedError, Repository } from 'typeorm';
import { mock } from 'jest-mock-extended';

import { VideosService } from './videos.service';
import { VideoEntity } from '../entities';
import { KindEnum, QualityEnum } from './dto';
import { DuplicateUrlException } from '../domain';

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
        it('filters by animeId only when no params', async () => {
            videoRepo.find.mockResolvedValue([]);

            await service.getByAnimeId(6, {});

            expect(videoRepo.find).toHaveBeenCalledWith({
                where: { animeId: 6 },
                order: { episode: 'ASC' },
                skip: 0,
                take: 50,
            });
        });

        it('adds episode filter', async () => {
            videoRepo.find.mockResolvedValue([]);

            await service.getByAnimeId(6, { episode: 5, offset: 0, limit: 50 });

            expect(videoRepo.find).toHaveBeenCalledWith(
                expect.objectContaining({
                    where: expect.objectContaining({ animeId: 6, episode: 5 }),
                }),
            );
        });

        it('adds kind filter', async () => {
            videoRepo.find.mockResolvedValue([]);

            await service.getByAnimeId(6, {
                kind: KindEnum.DUBBING,
                offset: 0,
                limit: 50,
            });

            expect(videoRepo.find).toHaveBeenCalledWith(
                expect.objectContaining({
                    where: expect.objectContaining({ kind: KindEnum.DUBBING }),
                }),
            );
        });

        it('adds lang filter', async () => {
            videoRepo.find.mockResolvedValue([]);

            await service.getByAnimeId(6, { lang: 'ru', offset: 0, limit: 50 });

            expect(videoRepo.find).toHaveBeenCalledWith(
                expect.objectContaining({
                    where: expect.objectContaining({ language: 'ru' }),
                }),
            );
        });

        it('adds quality filter', async () => {
            videoRepo.find.mockResolvedValue([]);

            await service.getByAnimeId(6, {
                quality: QualityEnum.BD,
                offset: 0,
                limit: 50,
            });

            expect(videoRepo.find).toHaveBeenCalledWith(
                expect.objectContaining({
                    where: expect.objectContaining({ quality: QualityEnum.BD }),
                }),
            );
        });

        it('adds author with ILike', async () => {
            const author = 'Ancord';
            videoRepo.find.mockResolvedValue([]);

            await service.getByAnimeId(6, { author, offset: 0, limit: 50 });

            expect(videoRepo.find).toHaveBeenCalledWith(
                expect.objectContaining({
                    where: {
                        animeId: 6,
                        author: ILike(`%${author}%`),
                    },
                }),
            );
        });

        it('adds uploader filter', async () => {
            videoRepo.find.mockResolvedValue([]);

            await service.getByAnimeId(6, {
                uploader: '12345',
                offset: 0,
                limit: 50,
            });

            expect(videoRepo.find).toHaveBeenCalledWith(
                expect.objectContaining({
                    where: expect.objectContaining({ uploader: '12345' }),
                }),
            );
        });

        it('applies offset and limit', async () => {
            videoRepo.find.mockResolvedValue([]);

            await service.getByAnimeId(6, { offset: 10, limit: 25 });

            expect(videoRepo.find).toHaveBeenCalledWith(
                expect.objectContaining({
                    skip: 10,
                    take: 25,
                }),
            );
        });

        it('uses defaults when offset and limit not provided', async () => {
            videoRepo.find.mockResolvedValue([]);

            await service.getByAnimeId(6, {});

            expect(videoRepo.find).toHaveBeenCalledWith(
                expect.objectContaining({
                    skip: 0,
                    take: 50,
                }),
            );
        });
    });

    describe('search', () => {
        const mockQb = () => ({
            where: jest.fn().mockReturnThis(),
            andWhere: jest.fn().mockReturnThis(),
            skip: jest.fn().mockReturnThis(),
            take: jest.fn().mockReturnThis(),
            orderBy: jest.fn().mockReturnThis(),
            getMany: jest.fn().mockResolvedValue([]),
        });

        it('searches by title in english and russian', async () => {
            const qb = mockQb();
            videoRepo.createQueryBuilder.mockReturnValue(qb as any);

            const title = 'Trigun';

            await service.search({ title, offset: 0, limit: 50 });

            expect(qb.where).toHaveBeenCalledWith(
                '(video.anime_english ILIKE :title OR video.anime_russian ILIKE :title)',
                { title: `%${title}%` },
            );
        });

        it('applies filters same as getByAnimeId', async () => {
            const qb = mockQb();
            videoRepo.createQueryBuilder.mockReturnValue(qb as any);

            await service.search({
                episode: 5,
                kind: KindEnum.DUBBING,
                lang: 'ru',
                quality: QualityEnum.BD,
                author: 'Ancord',
                uploader: '12345',
                offset: 10,
                limit: 25,
            });

            expect(qb.andWhere).toHaveBeenCalledWith('video.episode = :episode', {
                episode: 5,
            });

            expect(qb.andWhere).toHaveBeenCalledWith('video.kind = :kind', {
                kind: KindEnum.DUBBING,
            });

            expect(qb.andWhere).toHaveBeenCalledWith('video.language = :lang', {
                lang: 'ru',
            });

            expect(qb.andWhere).toHaveBeenCalledWith('video.quality = :quality', {
                quality: QualityEnum.BD,
            });

            expect(qb.andWhere).toHaveBeenCalledWith('video.author ILIKE :author', {
                author: '%Ancord%',
            });

            expect(qb.andWhere).toHaveBeenCalledWith('video.uploader = :uploader', {
                uploader: '12345',
            });

            expect(qb.skip).toHaveBeenCalledWith(10);
            expect(qb.take).toHaveBeenCalledWith(25);
        });
    });

    describe('createVideo', () => {
        it('maps CreateVideoDto to entity and saves', async () => {
            videoRepo.save.mockResolvedValue({});

            await service.createVideo({
                url: 'https://example.com/video',
                animeId: 123,
                episode: 1,
                kind: KindEnum.DUBBING,
                language: 'ru',
                animeEnglish: 'Trigun',
                animeRussian: 'Триган',
            }, '278015');

            expect(videoRepo.save).toHaveBeenCalledWith({
                url: 'https://example.com/video',
                animeId: 123,
                episode: 1,
                kind: 'озвучка',
                language: 'ru',
                quality: QualityEnum.UNKNOWN,
                author: null,
                uploader: '278015',
                watchesCount: 0,
                animeEnglish: 'Trigun',
                animeRussian: 'Триган',
            });
        });

        it('maps optional fields when provided', async () => {
            videoRepo.save.mockResolvedValue({});

            await service.createVideo({
                url: 'https://example.com/video',
                animeId: 123,
                episode: 1,
                kind: KindEnum.DUBBING,
                language: 'ru',
                author: 'Ancord',
                quality: QualityEnum.BD,
            }, '278015');

            expect(videoRepo.save).toHaveBeenCalledWith(
                expect.objectContaining({
                    author: 'Ancord',
                    quality: QualityEnum.BD,
                    uploader: '278015',
                }),
            );
        });

        it('throws DuplicateUrlException on duplicate URL', async () => {
            const queryFailedError = new QueryFailedError(
                'INSERT INTO ...',
                [],
                new Error(),
            );
            (queryFailedError as any).driverError = { code: '23505' };

            videoRepo.save.mockRejectedValue(queryFailedError);

            await expect(
                service.createVideo({
                    url: 'https://example.com/video',
                    animeId: 123,
                    episode: 1,
                    kind: KindEnum.DUBBING,
                    language: 'ru',
                }, '278015'),
            ).rejects.toThrow(DuplicateUrlException);
        });
    });

    describe('getContributions', () => {
        const mockCount = 5;

        it('counts by uploader', async () => {
            videoRepo.count.mockResolvedValue(mockCount);

            const result = await service.getContributions({ uploader: '12345' });

            expect(result).toBe(mockCount);
            expect(videoRepo.count).toHaveBeenCalledWith({ where: { uploader: '12345' } });
        });

        it('counts all without uploader', async () => {
            videoRepo.count.mockResolvedValue(mockCount);

            const result = await service.getContributions({});

            expect(result).toBe(mockCount);
            expect(videoRepo.count).toHaveBeenCalledWith({ where: {} });
        });
    });
});
