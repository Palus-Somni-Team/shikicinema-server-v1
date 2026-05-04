import {
    ClassSerializerInterceptor,
    INestApplication,
    ValidationPipe,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { readFile } from 'fs/promises';
import yaml from 'yaml';
import swagger from 'swagger-ui-express';

export async function addGlobal(app: INestApplication<any>) {
    const openapiFile = await readFile('openapi.yaml', { encoding: 'utf-8' });
    const openapi = yaml.parse(openapiFile);

    app.useGlobalPipes(new ValidationPipe({ transform: true }));
    app.useGlobalInterceptors(
        new ClassSerializerInterceptor(app.get(Reflector), {
            excludeExtraneousValues: true,
        }),
    );

    app.use('/docs', swagger.serve, swagger.setup(openapi, { customSiteTitle: 'Shikicinema API v1' }));
}
