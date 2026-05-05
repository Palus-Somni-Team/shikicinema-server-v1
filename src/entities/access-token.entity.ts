import { Exclude, Expose } from 'class-transformer';
import { Entity, Column, PrimaryColumn } from 'typeorm';

@Entity('AccessTokens')
@Exclude()
export class AccessTokenEntity {
    @PrimaryColumn({ type: 'varchar', length: 255 })
    @Expose()
    token: string;

    @Column({ type: 'varchar', length: 255, name: 'user_id' })
    @Expose({ name: 'user_id' })
    userId: string;

    @Column({ type: 'varchar', length: 255, name: 'client_id' })
    @Expose({ name: 'client_id' })
    clientId: string;

    @Column({ type: 'varchar', length: 255, array: true })
    @Expose()
    scopes: string[];

    @Column({ type: 'timestamp with time zone' })
    @Expose()
    expires: Date;
}
