import request from 'supertest';
import { Test } from '@nestjs/testing';
import { Server } from 'http';
import { INestApplication } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';

import { VideosService, VideosModule } from '../../src/videos';
import { addGlobal } from '../../src/add-global';
import { VideoEntity } from '../../src/entities';

describe('GET /shikivideos/:anime_id/length', () => {
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
        getAnimeLength: jest.fn().mockResolvedValue(-1),
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

  it('returns 200 OK and correct body for valid anime_id', async () => {
    const animeId = 6;
    const length = 12;
    const spy = jest
      .spyOn(service, 'getAnimeLength')
      .mockResolvedValueOnce(length);

    const { statusCode, body } = await request(http).get(
      `/shikivideos/${animeId}/length`,
    );

    expect(spy).toHaveBeenCalledTimes(1);
    expect(spy).toHaveBeenCalledWith(animeId);
    expect(statusCode).toBe(200);
    expect(body).toEqual({ length });
  });

  it('returns 400 for non-integer anime_id', async () => {
    const invalidAnimeId = 'abcd';
    const spy = jest.spyOn(service, 'getAnimeLength');
    const { statusCode, body } = await request(http).get(
      `/shikivideos/${invalidAnimeId}/length`,
    );

    expect(spy).not.toHaveBeenCalled();
    expect(statusCode).toBe(400);
    expect(body).toEqual({
      message: [
        'animeId must be a positive number',
        'animeId must be an integer number',
        'animeId must be a number conforming to the specified constraints',
      ],
      error: 'Bad Request',
      statusCode: 400,
    });
  });
});
