import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity('Users')
export class UserEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: 'varchar', length: 255 })
    name: string;

    @Column({ type: 'varchar', length: 255 })
    login: string;

    @Column({ type: 'varchar', length: 255 })
    password: string;

    @Column({ type: 'varchar', length: 255 })
    email: string;

    @Column({ type: 'varchar', length: 255, array: true })
    scopes: string[];

    @Column({ type: 'timestamp with time zone', name: 'createdAt' })
    createdAt: Date;

    @Column({ type: 'varchar', length: 255, nullable: true, name: 'shikimori_id' })
    shikimoriId: string;
}
