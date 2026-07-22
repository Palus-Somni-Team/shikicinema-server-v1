import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateUploaders1784700869893 implements MigrationInterface {
    name = 'CreateUploaders1784700869893'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE "uploaders" (
                "shikimori_id" VARCHAR(255) PRIMARY KEY,
                "banned" BOOLEAN DEFAULT false
            )
        `);

        await queryRunner.query(`
            CREATE TABLE "upload_tokens" (
                "token" UUID PRIMARY KEY,
                "uploader_id" VARCHAR(255) REFERENCES "uploaders"("shikimori_id"),
                "expired_at" TIMESTAMPTZ NOT NULL,
                "revoked" BOOLEAN DEFAULT false
            )
        `);

        await queryRunner.query(`
            INSERT INTO "uploaders" ("shikimori_id")
            SELECT DISTINCT "shikimori_id" FROM "Users"
            WHERE "shikimori_id" IS NOT NULL
            ON CONFLICT DO NOTHING
        `);
    }
    
    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE IF EXISTS "upload_tokens"`);
        await queryRunner.query(`DROP TABLE IF EXISTS "uploaders"`);
    }

}
