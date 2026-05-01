import request from 'supertest';
import { Test } from '@nestjs/testing';
import { Server } from 'http';
import { INestApplication, ValidationPipe } from '@nestjs/common';

import { StatusModule, StatusService } from '../../src/status';
import { StatusEnum } from '../../src/status/types';
import { ResponseStatusDto } from '../../src/status/dto';

describe('GET /status', () => {
  let app: INestApplication;
  let http: Server;
  let service: StatusService;

  beforeEach(async () => {
    const moduleFixture = await Test.createTestingModule({
      imports: [StatusModule],
    })
      .overrideProvider(StatusService)
      .useValue({
        getStatus: jest.fn().mockResolvedValue({
          server: StatusEnum.OFFLINE,
          api: StatusEnum.OFFLINE,
        }),
        getUptime: jest.fn().mockResolvedValue({
          server: '38 days, 5 hours',
          api: '11 hours',
        }),
      })
      .compile();
    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ transform: true }));
    await app.init();

    http = (await app.getHttpServer()) as Server;
    service = moduleFixture.get(StatusService);
  });

  afterEach(async () => {
    await app.close();
  });

  it('/ returns 200 OK and current status (online)', async () => {
    const mockResponse = {
      server: StatusEnum.ONLINE,
      api: StatusEnum.ONLINE,
    } as ResponseStatusDto;

    const spy = jest
      .spyOn(service, 'getStatus')
      .mockResolvedValueOnce(mockResponse);

    const { statusCode, body } = await request(http).get(`/status`);

    expect(spy).toHaveBeenCalledTimes(1);
    expect(statusCode).toBe(200);
    expect(body).toEqual(mockResponse);
  });

  it('/uptime 200 OK and current uptime', async () => {
    const spy = jest.spyOn(service, 'getUptime');

    const { statusCode, body } = await request(http).get(`/status/uptime`);

    expect(spy).toHaveBeenCalledTimes(1);
    expect(statusCode).toBe(200);
    expect(body).toEqual({
      server: expect.any(String),
      api: expect.any(String),
    });
  });
});
