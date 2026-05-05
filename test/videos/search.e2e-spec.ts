import request from 'supertest';
import { Test } from '@nestjs/testing';
import { Server } from 'http';
import { INestApplication } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';

import { VideosService, VideosModule } from '../../src/videos';
import { KindEnum, QualityEnum } from '../../src/videos/dto';
import { addGlobal } from '../../src/add-global';
import { AccessTokenEntity, UserEntity, VideoEntity } from '../../src/entities';

describe('GET /shikivideos/search', () => {
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
            .useValue({})
            .overrideProvider(VideosService)
            .useValue({
                search: jest.fn().mockResolvedValue([]),
            })
            .compile();
        app = moduleFixture.createNestApplication();
        await addGlobal(app);
        await app.init();

        http = (await app.getHttpServer()) as Server;
        service = moduleFixture.get(VideosService);
    });

    afterEach(async () => {
        await app.close();
    });

    it('Route exists and returns 200 without any params', async () => {
        const spy = jest.spyOn(service, 'search');
        const { statusCode } = await request(http).get('/shikivideos/search');

        expect(statusCode).toBe(200);
        expect(spy).toHaveBeenCalled();
    });

    it('All params passed to service', async () => {
        const spy = jest.spyOn(service, 'search');
        const title = 'Some Anime Title';
        const episode = 5;
        const kind = KindEnum.DUBBING;
        const lang = 'ru';
        const quality = QualityEnum.BD;
        const author = 'AniDub';
        const uploader = '12345';
        const offset = 10;
        const limit = 25;

        const { statusCode } = await request(http).get(
            `/shikivideos/search?title=${title}&episode=${episode}&kind=${kind}&lang=${lang}&quality=${quality}&author=${author}&uploader=${uploader}&offset=${offset}&limit=${limit}`,
        );

        expect(statusCode).toBe(200);
        expect(spy).toHaveBeenCalledWith({
            title,
            episode,
            kind,
            lang,
            quality,
            author,
            uploader,
            offset,
            limit,
        });
    });

    it('Uses defaults when optional params omitted', async () => {
        const spy = jest.spyOn(service, 'search');

        const { statusCode } = await request(http).get('/shikivideos/search');

        expect(statusCode).toBe(200);
        expect(spy).toHaveBeenCalledWith(
            expect.objectContaining({
                offset: expect.any(Number),
                limit: expect.any(Number),
            }),
        );
    });

    it('accepts limit=all', async () => {
        const spy = jest.spyOn(service, 'search');

        const { statusCode } = await request(http).get(
            '/shikivideos/search?limit=all',
        );

        expect(statusCode).toBe(200);
        expect(spy).toHaveBeenCalledWith(expect.objectContaining({ limit: Infinity }));
    });

    it('Returns 400 when limit is 0', async () => {
        const spy = jest.spyOn(service, 'search');

        const { statusCode } = await request(http).get(
            '/shikivideos/search?limit=0',
        );

        expect(statusCode).toBe(400);
        expect(spy).not.toHaveBeenCalled();
    });

    it('Returns 400 when episode is 0', async () => {
        const spy = jest.spyOn(service, 'search');

        const { statusCode } = await request(http).get(
            '/shikivideos/search?episode=0',
        );

        expect(statusCode).toBe(400);
        expect(spy).not.toHaveBeenCalled();
    });

    it('Returns 400 when episode is negative', async () => {
        const spy = jest.spyOn(service, 'search');

        const { statusCode } = await request(http).get(
            '/shikivideos/search?episode=-1',
        );

        expect(statusCode).toBe(400);
        expect(spy).not.toHaveBeenCalled();
    });

    it('returns 400 for invalid kind', async () => {
        const spy = jest.spyOn(service, 'search');
        const { statusCode } = await request(http).get(
            '/shikivideos/search?kind=invalid',
        );

        expect(statusCode).toBe(400);
        expect(spy).not.toHaveBeenCalled();
    });

    it('returns 400 for invalid quality', async () => {
        const spy = jest.spyOn(service, 'search');
        const { statusCode } = await request(http).get(
            '/shikivideos/search?quality=invalid',
        );

        expect(statusCode).toBe(400);
        expect(spy).not.toHaveBeenCalled();
    });
});
