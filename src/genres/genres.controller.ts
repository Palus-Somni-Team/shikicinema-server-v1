import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

import { GenresService } from './genres.service';
import { GenreEntity } from '../entities';

@ApiTags('Genres')
@Controller('genres')
export class GenresController {
    constructor(private readonly genresService: GenresService) {}

    @Get()
    @ApiOperation({ summary: 'Список всех жанров' })
    @ApiResponse({ status: 200, type: [GenreEntity] })
    async findAll() {
        return this.genresService.findAll();
    }
}
