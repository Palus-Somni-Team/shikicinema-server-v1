import { Controller, Get, Query } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

import { StudiosService } from './studios.service';
import { GetStudiosDto } from './dto';
import { StudioEntity } from '../entities';

@Controller('studios')
@ApiTags('Studios')
export class StudiosController {
    constructor(private readonly studiosService: StudiosService) {}

    @Get()
    @ApiOperation({ summary: 'Поиск студий по имени' })
    @ApiResponse({ status: 200, type: [StudioEntity] })
    async find(@Query() dto: GetStudiosDto) {
        return this.studiosService.find(dto);
    }
}
