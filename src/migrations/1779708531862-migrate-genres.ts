import { MigrationInterface, QueryRunner } from "typeorm";

export class MigrateGenres1779708531862 implements MigrationInterface {
    name = 'MigrateGenres1779708531862'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS "genres" (
                "id" integer PRIMARY KEY,
                "name" varchar(64) NOT NULL,
                "russian" varchar(64) NOT NULL,
                "kind" varchar(16) NOT NULL,
                "entry_type" varchar(8) NOT NULL DEFAULT 'Anime'
            )
        `);

        await queryRunner.query(`
            INSERT INTO "genres" ("id", "name", "russian", "kind", "entry_type") VALUES
            (1, 'Action', 'Экшен', 'genre', 'Anime'),
            (2, 'Adventure', 'Приключения', 'genre', 'Anime'),
            (3, 'Racing', 'Гонки', 'theme', 'Anime'),
            (4, 'Comedy', 'Комедия', 'genre', 'Anime'),
            (5, 'Avant Garde', 'Авангард', 'genre', 'Anime'),
            (6, 'Mythology', 'Мифология', 'theme', 'Anime'),
            (7, 'Mystery', 'Тайна', 'genre', 'Anime'),
            (8, 'Drama', 'Драма', 'genre', 'Anime'),
            (9, 'Ecchi', 'Этти', 'genre', 'Anime'),
            (10, 'Fantasy', 'Фэнтези', 'genre', 'Anime'),
            (11, 'Strategy Game', 'Стратегические игры', 'theme', 'Anime'),
            (12, 'Hentai', 'Хентай', 'genre', 'Anime'),
            (13, 'Historical', 'Исторический', 'theme', 'Anime'),
            (14, 'Horror', 'Ужасы', 'genre', 'Anime'),
            (15, 'Kids', 'Детское', 'demographic', 'Anime'),
            (17, 'Martial Arts', 'Боевые искусства', 'theme', 'Anime'),
            (18, 'Mecha', 'Меха', 'theme', 'Anime'),
            (19, 'Music', 'Музыка', 'theme', 'Anime'),
            (20, 'Parody', 'Пародия', 'theme', 'Anime'),
            (21, 'Samurai', 'Самураи', 'theme', 'Anime'),
            (22, 'Romance', 'Романтика', 'genre', 'Anime'),
            (23, 'School', 'Школа', 'theme', 'Anime'),
            (24, 'Sci-Fi', 'Фантастика', 'genre', 'Anime'),
            (25, 'Shoujo', 'Сёдзё', 'demographic', 'Anime'),
            (27, 'Shounen', 'Сёнен', 'demographic', 'Anime'),
            (29, 'Space', 'Космос', 'theme', 'Anime'),
            (30, 'Sports', 'Спорт', 'genre', 'Anime'),
            (31, 'Super Power', 'Супер сила', 'theme', 'Anime'),
            (32, 'Vampire', 'Вампиры', 'theme', 'Anime'),
            (33, 'Yaoi', 'Яой', 'genre', 'Anime'),
            (34, 'Yuri', 'Юри', 'genre', 'Anime'),
            (35, 'Harem', 'Гарем', 'theme', 'Anime'),
            (36, 'Slice of Life', 'Повседневность', 'genre', 'Anime'),
            (37, 'Supernatural', 'Сверхъестественное', 'genre', 'Anime'),
            (38, 'Military', 'Военное', 'theme', 'Anime'),
            (39, 'Detective', 'Детектив', 'theme', 'Anime'),
            (40, 'Psychological', 'Психологическое', 'theme', 'Anime'),
            (42, 'Seinen', 'Сэйнэн', 'demographic', 'Anime'),
            (43, 'Josei', 'Дзёсей', 'demographic', 'Anime'),
            (102, 'Team Sports', 'Командный спорт', 'theme', 'Anime'),
            (103, 'Video Game', 'Видеоигры', 'theme', 'Anime'),
            (104, 'Adult Cast', 'Взрослые персонажи', 'theme', 'Anime'),
            (105, 'Gore', 'Жестокость', 'theme', 'Anime'),
            (106, 'Reincarnation', 'Реинкарнация', 'theme', 'Anime'),
            (107, 'Love Polygon', 'Любовный многоугольник', 'theme', 'Anime'),
            (108, 'Visual Arts', 'Изобразительное искусство', 'theme', 'Anime'),
            (111, 'Time Travel', 'Путешествие во времени', 'theme', 'Anime'),
            (112, 'Gag Humor', 'Гэг-юмор', 'theme', 'Anime'),
            (114, 'Award Winning', 'Удостоено наград', 'theme', 'Anime'),
            (117, 'Suspense', 'Триллер', 'genre', 'Anime'),
            (118, 'Combat Sports', 'Спортивные единоборства', 'theme', 'Anime'),
            (119, 'CGDCT', 'Милые девочки делают милые вещи', 'theme', 'Anime'),
            (124, 'Mahou Shoujo', 'Махо-сёдзё', 'theme', 'Anime'),
            (125, 'Reverse Harem', 'Реверс-гарем', 'theme', 'Anime'),
            (129, 'Girls Love', 'Сёдзё-ай', 'genre', 'Anime'),
            (130, 'Isekai', 'Исэкай', 'theme', 'Anime'),
            (131, 'Delinquents', 'Хулиганы', 'theme', 'Anime'),
            (133, 'Boys Love', 'Сёнен-ай', 'genre', 'Anime'),
            (134, 'Childcare', 'Забота о детях', 'theme', 'Anime'),
            (135, 'Magical Sex Shift', 'Магическая смена пола', 'theme', 'Anime'),
            (136, 'Showbiz', 'Шоу-бизнес', 'theme', 'Anime'),
            (137, 'Otaku Culture', 'Культура отаку', 'theme', 'Anime'),
            (138, 'Organized Crime', 'Организованная преступность', 'theme', 'Anime'),
            (139, 'Workplace', 'Работа', 'theme', 'Anime'),
            (140, 'Iyashikei', 'Иясикэй', 'theme', 'Anime'),
            (141, 'Survival', 'Выживание', 'theme', 'Anime'),
            (142, 'Performing Arts', 'Исполнительское искусство', 'theme', 'Anime'),
            (143, 'Anthropomorphic', 'Антропоморфизм', 'theme', 'Anime'),
            (144, 'Crossdressing', 'Кроссдрессинг', 'theme', 'Anime'),
            (145, 'Idols (Female)', 'Идолы (Жен.)', 'theme', 'Anime'),
            (146, 'High Stakes Game', 'Игра с высокими ставками', 'theme', 'Anime'),
            (147, 'Medical', 'Медицина', 'theme', 'Anime'),
            (148, 'Pets', 'Питомцы', 'theme', 'Anime'),
            (149, 'Educational', 'Образовательное', 'theme', 'Anime'),
            (150, 'Idols (Male)', 'Идолы (Муж.)', 'theme', 'Anime'),
            (151, 'Love Status Quo', 'Романтический подтекст', 'theme', 'Anime'),
            (197, 'Urban Fantasy', 'Городское фэнтези', 'theme', 'Anime'),
            (198, 'Villainess', 'Злодейка', 'theme', 'Anime'),
            (539, 'Erotica', 'Эротика', 'genre', 'Anime'),
            (543, 'Gourmet', 'Гурман', 'genre', 'Anime')
            ON CONFLICT (id) DO NOTHING
        `);

        await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS "anime_genres" (
                "anime_id" integer NOT NULL,
                "genre_id" integer NOT NULL,
                PRIMARY KEY ("anime_id", "genre_id")
            )
        `);

        await queryRunner.query(`
            INSERT INTO "anime_genres" ("anime_id", "genre_id")
            SELECT a.id, g.id
            FROM "animes" a
            CROSS JOIN LATERAL unnest(a.genres) AS genre_name
            JOIN "genres" g ON g.name = genre_name AND g.entry_type = 'Anime'
            ON CONFLICT ("anime_id", "genre_id") DO NOTHING
        `);

        await queryRunner.query(`ALTER TABLE "animes" DROP COLUMN "genres"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "animes" ADD COLUMN IF NOT EXISTS "genres" text[] DEFAULT '{}'`);
        await queryRunner.query(`DROP TABLE IF EXISTS "anime_genres" CASCADE`);
        await queryRunner.query(`DROP TABLE IF EXISTS "genres" CASCADE`);
    }

}
