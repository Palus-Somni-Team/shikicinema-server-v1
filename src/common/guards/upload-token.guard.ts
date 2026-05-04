import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MoreThan, Repository } from 'typeorm';

import { AccessTokenEntity } from '../../entities/access-token.entity';
import { UserEntity } from '../../entities/user.entity';

@Injectable()
export class UploadTokenGuard implements CanActivate {
    constructor(
        @InjectRepository(AccessTokenEntity)
        private readonly tokenRepo: Repository<AccessTokenEntity>,

        @InjectRepository(UserEntity)
        private readonly userRepo: Repository<UserEntity>,
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

        const accessToken = await this.tokenRepo.findOne({
            where: { token, expires: MoreThan(new Date()) },
        });

        if (!accessToken) {
            throw new UnauthorizedException();
        }

        const user = await this.userRepo.findOne({
            where: { id: Number(accessToken.userId) },
        });

        req.uploader = user?.shikimoriId ?? null;

        return Boolean(user?.shikimoriId);
    }
}