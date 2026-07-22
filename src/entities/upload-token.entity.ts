import {
    Column,
    Entity,
    JoinColumn,
    ManyToOne,
    PrimaryColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

import { UploaderEntity } from './uploader.entity';
import { Exclude, Expose } from 'class-transformer';

@Exclude()
@Entity('upload_tokens')
export class UploadTokenEntity {
    @Expose()
    @PrimaryColumn('uuid', { name: 'token' })
    @ApiProperty({ example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
    token: string;

    @Expose()
    @Column({ name: 'expired_at' })
    @ApiProperty({ example: '2026-08-21T09:12:10.000Z' })
    expiredAt: Date;

    @Exclude()
    @ManyToOne(() => UploaderEntity, (uploader) => uploader.uploadTokens, { eager: true })
    @JoinColumn({ name: 'uploader_id' })
    uploader: UploaderEntity;

    @Exclude()
    @Column('boolean', { name: 'revoked', default: false })
    revoked: boolean;

    constructor(
        token: string,
        uploader: UploaderEntity,
        expiredAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        revoked = false,
    ) {
        this.token = token;
        this.uploader = uploader;
        this.expiredAt = expiredAt;
        this.revoked = revoked;
    }
}
