import request from 'supertest';
import { Test } from '@nestjs/testing';
import { Server } from 'http';
import { INestApplication } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';

import { VideosService, VideosModule } from '../../src/videos';
import { addGlobal } from '../../src/add-global';
import { AccessTokenEntity, UserEntity, VideoEntity } from '../../src/entities';

describe('GET /shikivideos/authors', () => {
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
                getAuthors: jest.fn().mockResolvedValue([]),
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
        const spy = jest.spyOn(service, 'getAuthors');
        const { statusCode } = await request(http).get('/shikivideos/authors');

        expect(statusCode).toBe(200);
        expect(spy).toHaveBeenCalled();
    });

    it('All params passed to service', async () => {
        const spy = jest.spyOn(service, 'getAuthors');
        const name = 'abc';
        const animeId = 10;
        const limit = 77;
        const offset = 31;

        await request(http).get(
            `/shikivideos/authors?name=${name}&anime_id=${animeId}&offset=${offset}&limit=${limit}`,
        );

        expect(spy).toHaveBeenCalledWith({ name, animeId, offset, limit });
    });

    it('Uses defaults when optional params omitted', async () => {
        const spy = jest.spyOn(service, 'getAuthors');

        await request(http).get('/shikivideos/authors');

        expect(spy).toHaveBeenCalledWith(
            expect.objectContaining({
                offset: expect.any(Number),
                limit: expect.any(Number),
            }),
        );
    });

    it('Returns 400 when limit exceeds maximum', async () => {
        const spy = jest.spyOn(service, 'getAuthors');

        const { statusCode } = await request(http).get(
            '/shikivideos/authors?limit=2000',
        );

        expect(statusCode).toBe(400);
        expect(spy).not.toHaveBeenCalled();
    });

    it('Returns 400 when limit is 0', async () => {
        const spy = jest.spyOn(service, 'getAuthors');

        const { statusCode } = await request(http).get(
            '/shikivideos/authors?limit=0',
        );

        expect(statusCode).toBe(400);
        expect(spy).not.toHaveBeenCalled();
    });

    it('Returns 400 when anime_id is 0', async () => {
        const spy = jest.spyOn(service, 'getAuthors');

        const { statusCode } = await request(http).get(
            '/shikivideos/authors?anime_id=0',
        );

        expect(statusCode).toBe(400);
        expect(spy).not.toHaveBeenCalled();
    });

    it('Returns 400 when anime_id is negative', async () => {
        const spy = jest.spyOn(service, 'getAuthors');

        const { statusCode } = await request(http).get(
            '/shikivideos/authors?anime_id=-1',
        );

        expect(statusCode).toBe(400);
        expect(spy).not.toHaveBeenCalled();
    });

    it('Returns 400 when name is empty', async () => {
        const spy = jest.spyOn(service, 'getAuthors');

        const { statusCode } = await request(http).get(
            '/shikivideos/authors?name=',
        );

        expect(statusCode).toBe(400);
        expect(spy).not.toHaveBeenCalled();
    });
});
