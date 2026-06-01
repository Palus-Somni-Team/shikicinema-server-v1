import { Exclude, Expose } from 'class-transformer';
import { Entity, Column, PrimaryColumn } from 'typeorm';

@Exclude()
@Entity('studios')
export class StudioEntity {
    @Expose()
    @PrimaryColumn()
    id: number;

    @Expose()
    @Column({ type: 'varchar', length: 256, unique: true })
    name: string;

    constructor(id: number, name: string) {
        this.id = id;
        this.name = name;
    }
}
