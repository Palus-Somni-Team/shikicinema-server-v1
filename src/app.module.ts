import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { CacheModule } from '@nestjs/cache-manager';
import { KeyvCacheableMemory } from 'cacheable';
import { Keyv } from 'keyv';

import { entities } from './entities';
import { VideosModule } from './videos/videos.module';
import { StatusModule } from './status/status.module';
import { AuthModule } from './auth/auth.module';
import { DatabaseLogger, LoggerModule } from './common/logger';
import { AnimesModule } from './animes/animes.module';
import { GenresModule } from './genres/genres.module';

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
        CacheModule.register({
            isGlobal: true,
            stores: [
                new Keyv({
                    store: new KeyvCacheableMemory({
                        ttl: 60 * 1000,
                        lruSize: 200,
                    }),
                }),
            ],
        }),
        VideosModule,
        StatusModule,
        AuthModule,
        AnimesModule,
        GenresModule,
    ],
})
export class AppModule {}
