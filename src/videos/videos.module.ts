import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { VideosController } from './videos.controller';
import { VideosService } from './videos.service';
import { VideoEntity } from '../entities';
import { AuthModule } from '../auth/auth.module';

@Module({
    imports: [
        AuthModule,
        TypeOrmModule.forFeature([VideoEntity]),
    ],
    controllers: [VideosController],
    providers: [VideosService],
    exports: [VideosService],
})
export class VideosModule {}
