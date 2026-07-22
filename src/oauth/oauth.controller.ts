import {
    Controller,
    Get,
    Query,
    Res,
} from '@nestjs/common';
import { ApiExcludeController } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import type { Response } from 'express';
import { v4 as uuid } from 'uuid';

import { OAuthService } from './oauth.service';

@Controller('oauth')
@ApiExcludeController()
export class OAuthController {
    private shikimoriUrl: string;
    private shikimoriClientId: string;
    private shikimoriRedirectUri: string;

    constructor(
        private readonly config: ConfigService,
        private readonly oauthService: OAuthService,
    ) {
        this.shikimoriUrl = this.config.getOrThrow('SHIKIMORI_API');
        this.shikimoriClientId = this.config.getOrThrow('SHIKIMORI_OAUTH_CLIENT_ID');
        this.shikimoriRedirectUri = this.config.getOrThrow('SHIKIMORI_OAUTH_REDIRECT_URI');
    }

    @Get('shikimori')
    redirectToShikimori(@Res() res: Response) {
        const state = uuid();
        const url = `${this.shikimoriUrl}/oauth/authorize?client_id=${this.shikimoriClientId}&redirect_uri=${this.shikimoriRedirectUri}&response_type=code&scope=user_rates+comments+topics&state=${state}`;

        res.redirect(url);
    }

    @Get('shikimori/callback')
    async shikimoriCallback(@Query('code') code: string) {
        const shikimoriToken = await this.oauthService.exchangeShikimoriCode(code);

        return shikimoriToken;
    }
}