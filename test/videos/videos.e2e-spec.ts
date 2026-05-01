import * as request from 'supertest';
import { createTestApp, closeTestApp } from '../helpers/setup';

describe('GET /shikivideos/:anime_id/length', () => {
  beforeAll(async () => {
    await createTestApp();
  });

  afterAll(async () => {
    await closeTestApp();
  });

  it('returns { length: 12 } for valid anime_id', async () => {
    const { statusCode, body } = await request(app.getHttpServer()).get(
      '/shikivideos/6/length',
    );

    expect(statusCode).toBe(200);
    expect(body).toEqual({ length: 12 });
  });

  it('returns 400 for non-integer anime_id', async () => {
    const { statusCode } = await request(app.getHttpServer()).get(
      '/shikivideos/abc/length',
    );

    expect(statusCode).toBe(400);
  });

  it('returns { length: 0 } for anime with no videos', async () => {
    const { statusCode, body } = await request(app.getHttpServer()).get(
      '/shikivideos/99999/length',
    );

    expect(statusCode).toBe(200);
    expect(body).toEqual({ length: 0 });
  });
});
