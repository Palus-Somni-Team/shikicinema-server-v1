import { HttpService } from '@nestjs/axios';
import {
    BadRequestException,
    Injectable,
    InternalServerErrorException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AxiosError } from 'axios';
import { firstValueFrom } from 'rxjs';

import { AlertService } from '../common/services/alert';
import { ShikimoriToken } from '../common/types';
import { ShikiAccessTokenDto } from './dto';

@Injectable()
export class OAuthService {
    private readonly shikimoriUrl: string;
    private readonly shikimoriClientId: string;
    private readonly shikimoriClientSecret: string;
    private readonly shikimoriRedirectUri: string;

    constructor(
        private readonly config: ConfigService,
        private readonly http: HttpService,
        private readonly alert: AlertService,
    ) {
        this.shikimoriUrl = this.config.getOrThrow('SHIKIMORI_API');
        this.shikimoriClientId = this.config.getOrThrow('SHIKIMORI_OAUTH_CLIENT_ID');
        this.shikimoriClientSecret = this.config.getOrThrow('SHIKIMORI_OAUTH_CLIENT_SECRET');
        this.shikimoriRedirectUri = this.config.getOrThrow('SHIKIMORI_OAUTH_REDIRECT_URI');
    }

    async exchangeShikimoriCode(code: string): Promise<ShikiAccessTokenDto> {
        try {
            const body = {
                grant_type: 'authorization_code',
                client_id: this.shikimoriClientId,
                client_secret: this.shikimoriClientSecret,
                code,
                redirect_uri: this.shikimoriRedirectUri,
            };

            const { data: token } = await firstValueFrom(
                this.http.post<ShikimoriToken>(`${this.shikimoriUrl}/oauth/token`, body),
            );

            return {
                type: token.token_type,
                token: token.access_token,
                refresh: token.refresh_token,
                expiresAt: new Date(token.created_at * 1000 + token.expires_in).toISOString(),
            };
        } catch (error) {
            if (error instanceof AxiosError && error.status === 400) {
                throw new BadRequestException(error.response?.data?.error_description);
            } else {
                this.alert.error('Shikimori OAuth', 'Failed to exchange tokens', error);
    
                throw new InternalServerErrorException('Failed to exchange tokens');
            }
        }
    }
}
