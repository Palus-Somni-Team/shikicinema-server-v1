import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateAnimes1779193729925 implements MigrationInterface {
    name = 'CreateAnimes1779193729925'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS pg_trgm`);
        await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS "animes" (
                "id" integer NOT NULL PRIMARY KEY,
                "genres" text[] NOT NULL DEFAULT '{}',
                "kind" varchar(32) NOT NULL DEFAULT 'tv',
                "status" varchar(32) NOT NULL DEFAULT 'anons',
                "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMPTZ NOT NULL DEFAULT now()
            )
        `);

        await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS "anime_titles" (
                "id" SERIAL NOT NULL PRIMARY KEY,
                "anime_id" integer NOT NULL,
                "title" varchar(512) NOT NULL,
                "language" varchar(2) NOT NULL,
                "priority" smallint NOT NULL DEFAULT 0
            )
        `);

        await queryRunner.query(`CREATE INDEX IF NOT EXISTS "idx_anime_titles_anime_id" ON "anime_titles" ("anime_id")`);
        await queryRunner.query(`CREATE INDEX IF NOT EXISTS "idx_anime_titles_title_trgm" ON "anime_titles" USING gin ("title" gin_trgm_ops)`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE IF EXISTS "anime_titles" CASCADE`);
        await queryRunner.query(`DROP TABLE IF EXISTS "animes" CASCADE`);
    }
}