import {
    Injectable,
    CanActivate,
    ExecutionContext,
    UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MoreThan, Repository } from 'typeorm';
import { isUUID } from 'class-validator';

import { AccessTokenEntity } from '../../entities/access-token.entity';
import { UserEntity } from '../../entities/user.entity';
import { UploadTokenEntity } from '../../entities';

@Injectable()
export class UploadTokenGuard implements CanActivate {
    constructor(
        @InjectRepository(AccessTokenEntity)
        private readonly oldTokenRepo: Repository<AccessTokenEntity>,

        @InjectRepository(UserEntity)
        private readonly userRepo: Repository<UserEntity>,

        @InjectRepository(UploadTokenEntity)
        private readonly uploadTokenRepo: Repository<UploadTokenEntity>,
    ) {}

    private extractToken(header: string): string {
        const [type, token] = header.split(/\s+/);
        if (type !== 'Bearer' || !token) {
            throw new UnauthorizedException();
        }
        return token;
    }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const req = context.switchToHttp().getRequest();
        const header = req.headers.authorization;

        if (!header?.startsWith('Bearer')) {
            throw new UnauthorizedException();
        }

        const token = this.extractToken(header);

        if (isUUID(token)) {
            const uploadToken = await this.uploadTokenRepo.findOne({
                where: { token, revoked: false, expiredAt: MoreThan(new Date()) },
            });
    
            if (uploadToken) {
                req.uploader = uploadToken.uploader.shikimoriId;
    
                return true;
            }
        } else {
            // Удалить весь блок else, когда откажемся от старых токенов
            const oldToken = await this.oldTokenRepo.findOne({
                where: { token, expires: MoreThan(new Date()) },
            });

            if (!oldToken) {
                throw new UnauthorizedException();
            }

            const user = await this.userRepo.findOne({
                where: { id: Number(oldToken.userId) },
            });

            req.uploader = user?.shikimoriId ?? null;

            return Boolean(user?.shikimoriId);
        }

        throw new UnauthorizedException();
    }
}
