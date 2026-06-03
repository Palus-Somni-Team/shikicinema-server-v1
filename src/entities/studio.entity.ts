import { Exclude, Expose } from 'class-transformer';
import { Entity, Column, PrimaryColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

@Exclude()
@Entity('studios')
export class StudioEntity {
    @Expose()
    @PrimaryColumn()
    @ApiProperty({ description: 'ID студии', example: 18 })
    id: number;

    @Expose()
    @Column({ type: 'varchar', length: 256, unique: true })
    @ApiProperty({ description: 'Название студии', example: 'Toei Animation' })
    name: string;

    @Expose()
    @ApiProperty({
        description: 'Логотип студии',
        example: '/static/studios/18.jpeg',
        nullable: true,
    })
    poster!: string | null;

    constructor(id: number, name: string) {
        this.id = id;
        this.name = name;
    }
}
