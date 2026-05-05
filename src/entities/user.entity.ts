import { Exclude, Expose } from 'class-transformer';
import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity('Users')
@Exclude()
export class UserEntity {
    @PrimaryGeneratedColumn()
    @Expose()
    id: number;

    @Column({ type: 'varchar', length: 255 })
    @Expose()
    name: string;

    @Column({ type: 'varchar', length: 255 })
    login: string;

    @Column({ type: 'varchar', length: 255 })
    password: string;

    @Column({ type: 'varchar', length: 255 })
    @Expose()
    email: string;

    @Column({ type: 'varchar', length: 255, array: true })
    @Expose()
    scopes: string[];

    @Column({ type: 'timestamp with time zone', name: 'createdAt' })
    @Expose({ name: 'created_at' })
    createdAt: Date;

    @Column({ type: 'varchar', length: 255, nullable: true, name: 'shikimori_id' })
    @Expose({ name: 'shikimori_id' })
    shikimoriId: string;
}
