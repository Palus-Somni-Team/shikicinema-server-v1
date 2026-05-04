import { Injectable } from '@nestjs/common';

import { StatusServiceInterface } from './status-service.interface';
import { ResponseStatusDto } from './dto/response-status.dto';
import { StatusEnum } from './types';
import { ResponseStatusUptimeDto } from './dto';

@Injectable()
export class StatusService implements StatusServiceInterface {
    getStatus(): Promise<ResponseStatusDto> {
        return Promise.resolve({
            server: StatusEnum.ONLINE,
            api: StatusEnum.ONLINE,
        });
    }

    getUptime(): Promise<ResponseStatusUptimeDto> {
        return Promise.resolve({
            server: '0 hours, 5 minute',
            api: '0 hours, 1 minute',
        });
    }
}
