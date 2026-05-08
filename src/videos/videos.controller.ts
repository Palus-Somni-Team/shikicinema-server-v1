import {
	Controller,
	Get,
	Logger,
	Param,
	Query,
	Post,
	HttpException,
	UseGuards,
	Req,
	HttpCode,
	UseInterceptors,
	Inject,
} from '@nestjs/common';
import { CACHE_MANAGER, CacheInterceptor } from '@nestjs/cache-manager';
import {
	ApiTags,
	ApiOperation,
	ApiResponse,
	ApiQuery,
	ApiBearerAuth,
	ApiParam,
} from '@nestjs/swagger';
import type { Cache } from 'cache-manager';

import { VideosService } from './videos.service';
import {
	GetByAnimeIdDto,
	AuthorsQueryDto,
	VideosQueryDto,
	VideosSearchQueryDto,
	CreateVideoDto,
	ContributionsQueryDto,
} from './dto';
import { DuplicateUrlException } from '../domain';
import { UploadTokenGuard } from '../common/guards/upload-token.guard';
import { VideoEntity } from '../entities';
import { AnimeLengthSchema, ContributionsCountSchema } from './schemas';

@ApiTags('ShikiVideos')
@Controller('shikivideos')
export class VideosController {
	constructor(
		@Inject(CACHE_MANAGER)
		private readonly _cache: Cache,
		private readonly _videos: VideosService,
	) {}

	@Post()
	@ApiBearerAuth()
	@ApiOperation({ summary: 'Загрузить новое видео', description: 'Создаёт новую запись в архиве видео. Требуется авторизация.' })
	@ApiResponse({ status: 201, description: 'Успешно загружено', type: VideoEntity })
	@ApiResponse({
		status: 400, description: `Неверные параметры запроса
		<ul>
			<li>Отсутствуют обязательные поля</li>
			<li>Невалидные значения (kind, quality, episode и т.д.)</li>
			<li>URL уже существует в архиве</li>
		</ul>`
	})
	@ApiResponse({ status: 401, description: 'Требуется авторизация' })
	@HttpCode(201)
	@UseGuards(UploadTokenGuard)
	async createVideo(@Req() req: any, @Query() video: CreateVideoDto) {
		try {
			const created = await this._videos.createVideo(video, req.uploader);

			// чистим вообще для всего, т.к сбрасывать отдельно
			// для нужного animeId - замучаемся
			await this._cache.clear();

			return created;
		} catch (e) {
			if (e instanceof DuplicateUrlException) {
				throw new HttpException(e.message, 400);
			}

			throw e;
		}
	}

	@Get('authors')
	@UseInterceptors(CacheInterceptor)
	@ApiOperation({ summary: 'Поиск авторов озвучки/субтитров' })
	@ApiResponse({ status: 200, description: 'Список авторов', example: ['AniDub', 'AniLibria'] })
	async getAuthors(@Query() query: AuthorsQueryDto) {
		return await this._videos.getAuthors(query);
	}

	@Get('contributions')
	@UseInterceptors(CacheInterceptor)
	@ApiOperation({ summary: 'Количество загруженных видео' })
	@ApiQuery({ name: 'uploader', required: false, type: String })
	@ApiResponse({ status: 200, description: 'Количество', schema: ContributionsCountSchema })
	async getContributions(@Query() query: ContributionsQueryDto) {
		const count = await this._videos.getContributions(query);

		return { count };
	}

	@Get('search')
	@ApiOperation({ summary: 'Поиск видео по названию аниме' })
	@ApiResponse({ status: 200, description: 'Результаты поиска', type: [VideoEntity] })
	async search(@Query() query: VideosSearchQueryDto) {
		return await this._videos.search(query);
	}

	@Get(':animeId/length')
	@UseInterceptors(CacheInterceptor)
	@ApiOperation({ summary: 'Максимальный номер эпизода' })
	@ApiParam({ name: 'animeId', type: 'integer' })
	@ApiResponse({ status: 200, description: 'Максимальный эпизод', schema: AnimeLengthSchema })
	async getAnimeLength(@Param() params: GetByAnimeIdDto) {
		const length = await this._videos.getAnimeLength(params.animeId);

		return { length };
	}

	@Get(':animeId')
	@UseInterceptors(CacheInterceptor)
	@ApiOperation({ summary: 'Найти видео по ID аниме' })
	@ApiParam({ name: 'animeId', type: 'integer' })
	@ApiResponse({ status: 200, description: 'Найденные видео', type: [VideoEntity] })
	async getByAnimeId(@Param() params: GetByAnimeIdDto, @Query() query: VideosQueryDto) {
		return await this._videos.getByAnimeId(params.animeId, query);
	}
}
