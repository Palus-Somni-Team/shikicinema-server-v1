import { MigrationInterface, QueryRunner } from "typeorm";

export class MigrateShikivideosNameToAnimes1779194312249 implements MigrationInterface {
    name = 'MigrateShikivideosNameToAnimes1779194312249'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE UNIQUE INDEX IF NOT EXISTS "idx_anime_titles_unique" ON "anime_titles" ("anime_id", "title")`);

        await queryRunner.query(`
            INSERT INTO animes (id)
            SELECT DISTINCT anime_id FROM "ShikiVideos"
            ON CONFLICT (id) DO NOTHING
        `);

        await queryRunner.query(`
            INSERT INTO anime_titles (anime_id, title, language, priority)
            SELECT DISTINCT anime_id, anime_russian, 'ru', 0
            FROM "ShikiVideos"
            WHERE anime_russian IS NOT NULL AND anime_russian != ''
            ON CONFLICT DO NOTHING
        `);

        await queryRunner.query(`
            INSERT INTO anime_titles (anime_id, title, language, priority)
            SELECT DISTINCT anime_id, anime_english, 'en', 0
            FROM "ShikiVideos"
            WHERE anime_english IS NOT NULL AND anime_english != ''
            ON CONFLICT DO NOTHING
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DELETE FROM anime_titles`);
        await queryRunner.query(`DELETE FROM animes`);
    }
}
