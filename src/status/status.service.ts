import { Injectable } from '@nestjs/common';
import { intervalToDuration, formatDuration } from 'date-fns';
import { ru } from 'date-fns/locale';
import * as os from 'os';

import { StatusEnum } from './types';

@Injectable()
export class StatusService {
    getStatus() {
        return Promise.resolve({
            server: StatusEnum.ONLINE as const,
            api: StatusEnum.ONLINE as const,
        });
    }

    getUptime() {
        const serverUptime = intervalToDuration({ start: 0, end: os.uptime() * 1000 });
        const apiUptime = intervalToDuration({ start: 0, end: process.uptime() * 1000 });

        return Promise.resolve({
            server: formatDuration(serverUptime, { locale: ru }),
            api: formatDuration(apiUptime, { locale: ru }),
        });
    }
}
