import { ClassSerializerInterceptor, ValidationPipe } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

import { EntityNotFoundFilter, UnhandledExceptionsFilter } from './common/filters';
import { AlertService } from './common/services/alert';

export async function addGlobal(app: NestExpressApplication) {
    const swaggerTitle = 'Shikicinema API v1';
    const alertService = app.get(AlertService);

    app.set('query parser', 'extended');

    app.useBodyParser('json', { limit: '1mb' });

    app.getHttpAdapter()
        .getInstance()
        .set('trust proxy', 1);

    app.enableCors({
        origin: '*',
        methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization'],
    });

    app.useGlobalFilters(
        new UnhandledExceptionsFilter(alertService),
        new EntityNotFoundFilter(),
    );

    app.useGlobalPipes(new ValidationPipe({ transform: true }));
    app.useGlobalInterceptors(
        new ClassSerializerInterceptor(app.get(Reflector), {
            excludeExtraneousValues: true,
        }),
    );

    const config = new DocumentBuilder()
        .setTitle(swaggerTitle)
        .setVersion('1.0.0')
        .setContact('Developer', 'https://smarthard.net#contacts', 'th3smartchan@gmail.com')
        .setLicense('Mozilla Public License Version 2.0', 'https://www.mozilla.org/en-US/MPL/2.0/')
        .addServer('https://smarthard.net/v1/api/', 'Production server')
        .addServer('https://dev.smarthard.net/v1/api/', 'Development server')
        .addBearerAuth()
        .build();

    const document = SwaggerModule.createDocument(app, config);

    SwaggerModule.setup('docs', app, document, {
        customSiteTitle: swaggerTitle,
    });
}
