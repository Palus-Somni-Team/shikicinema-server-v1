import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AccessTokenEntity } from '../entities/access-token.entity';
import { UserEntity } from '../entities/user.entity';
import { UploadTokenGuard } from '../common/guards/upload-token.guard';

@Module({
    imports: [TypeOrmModule.forFeature([AccessTokenEntity, UserEntity])],
    providers: [UploadTokenGuard],
    exports: [UploadTokenGuard, TypeOrmModule],
})
export class AuthModule {}