import { Controller, Get, Logger } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

import { StatusService } from './status.service';
import { ResponseStatusDto, ResponseStatusUptimeDto } from './dto';

@ApiTags('Status')
@Controller('status')
export class StatusController {
    constructor(
        private readonly _logger: Logger,
        private readonly _status: StatusService,
    ) {}

    @Get()
    @ApiOperation({ summary: 'Статус сервера и API' })
    @ApiResponse({ status: 200, description: 'OK', type: ResponseStatusDto })
    async getStatus(): Promise<ResponseStatusDto> {
        return await this._status.getStatus();
    }

    @Get('/uptime')
    @ApiOperation({ summary: 'Аптайм сервера и API' })
    @ApiResponse({ status: 200, description: 'OK', type: ResponseStatusUptimeDto })
    async getUptime(): Promise<ResponseStatusUptimeDto> {
        return await this._status.getUptime();
    }
}
