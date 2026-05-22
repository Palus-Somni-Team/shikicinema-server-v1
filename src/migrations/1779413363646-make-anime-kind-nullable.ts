import { MigrationInterface, QueryRunner } from "typeorm";

export class MakeAnimeKindNullable1779413363646 implements MigrationInterface {
    name = 'MakeAnimeKindNullable1779413363646'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "animes" ALTER COLUMN "kind" DROP NOT NULL;`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "animes" ALTER COLUMN "kind" SET NOT NULL;`);
    }

}
