import { Module, MiddlewareConsumer, NestModule } from '@nestjs/common';

import { HttpLoggerMiddleware } from './http-logger.middleware';
import { DatabaseLogger } from './database-logger';


@Module({
    providers: [DatabaseLogger],
    exports: [DatabaseLogger],
})
export class LoggerModule implements NestModule {
    configure(consumer: MiddlewareConsumer) {
        consumer.apply(HttpLoggerMiddleware).forRoutes('*');
    }
}
