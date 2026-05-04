import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Server } from 'http';

import { AppModule } from '../../src/app.module';

export let app: INestApplication;
export let moduleFixture: TestingModule;

export async function createTestApp(): Promise<INestApplication<Server>> {
    moduleFixture = await Test.createTestingModule({
        imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ transform: true }));
    await app.init();

    return app;
}

export async function getHttpServer(): Promise<Server> {
    return (await createTestApp()).getHttpServer();
}

export async function closeTestApp(): Promise<void> {
    await app.close();
}
