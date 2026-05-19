import { MigrationInterface, QueryRunner } from "typeorm";

export class Initial1779190695693 implements MigrationInterface {
    name = 'Initial1779190695693'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS "Users" (
                "id" serial PRIMARY KEY,
                "name" varchar(255) NOT NULL,
                "login" varchar(255) NOT NULL,
                "password" varchar(255) NOT NULL,
                "email" varchar(255) NOT NULL,
                "scopes" varchar(255)[] NOT NULL,
                "createdAt" timestamptz NOT NULL DEFAULT '2019-08-07 23:19:04.222+03',
                "shikimori_id" varchar(255)
            )
        `);

        await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS "AccessTokens" (
                "token" varchar(255) PRIMARY KEY,
                "user_id" varchar(255) NOT NULL,
                "client_id" varchar(255) NOT NULL,
                "scopes" varchar(255)[] NOT NULL,
                "expires" timestamptz NOT NULL
            )
        `);

        await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS "ShikiVideos" (
                "id" serial PRIMARY KEY,
                "url" varchar(2048) NOT NULL,
                "anime_id" int NOT NULL,
                "anime_english" varchar(512),
                "anime_russian" varchar(512),
                "episode" int NOT NULL,
                "kind" varchar(32),
                "language" varchar(16),
                "quality" varchar(16),
                "author" varchar(256),
                "watches_count" int,
                "uploader" varchar(512)
            )
        `);

        await queryRunner.query(`CREATE UNIQUE INDEX IF NOT EXISTS "url_hash_uniq" ON "ShikiVideos" ((md5(url::text)::uuid))`);
        await queryRunner.query(`CREATE INDEX IF NOT EXISTS "shikivideos_animeid_episode_idx" ON "ShikiVideos" ("anime_id", "episode")`);
        await queryRunner.query(`CREATE INDEX IF NOT EXISTS "shikivideos_author_idx" ON "ShikiVideos" ("author")`);
        await queryRunner.query(`CREATE INDEX IF NOT EXISTS "shikivideos_uploader_idx" ON "ShikiVideos" ("uploader")`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE IF EXISTS "ShikiVideos" CASCADE`);
        await queryRunner.query(`DROP TABLE IF EXISTS "AccessTokens" CASCADE`);
        await queryRunner.query(`DROP TABLE IF EXISTS "Users" CASCADE`);
    }
}