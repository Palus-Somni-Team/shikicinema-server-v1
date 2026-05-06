import {
    ClassSerializerInterceptor,
    INestApplication,
    ValidationPipe,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import morgan from 'morgan';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

export async function addGlobal(app: INestApplication<any>) {
    const swaggerTitle = 'Shikicinema API v1';
    const isProduction = process.env.NODE_ENV === 'production';
    const isTest = process.env.NODE_ENV === 'test';

    app.getHttpAdapter()
        .getInstance()
        .set('trust proxy', 1);

    app.useGlobalPipes(new ValidationPipe({ transform: true }));
    app.useGlobalInterceptors(
        new ClassSerializerInterceptor(app.get(Reflector), {
            excludeExtraneousValues: true,
        }),
    );

    if (!isTest) {
        app.use(morgan(isProduction ? 'combined' : 'dev'));
    }

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
