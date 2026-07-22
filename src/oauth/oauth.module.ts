import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { OAuthService } from './oauth.service';
import { OAuthController } from './oauth.controller';
import { UploaderModule } from '../uploader/uploader.module';

@Module({
    imports: [
        HttpModule,
        UploaderModule,
        ConfigModule,
    ],
    controllers: [OAuthController],
    providers: [OAuthService],
})
export class OAuthModule {}
