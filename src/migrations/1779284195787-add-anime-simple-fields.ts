import { MigrationInterface, QueryRunner } from "typeorm";

export class AddAnimeSimpleFields1779284195787 implements MigrationInterface {
    name = 'AddAnimeSimpleFields1779284195787'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "animes" ADD COLUMN IF NOT EXISTS "tags" text[] NOT NULL DEFAULT '{}'`);
        await queryRunner.query(`ALTER TABLE "animes" ADD COLUMN IF NOT EXISTS "rating" varchar(16)`);
        await queryRunner.query(`ALTER TABLE "animes" ADD COLUMN IF NOT EXISTS "score" float`);
        await queryRunner.query(`ALTER TABLE "animes" ADD COLUMN IF NOT EXISTS "duration" int`);
        await queryRunner.query(`ALTER TABLE "animes" ADD COLUMN IF NOT EXISTS "aired_on" timestamptz`);
        await queryRunner.query(`ALTER TABLE "animes" ADD COLUMN IF NOT EXISTS "released_on" timestamptz`);
        await queryRunner.query(`ALTER TABLE "animes" ADD COLUMN IF NOT EXISTS "next_episode_at" timestamptz`);
        await queryRunner.query(`ALTER TABLE "animes" ADD COLUMN IF NOT EXISTS "description" text`);
        await queryRunner.query(`ALTER TABLE "animes" ADD COLUMN IF NOT EXISTS "studios" text[]`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "animes" DROP COLUMN IF EXISTS "studios"`);
        await queryRunner.query(`ALTER TABLE "animes" DROP COLUMN IF EXISTS "description"`);
        await queryRunner.query(`ALTER TABLE "animes" DROP COLUMN IF EXISTS "next_episode_at"`);
        await queryRunner.query(`ALTER TABLE "animes" DROP COLUMN IF EXISTS "released_on"`);
        await queryRunner.query(`ALTER TABLE "animes" DROP COLUMN IF EXISTS "aired_on"`);
        await queryRunner.query(`ALTER TABLE "animes" DROP COLUMN IF EXISTS "duration"`);
        await queryRunner.query(`ALTER TABLE "animes" DROP COLUMN IF EXISTS "score"`);
        await queryRunner.query(`ALTER TABLE "animes" DROP COLUMN IF EXISTS "rating"`);
        await queryRunner.query(`ALTER TABLE "animes" DROP COLUMN IF EXISTS "tags"`);
    }
}
