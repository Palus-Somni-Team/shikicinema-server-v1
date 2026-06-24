import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddIndexesToAnimes1782310519750 implements MigrationInterface {
    name = 'AddIndexesToAnimes1782310519750'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE INDEX IF NOT EXISTS "idx_animes_duration" ON "animes" ("duration")`);
        await queryRunner.query(`CREATE INDEX IF NOT EXISTS "idx_animes_aired_on" ON "animes" ("aired_on")`);
        await queryRunner.query(`CREATE INDEX IF NOT EXISTS "idx_animes_released_on" ON "animes" ("released_on")`);
        await queryRunner.query(`CREATE INDEX IF NOT EXISTS "idx_animes_score" ON "animes" ("score")`);
        await queryRunner.query(`CREATE INDEX IF NOT EXISTS "idx_animes_kind" ON "animes" ("kind")`);
        await queryRunner.query(`CREATE INDEX IF NOT EXISTS "idx_animes_status" ON "animes" ("status")`);
        await queryRunner.query(`CREATE INDEX IF NOT EXISTS "idx_animes_rating" ON "animes" ("rating")`);
        await queryRunner.query(`CREATE INDEX IF NOT EXISTS "idx_animes_episodes_total" ON "animes" ("episodes_total")`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX IF EXISTS "idx_animes_episodes_total"`);
        await queryRunner.query(`DROP INDEX IF EXISTS "idx_animes_rating"`);
        await queryRunner.query(`DROP INDEX IF EXISTS "idx_animes_status"`);
        await queryRunner.query(`DROP INDEX IF EXISTS "idx_animes_kind"`);
        await queryRunner.query(`DROP INDEX IF EXISTS "idx_animes_score"`);
        await queryRunner.query(`DROP INDEX IF EXISTS "idx_animes_released_on"`);
        await queryRunner.query(`DROP INDEX IF EXISTS "idx_animes_aired_on"`);
        await queryRunner.query(`DROP INDEX IF EXISTS "idx_animes_duration"`);
    }

}
