import { MigrationInterface, QueryRunner } from "typeorm";

export class OptimizeAnimeColumns1782310489841 implements MigrationInterface {
    name = 'OptimizeAnimeColumns1782310489841'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE anime_kind_enum AS ENUM ('tv', 'movie', 'ova', 'ona', 'special', 'tv_special', 'music', 'pv', 'cm')`);
        await queryRunner.query(`CREATE TYPE anime_status_enum AS ENUM ('anons', 'ongoing', 'released')`);
        await queryRunner.query(`CREATE TYPE age_rating_enum AS ENUM ('g', 'pg', 'pg_13', 'r', 'r_plus', 'rx')`);

        await queryRunner.query(`ALTER TABLE "animes" ALTER COLUMN "kind" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "animes" ALTER COLUMN "kind" TYPE anime_kind_enum USING kind::anime_kind_enum`);
        await queryRunner.query(`ALTER TABLE "animes" ALTER COLUMN "kind" SET DEFAULT 'tv'::anime_kind_enum`);

        await queryRunner.query(`ALTER TABLE "animes" ALTER COLUMN "status" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "animes" ALTER COLUMN "status" TYPE anime_status_enum USING status::anime_status_enum`);
        await queryRunner.query(`ALTER TABLE "animes" ALTER COLUMN "status" SET DEFAULT 'anons'::anime_status_enum`);

        await queryRunner.query(`UPDATE animes SET rating = NULL WHERE rating = 'none'`);
        await queryRunner.query(`ALTER TABLE "animes" ALTER COLUMN "rating" TYPE age_rating_enum USING rating::age_rating_enum`);
        await queryRunner.query(`ALTER TABLE "animes" ALTER COLUMN "score" TYPE real USING score::real`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "animes" ALTER COLUMN "score" TYPE double precision USING score::double precision`);

        await queryRunner.query(`ALTER TABLE "animes" ALTER COLUMN "rating" TYPE varchar(16)`);

        await queryRunner.query(`ALTER TABLE "animes" ALTER COLUMN "status" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "animes" ALTER COLUMN "status" TYPE varchar(32)`);
        await queryRunner.query(`ALTER TABLE "animes" ALTER COLUMN "status" SET DEFAULT 'anons'::varchar`);

        await queryRunner.query(`ALTER TABLE "animes" ALTER COLUMN "kind" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "animes" ALTER COLUMN "kind" TYPE varchar(32)`);
        await queryRunner.query(`ALTER TABLE "animes" ALTER COLUMN "kind" SET DEFAULT 'tv'::varchar`);

        await queryRunner.query(`DROP TYPE age_rating_enum`);
        await queryRunner.query(`DROP TYPE anime_status_enum`);
        await queryRunner.query(`DROP TYPE anime_kind_enum`);
    }

}
