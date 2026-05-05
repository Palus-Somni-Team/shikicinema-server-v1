import request from 'supertest';
import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NestApplication } from '@nestjs/core';
import { Server } from 'http';

import { VideosModule, VideosService } from '../../src/videos';
import { AccessTokenEntity, UserEntity, VideoEntity } from '../../src/entities';
import { addGlobal } from '../../src/add-global';


describe('GET /shikivideos/contributions', () => {
    let app: NestApplication;
    let http: Server;
    let service: VideosService;

    beforeEach(async () => {
        const moduleFixture = await Test.createTestingModule({
            imports: [VideosModule],
        })
            .overrideProvider(getRepositoryToken(AccessTokenEntity)).useValue({ findOne: jest.fn() })
            .overrideProvider(getRepositoryToken(UserEntity)).useValue({ findOne: jest.fn() })
            .overrideProvider(getRepositoryToken(VideoEntity)).useValue({})
            .overrideProvider(VideosService)
            .useValue({
                getContributions: jest.fn().mockResolvedValue(0),
            })
            .compile();
        app = moduleFixture.createNestApplication();
        await addGlobal(app);
        await app.init();
        http = (await app.getHttpServer()) as Server;
        service = moduleFixture.get(VideosService);
    });

    afterAll(async () => app.close());

    it('returns 200 and { count } by uploader', async () => {
        const count = 42;
        const spy = jest.spyOn(service, 'getContributions').mockResolvedValueOnce(count);

        const { statusCode, body } = await request(http).get('/shikivideos/contributions?uploader=12345');

        expect(statusCode).toBe(200);
        expect(body).toEqual({ count });
        expect(spy).toHaveBeenCalledWith({ uploader: '12345' });
    });

    it('returns 200 and { count } without query params', async () => {
        const { statusCode, body } = await request(http).get('/shikivideos/contributions');

        expect(statusCode).toBe(200);
        expect(body).toEqual({ count: expect.any(Number) });
    });
});