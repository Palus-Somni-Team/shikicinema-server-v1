import { Test, TestingModule } from '@nestjs/testing';

import { StatusService } from './status.service';
import { StatusEnum } from './types';

describe('StatusService', () => {
    let service: StatusService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [StatusService],
        }).compile();

        service = module.get<StatusService>(StatusService);
    });

    describe('getStatus', () => {
        it('should return status object with ONLINE for both server and api', async () => {
            const result = await service.getStatus();

            expect(result).toEqual({
                server: StatusEnum.ONLINE,
                api: StatusEnum.ONLINE
            });
        });
    });

    describe('getUptime', () => {
        it('should return uptime strings for server and api', async () => {
            const result = await service.getUptime();

            expect(typeof result.server).toBe('string');
            expect(typeof result.api).toBe('string');
            expect(result.server).not.toBeNull();
            expect(result.api).not.toBeNull();
        });
    });
});