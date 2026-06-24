import { MigrationInterface, QueryRunner } from "typeorm";

export class AddTotalEpisodesToAnimes1782306337069 implements MigrationInterface {
    name = 'AddTotalEpisodesToAnimes1782306337069'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "animes" ADD COLUMN IF NOT EXISTS "episodes_total" integer DEFAULT NULL`);
        await queryRunner.query(`ALTER TABLE "animes" ADD CONSTRAINT "chk_episodes_total_non_negative" CHECK ("episodes_total" >= 0)`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "animes" DROP CONSTRAINT IF EXISTS "chk_episodes_total_non_negative"`);
        await queryRunner.query(`ALTER TABLE "animes" DROP COLUMN IF EXISTS "episodes_total"`);
    }

}
