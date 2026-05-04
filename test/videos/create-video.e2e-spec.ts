import request from 'supertest';
import { Test } from '@nestjs/testing';
import { Server } from 'http';
import { HttpException, INestApplication, UnauthorizedException } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';

import { VideosService, VideosModule } from '../../src/videos';
import { KindEnum, QualityEnum } from '../../src/videos/dto';
import { addGlobal } from '../../src/add-global';
import { UploadTokenGuard } from '../../src/common/guards/upload-token.guard';
import { AccessTokenEntity, UserEntity, VideoEntity } from '../../src/entities';

describe('POST /shikivideos', () => {
    const animeId = 123;
    const episode = 33;
    const kind = KindEnum.DUBBING;
    const language = 'ru';
    const url = 'http://example.com/video';
    const quality = QualityEnum.BD;
    const author = 'AniDub';
    const animeEnglish = 'Test Anime';
    const animeRussian = 'Тестовое Аниме';
    const uploaderId = '12345';

    let app: INestApplication;
    let http: Server;
    let service: VideosService;

    beforeEach(async () => {
        const moduleFixture = await Test.createTestingModule({
            imports: [VideosModule],
        })
            .overrideProvider(getRepositoryToken(AccessTokenEntity))
            .useValue({ findOne: jest.fn() })
            .overrideProvider(getRepositoryToken(UserEntity))
            .useValue({ findOne: jest.fn() })
            .overrideProvider(getRepositoryToken(VideoEntity))
            .useValue({ findOne: jest.fn() })
            .overrideGuard(UploadTokenGuard)
            .useValue({
                canActivate: (context: any) => {
                    const req = context.switchToHttp().getRequest();

                    if (!req.headers.authorization) {
                        throw new UnauthorizedException();
                    }

                    req.uploader = uploaderId;
                    return true;
                }
            })
            .overrideProvider(VideosService)
            .useValue({
                createVideo: jest.fn().mockResolvedValue({
                    id: 1,
                    url,
                    anime_id: animeId,
                    episode,
                    kind,
                    language,
                    quality,
                    author,
                    watches_count: 0,
                    uploader: uploaderId,
                    anime_english: animeEnglish,
                    anime_russian: animeRussian,
                }),
            })
            .compile();
        app = moduleFixture.createNestApplication();
        addGlobal(app);
        await app.init();

        http = (await app.getHttpServer()) as Server;
        service = moduleFixture.get(VideosService);
    });

    afterEach(async () => {
        await app.close();
    });

    it('returns 201 when creating a video', async () => {
        const spy = jest.spyOn(service, 'createVideo');

        const { statusCode } = await request(http)
            .post('/shikivideos')
            .set('Authorization', 'Bearer test-token')
            .query({
                anime_id: animeId,
                url,
                episode,
                kind,
                language,
            });

        expect(statusCode).toBe(201);
        expect(spy).toHaveBeenCalledWith(
            expect.objectContaining({
                animeId,
                url,
                episode,
                kind,
                language,
            }),
            uploaderId,
        );
    });

    it('Returns 400 when URL already exists', async () => {
        const spy = jest.spyOn(service, 'createVideo');
        spy.mockRejectedValueOnce(
            new HttpException('Record with this url already exists', 400),
        );

        const { statusCode, body } = await request(http)
            .post('/shikivideos')
            .set('Authorization', 'Bearer test-token')
            .query({
                anime_id: animeId,
                url,
                episode,
                kind,
                language,
            });

        expect(statusCode).toBe(400);
        expect(body).toEqual(
            expect.objectContaining({
                message: 'Record with this url already exists',
            }),
        );
    });

    it('Returns 400 when required fields are missing', async () => {
        const spy = jest.spyOn(service, 'createVideo');

        const { statusCode } = await request(http)
            .post('/shikivideos')
            .set('Authorization', 'Bearer test-token')
            .query({});

        expect(statusCode).toBe(400);
        expect(spy).not.toHaveBeenCalled();
    });

    it('Returns 400 when url is not a valid string', async () => {
        const spy = jest.spyOn(service, 'createVideo');

        const createVideoDto = {
            url: 123,
            animeId: 123,
            episode: 1,
            kind: KindEnum.DUBBING,
            language: 'ru',
        };

        const { statusCode } = await request(http)
            .post('/shikivideos')
            .set('Authorization', 'Bearer test-token')
            .query(createVideoDto);

        expect(statusCode).toBe(400);
        expect(spy).not.toHaveBeenCalled();
    });

    it('Returns 400 when anime_id is not a positive integer', async () => {
        const spy = jest.spyOn(service, 'createVideo');

        const createVideoDto = {
            url: 'http://example.com/video',
            animeId: -1,
            episode: 1,
            kind: KindEnum.DUBBING,
            language: 'ru',
        };

        const { statusCode } = await request(http)
            .post('/shikivideos')
            .set('Authorization', 'Bearer test-token')
            .query(createVideoDto);

        expect(statusCode).toBe(400);
        expect(spy).not.toHaveBeenCalled();
    });

    it('Returns 400 when episode is not a positive integer', async () => {
        const spy = jest.spyOn(service, 'createVideo');

        const createVideoDto = {
            url: 'http://example.com/video',
            animeId: 123,
            episode: -1,
            kind: KindEnum.DUBBING,
            language: 'ru',
        };

        const { statusCode } = await request(http)
            .post('/shikivideos')
            .set('Authorization', 'Bearer test-token')
            .query(createVideoDto);

        expect(statusCode).toBe(400);
        expect(spy).not.toHaveBeenCalled();
    });

    it('Returns 400 when kind is not a valid value', async () => {
        const spy = jest.spyOn(service, 'createVideo');

        const createVideoDto = {
            url: 'http://example.com/video',
            animeId: 123,
            episode: 1,
            kind: 'invalid',
            language: 'ru',
        };

        const { statusCode } = await request(http)
            .post('/shikivideos')
            .set('Authorization', 'Bearer test-token')
            .query(createVideoDto);

        expect(statusCode).toBe(400);
        expect(spy).not.toHaveBeenCalled();
    });

    it('Returns 400 when language is not a valid string', async () => {
        const spy = jest.spyOn(service, 'createVideo');

        const createVideoDto = {
            url: 'http://example.com/video',
            animeId: 123,
            episode: 1,
            kind: KindEnum.DUBBING,
            language: 123,
        };

        const { statusCode } = await request(http)
            .post('/shikivideos')
            .set('Authorization', 'Bearer test-token')
            .query(createVideoDto);

        expect(statusCode).toBe(400);
        expect(spy).not.toHaveBeenCalled();
    });

    it('Optional fields are passed to service', async () => {
        const spy = jest.spyOn(service, 'createVideo');

        const { statusCode } = await request(http)
            .post('/shikivideos')
            .set('Authorization', 'Bearer test-token')
            .query({
                anime_id: animeId,
                url,
                episode,
                kind,
                language,
                author,
                quality,
                anime_english: animeEnglish,
                anime_russian: animeRussian,
            });

        expect(statusCode).toBe(201);
        expect(spy).toHaveBeenCalledWith({
            animeId,
            url,
            episode,
            kind,
            language,
            author,
            quality,
            animeEnglish,
            animeRussian,
        }, uploaderId);
    });

    it('returns 401 when no token provided', async () => {
        const spy = jest.spyOn(service, 'createVideo');

        const { statusCode } = await request(http)
            .post('/shikivideos')
            .query({ url, anime_id: animeId, episode, kind, language });

        expect(statusCode).toBe(401);
        expect(spy).not.toHaveBeenCalled();
    });
});
