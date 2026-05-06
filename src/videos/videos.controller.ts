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
} from '@nestjs/common';
import {
	ApiTags,
	ApiOperation,
	ApiResponse,
	ApiQuery,
	ApiBearerAuth,
	ApiParam,
} from '@nestjs/swagger';

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
		private readonly _logger: Logger,
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
			return await this._videos.createVideo(video, req.uploader);
		} catch (e) {
			if (e instanceof DuplicateUrlException) {
				throw new HttpException(e.message, 400);
			}

			throw e;
		}
	}

	@Get('authors')
	@ApiOperation({ summary: 'Поиск авторов озвучки/субтитров' })
	@ApiResponse({ status: 200, description: 'Список авторов', example: ['AniDub', 'AniLibria'] })
	async getAuthors(@Query() query: AuthorsQueryDto) {
		return await this._videos.getAuthors(query);
	}

	@Get('contributions')
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
	@ApiOperation({ summary: 'Максимальный номер эпизода' })
	@ApiParam({ name: 'animeId', type: 'integer' })
	@ApiResponse({ status: 200, description: 'Максимальный эпизод', schema: AnimeLengthSchema })
	async getAnimeLength(@Param() params: GetByAnimeIdDto) {
		const length = await this._videos.getAnimeLength(params.animeId);

		return { length };
	}

	@Get(':animeId')
	@ApiOperation({ summary: 'Найти видео по ID аниме' })
	@ApiParam({ name: 'animeId', type: 'integer' })
	@ApiResponse({ status: 200, description: 'Найденные видео', type: [VideoEntity] })
	async getByAnimeId(@Param() params: GetByAnimeIdDto, @Query() query: VideosQueryDto) {
		return await this._videos.getByAnimeId(params.animeId, query);
	}
}
