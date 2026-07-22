import {
    Entity,
    Column,
    OneToMany,
    PrimaryColumn,
} from 'typeorm';
import { UploadTokenEntity } from './upload-token.entity';


@Entity('uploaders')
export class UploaderEntity {
    @PrimaryColumn({ name: 'shikimori_id', type: 'varchar', length: 255 })
    shikimoriId: string;

    @Column({ type: 'boolean', default: false })
    banned: boolean;

    @OneToMany(() => UploadTokenEntity, (token) => token.uploader)
    uploadTokens!: UploadTokenEntity[];

    constructor(shikimoriId: string, banned = false) {
        this.shikimoriId = shikimoriId;
        this.banned = banned;
    }
}
