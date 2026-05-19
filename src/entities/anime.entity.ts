import {
    Entity,
    Column,
    PrimaryColumn,
    CreateDateColumn,
    UpdateDateColumn,
    OneToMany,
    JoinColumn,
} from 'typeorm';
import { Exclude, Expose } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

import { AnimeTitleEntity } from './anime-title.entity';

@Exclude()
@Entity('animes')
export class AnimeEntity {
    @PrimaryColumn({ type: 'integer' })
    @Expose()
    @ApiProperty({ example: 21 })
    id: number;

    @Column('text', { array: true })
    @Expose()
    @ApiProperty({ example: ['драма', 'фэнтези'] })
    genres: string[];

    @Column({ type: 'varchar', length: 32 })
    @Expose()
    @ApiProperty({ example: 'tv' })
    kind: string;

    @Column({ type: 'varchar', length: 32 })
    @Expose()
    @ApiProperty({ example: 'released' })
    status: string;

    @OneToMany(() => AnimeTitleEntity, (title) => title.anime)
    @JoinColumn({ name: 'id', referencedColumnName: 'anime_id' })
    titles: AnimeTitleEntity[];

    @CreateDateColumn({ name: 'created_at' })
    @Expose({ name: 'created_at' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    @Expose({ name: 'updated_at' })
    updatedAt: Date;
}
