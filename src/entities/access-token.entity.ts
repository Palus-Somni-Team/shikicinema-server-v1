import { Entity, Column, PrimaryColumn } from 'typeorm';

@Entity('AccessTokens')
export class AccessTokenEntity {
    @PrimaryColumn({ type: 'varchar', length: 255 })
    token: string;

    @Column({ type: 'varchar', length: 255, name: 'user_id' })
    userId: string;

    @Column({ type: 'varchar', length: 255, name: 'client_id' })
    clientId: string;

    @Column({ type: 'varchar', length: 255, array: true })
    scopes: string[];

    @Column({ type: 'timestamp with time zone' })
    expires: Date;
}
