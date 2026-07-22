import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';

import { AccessTokenEntity } from '../entities/access-token.entity';
import { UserEntity } from '../entities/user.entity';
import { UploadTokenGuard } from '../common/guards/upload-token.guard';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UploaderModule } from '../uploader/uploader.module';
import { UploadTokenEntity } from '../entities';

@Module({
    imports: [
        ConfigModule,
        HttpModule,
        UploaderModule,
        TypeOrmModule.forFeature([AccessTokenEntity, UploadTokenEntity, UserEntity])
    ],
    providers: [
        UploadTokenGuard,
        AuthService,
    ],
    exports: [
        UploadTokenGuard,
        TypeOrmModule,
    ],
    controllers: [AuthController],
})
export class AuthModule {}