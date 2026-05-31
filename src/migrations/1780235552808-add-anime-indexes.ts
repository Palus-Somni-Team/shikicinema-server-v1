import { MigrationInterface, QueryRunner } from "typeorm";

export class AddAnimeIndexes1780235552808 implements MigrationInterface {
    name = 'AddAnimeIndexes1780235552808'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE INDEX IF NOT EXISTS "idx_animes_studios_gin" ON "animes" USING gin ("studios")`);
        await queryRunner.query(`CREATE INDEX IF NOT EXISTS "idx_anime_genres_genre_id" ON "anime_genres" ("genre_id")`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX IF EXISTS "idx_anime_genres_genre_id"`);
        await queryRunner.query(`DROP INDEX IF EXISTS "idx_animes_studios_gin"`);
    }

}
