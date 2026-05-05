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
} from '@nestjs/common';

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

@Controller('shikivideos')
export class VideosController {
	constructor(
		private readonly _logger: Logger,
		private readonly _videos: VideosService,
	) {}

	@Post()
	@UseGuards(UploadTokenGuard)
	async createVideo(
		@Req() req: any,
		@Query() video: CreateVideoDto
	) {
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
	async getAuthors(@Query() query: AuthorsQueryDto) {
		return await this._videos.getAuthors(query);
	}

	@Get('contributions')
	async getContributions(@Query() query: ContributionsQueryDto) {
		const count = await this._videos.getContributions(query);

		return { count };
	}

	@Get('search')
	async search(@Query() query: VideosSearchQueryDto) {
		return await this._videos.search(query);
	}

	@Get(':animeId/length')
	async getAnimeLength(@Param() params: GetByAnimeIdDto) {
		const length = await this._videos.getAnimeLength(params.animeId);

		return { length };
	}

	@Get(':animeId')
	async getByAnimeId(
		@Param() params: GetByAnimeIdDto,
		@Query() query: VideosQueryDto,
	) {
		return await this._videos.getByAnimeId(params.animeId, query);
	}
}
