import request from 'supertest';
import { Test } from '@nestjs/testing';
import { Server } from 'http';
import { INestApplication } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';

import { VideosService, VideosModule } from '../../src/videos';
import { addGlobal } from '../../src/add-global';
import { VideoEntity } from '../../src/entities';

describe('GET /shikivideos/{animeId}', () => {
  let app: INestApplication;
  let http: Server;
  let service: VideosService;

  beforeEach(async () => {
    const moduleFixture = await Test.createTestingModule({
      imports: [VideosModule],
    })
      .overrideProvider(getRepositoryToken(VideoEntity))
      .useValue({})
      .overrideProvider(VideosService)
      .useValue({
        getByAnimeId: jest.fn().mockResolvedValue([]),
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

  it('Returns 200 and uses default offset/limit when no params', async () => {
    const spy = jest.spyOn(service, 'getByAnimeId');
    const animeId = 123;
    const { statusCode } = await request(http).get(`/shikivideos/${animeId}`);

    expect(statusCode).toBe(200);
    expect(spy).toHaveBeenCalledWith(
      animeId,
      expect.objectContaining({
        offset: expect.any(Number),
        limit: expect.any(Number),
      }),
    );
  });

  it('Returns 400 when animeId is not a positive integer', async () => {
    const spy = jest.spyOn(service, 'getByAnimeId');

    const { statusCode } = await request(http).get('/shikivideos/0');

    expect(statusCode).toBe(400);
    expect(spy).not.toHaveBeenCalled();
  });

  it('Returns 400 when animeId is negative', async () => {
    const spy = jest.spyOn(service, 'getByAnimeId');

    const { statusCode } = await request(http).get('/shikivideos/-1');

    expect(statusCode).toBe(400);
    expect(spy).not.toHaveBeenCalled();
  });

  it('Returns 400 when animeId is not a number', async () => {
    const spy = jest.spyOn(service, 'getByAnimeId');

    const { statusCode } = await request(http).get('/shikivideos/abc');

    expect(statusCode).toBe(400);
    expect(spy).not.toHaveBeenCalled();
  });

  it('All query params passed to service', async () => {
    const spy = jest.spyOn(service, 'getByAnimeId');
    const animeId = 123;
    const episode = 5;
    const kind = 'озвучка';
    const lang = 'ru';
    const quality = 'bd';
    const author = 'AniDub';
    const uploader = '12345';
    const offset = 10;
    const limit = 25;

    const { statusCode } = await request(http).get(
      `/shikivideos/${animeId}?episode=${episode}&kind=${kind}&lang=${lang}&quality=${quality}&author=${author}&uploader=${uploader}&offset=${offset}&limit=${limit}`,
    );

    expect(statusCode).toBe(200);
    expect(spy).toHaveBeenCalledWith(animeId, {
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
});
