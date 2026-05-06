import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { entities } from './entities';
import { VideosModule } from './videos/videos.module';
import { StatusModule } from './status/status.module';
import { AuthModule } from './auth/auth.module';
import { DatabaseLogger, LoggerModule } from './common/logger';

@Module({
    imports: [
        ConfigModule.forRoot(),
        TypeOrmModule.forRootAsync({
            imports: [ConfigModule, LoggerModule],
            inject: [ConfigService, DatabaseLogger],
            useFactory: (config: ConfigService, logger: DatabaseLogger) => ({
                type: 'postgres',
                host: config.get<string>('DB_HOST'),
                port: config.get<number>('DB_PORT'),
                username: config.get<string>('DB_USER'),
                password: config.get<string>('DB_PASSWORD'),
                database: config.get<string>('DB_NAME'),
                synchronize: false,
                logging: 'all',
                logger,
                entities,
            }),
        }),
        VideosModule,
        StatusModule,
        AuthModule,
    ],
})
export class AppModule {}
