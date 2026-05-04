import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule, getRepositoryToken } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Repository, DataSource } from 'typeorm';

import { VideosModule } from '../../src/videos/videos.module';
import { VideosService } from '../../src/videos/videos.service';
import { VideoEntity } from '../../src/entities';
import { KindEnum, QualityEnum } from '../../src/videos/dto';
import { DuplicateUrlException } from '../../src/domain';

describe('createVideo (integration)', () => {
    let moduleFixture: TestingModule;
    let service: VideosService;
    let repo: Repository<VideoEntity>;

    beforeAll(async () => {
        moduleFixture = await Test.createTestingModule({
            imports: [
                ConfigModule.forRoot(),
                TypeOrmModule.forRootAsync({
                    imports: [ConfigModule],
                    inject: [ConfigService],
                    useFactory: (config: ConfigService) => ({
                        type: 'postgres',
                        host: config.get<string>('DB_HOST'),
                        port: config.get<number>('DB_PORT'),
                        username: config.get<string>('DB_USER'),
                        password: config.get<string>('DB_PASSWORD'),
                        database: config.get<string>('DB_NAME'),
                        synchronize: false,
                        entities: [VideoEntity],
                    }),
                }),
                VideosModule,
            ],
        }).compile();

        service = moduleFixture.get<VideosService>(VideosService);
        repo = moduleFixture.get<Repository<VideoEntity>>(
            getRepositoryToken(VideoEntity),
        );
    });

    afterAll(async () => {
        const dataSource = moduleFixture.get(DataSource);
        if (dataSource.isInitialized) {
            await dataSource.destroy();
        }
    });

    const url = 'http://integration-test.local/video';

    afterEach(async () => {
        await repo.delete({ url });
    });

    it('creates and returns video entity', async () => {
        const video = await service.createVideo({
            url,
            animeId: 99999,
            episode: 1,
            kind: KindEnum.DUBBING,
            language: 'ru',
        });

        expect(video).toBeInstanceOf(VideoEntity);
        expect(video.url).toBe(url);
        expect(video.animeId).toBe(99999);
        expect(video.episode).toBe(1);
        expect(video.kind).toBe('озвучка');
        expect(video.language).toBe('ru');
        expect(video.quality).toBe(QualityEnum.UNKNOWN);
        expect(video.author).toBeNull();
        expect(video.uploader).toBeNull();
        expect(video.watchesCount).toBe(0);

        const inDb = await repo.findOne({ where: { url } });
        expect(inDb).not.toBeNull();
    });

    it('creates video with optional fields', async () => {
        const video = await service.createVideo({
            url,
            animeId: 99999,
            episode: 1,
            kind: KindEnum.DUBBING,
            language: 'ru',
            author: 'Ancord',
            quality: QualityEnum.BD,
        });

        expect(video.author).toBe('Ancord');
        expect(video.quality).toBe(QualityEnum.BD);
    });

    it('throws DuplicateUrlException on duplicate URL', async () => {
        await service.createVideo({
            url,
            animeId: 99999,
            episode: 1,
            kind: KindEnum.DUBBING,
            language: 'ru',
        });

        await expect(
            service.createVideo({
                url,
                animeId: 88888,
                episode: 2,
                kind: KindEnum.SUBTITLES,
                language: 'en',
            }),
        ).rejects.toThrow(DuplicateUrlException);
    });
});