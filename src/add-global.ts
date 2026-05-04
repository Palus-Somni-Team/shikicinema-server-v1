import {
    ClassSerializerInterceptor,
    INestApplication,
    ValidationPipe,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';

export function addGlobal(app: INestApplication<any>) {
    app.useGlobalPipes(new ValidationPipe({ transform: true }));
    app.useGlobalInterceptors(
        new ClassSerializerInterceptor(app.get(Reflector), {
            excludeExtraneousValues: true,
        }),
    );
}
