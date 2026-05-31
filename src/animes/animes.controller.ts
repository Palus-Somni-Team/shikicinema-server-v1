import {
    Controller,
    Get,
    Param,
    Query,
    ParseIntPipe,
    Post,
    Body,
    HttpCode,
} from '@nestjs/common';
import {
    ApiTags,
    ApiOperation,
    ApiResponse,
    ApiParam,
} from '@nestjs/swagger';

import { AnimesService } from './animes.service';
import { AnimeEntity, AnimeTitleEntity } from '../entities';
import { GetTitlesQueryDto, AnimeQueryDto } from './dto';

@ApiTags('Animes')
@Controller('animes')
export class AnimesController {
    constructor(private readonly animesService: AnimesService) {}

    @Post('query')
    @HttpCode(200)
    @ApiOperation({ summary: 'Запросить аниме по списку ID и фильтрам' })
    @ApiResponse({ status: 200, type: [AnimeEntity] })
    async query(@Body() body: AnimeQueryDto) {
        return this.animesService.getByQuery(body);
    }

    @Get(':id')
    @ApiOperation({ summary: 'Информация об аниме' })
    @ApiParam({ name: 'id', type: 'integer' })
    @ApiResponse({ status: 200, type: AnimeEntity })
    async findById(@Param('id', ParseIntPipe) id: number) {
        return this.animesService.findById(id);
    }

    @Get(':id/titles')
    @ApiOperation({ summary: 'Названия аниме' })
    @ApiParam({ name: 'id', type: 'integer' })
    @ApiResponse({ status: 200, type: [AnimeTitleEntity] })
    async findTitlesById(
        @Param('id', ParseIntPipe) id: number,
        @Query() query: GetTitlesQueryDto,
    ) {
        return this.animesService.findTitlesById(id, query.language);
    }
}
