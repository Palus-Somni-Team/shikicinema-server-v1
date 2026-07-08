import { MigrationInterface, QueryRunner } from "typeorm";

export class AddAnimeTitlesLangPriority1783551551061 implements MigrationInterface {
    name = 'AddAnimeTitlesLangPriority1783551551061'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE INDEX IF NOT EXISTS "idx_anime_titles_anime_lang_priority" ON "anime_titles" ("anime_id", "language", "priority" ASC)`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX IF EXISTS "idx_anime_titles_anime_lang_priority"`);
    }
}
