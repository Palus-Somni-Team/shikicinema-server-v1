import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { v4 as uuid } from 'uuid';

import { UploaderEntity, UploadTokenEntity } from '../entities';

@Injectable()
export class UploaderService {
    constructor(
        @InjectRepository(UploadTokenEntity)
        private readonly uploadTokenRepo: Repository<UploadTokenEntity>,

        @InjectRepository(UploaderEntity)
        private readonly uploaderRepo: Repository<UploaderEntity>,
    ) {}

    async getUploader(shikimoriUserId: string | number): Promise<UploaderEntity> {
        return this.uploaderRepo.manager.transaction(async (manager) => {
            const shikimoriId = `${shikimoriUserId}`;

            let uploader = await manager.findOne(UploaderEntity, {
                where: { shikimoriId },
            });

            if (!uploader) {
                uploader = manager.create(UploaderEntity, {
                    shikimoriId,
                    banned: false,
                });

                await manager.save(UploaderEntity, uploader);
            }

            return uploader;
        });
    }

    async issueNewToken(uploader: UploaderEntity): Promise<UploadTokenEntity> {
        return this.uploadTokenRepo.save(new UploadTokenEntity(uuid(), uploader));
    }
}
