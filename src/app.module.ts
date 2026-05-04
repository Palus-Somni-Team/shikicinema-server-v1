import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { entities } from './entities';
import { VideosModule } from './videos/videos.module';
import { StatusModule } from './status/status.module';

@Module({
    imports: [
        ConfigModule.forRoot(),
        TypeOrmModule.forRootAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: (config: ConfigService) => ({
                type: 'postgres',
                host: config.get<string>('DB_HOST'),
                port: config.get<number>('DB_PORT'),
                username: config.get<string>('DB_USER'),
                password: config.get<string>('DB_PASSWORD'),
                database: config.get<string>('DB_NAME'),
                synchronize: false,
                entities,
            }),
        }),
        VideosModule,
        StatusModule,
    ],
})
export class AppModule {}
