import { Controller, Get, Logger } from '@nestjs/common';

import { StatusService } from './status.service';
import { ResponseStatusDto, ResponseStatusUptimeDto } from './dto';

@Controller('status')
export class StatusController {
    constructor(
        private readonly _logger: Logger,
        private readonly _status: StatusService,
    ) {}

    @Get()
    async getStatus(): Promise<ResponseStatusDto> {
        return await this._status.getStatus();
    }

    @Get('/uptime')
    async getUptime(): Promise<ResponseStatusUptimeDto> {
        return await this._status.getUptime();
    }
}
