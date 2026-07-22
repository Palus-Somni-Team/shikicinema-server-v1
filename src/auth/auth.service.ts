import { HttpService } from '@nestjs/axios';
import {
    BadRequestException,
    Injectable,
    InternalServerErrorException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';

import { UploadTokenEntity } from '../entities';
import { AlertService } from '../common/services/alert';
import { UploaderService } from '../uploader/uploader.service';

@Injectable()
export class AuthService {
    private readonly shikimoriUrl: string;

    constructor(
        private readonly alert: AlertService,
        private readonly config: ConfigService,
        private readonly http: HttpService,
        private readonly uploaderService: UploaderService,
    ) {
        this.shikimoriUrl = this.config.getOrThrow('SHIKIMORI_API');
    }

    async getShikimoriUser(token: string): Promise<any> {
        try {
            const { data: user } = await firstValueFrom(
                this.http.get(`${this.shikimoriUrl}/api/users/whoami`, {
                    headers: { Authorization: `Bearer ${token}` },
                }),
            );

            return user;
        } catch (error) {
            this.alert.error('Auth', 'Failed to verify user', error);

            throw new InternalServerErrorException('Failed to verify user');
        }
    }

    async createUploadToken(shikimoriAccessToken: string): Promise<UploadTokenEntity> {
        let shikimoriUser: { id: number };

        try {
            shikimoriUser = await this.getShikimoriUser(shikimoriAccessToken);
        } catch {
            throw new BadRequestException('Your Shikimori access token is expired or invalid');
        }

        try {
            const uploader = await this.uploaderService.getUploader(shikimoriUser.id);
            const uploadToken = await this.uploaderService.issueNewToken(uploader);

            return uploadToken;
        } catch (error) {
            this.alert.error('Auth', 'Failed to issue upload token', error);

            throw new InternalServerErrorException('Failed to issue upload token');
        }
    }
}
