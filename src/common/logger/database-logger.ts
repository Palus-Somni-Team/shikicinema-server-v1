import { Injectable, Logger } from '@nestjs/common';
import { Logger as TypeOrmLogger, QueryRunner } from 'typeorm';

@Injectable()
export class DatabaseLogger implements TypeOrmLogger {
    private readonly logger = new Logger('SQL');
    private readonly isVerbose = process.env.SHIKICINEMA_API_V1_LOG === 'verbose';

    logQuery(query: string, parameters?: unknown[], queryRunner?: QueryRunner) {
        if (this.isVerbose) {
            this.logger.log(query + (parameters?.length ? ` -- params: ${JSON.stringify(parameters)}` : ''));
        }
    }

    logQueryError(error: string, query: string, parameters?: unknown[], queryRunner?: QueryRunner) {
        this.logger.error(`${query} -- params: ${JSON.stringify(parameters)} -- ${error}`);
    }

    logQuerySlow(time: number, query: string, parameters?: unknown[], queryRunner?: QueryRunner) {
        this.logger.warn(`SLOW (${time}ms): ${query} -- params: ${JSON.stringify(parameters)}`);
    }

    logMigration(message: string, queryRunner?: QueryRunner) {
        this.logger.log(message);
    }

    logSchemaBuild(message: string, queryRunner?: QueryRunner) {
        this.logger.log(message);
    }

    log(level: 'log' | 'info' | 'warn', message: string, queryRunner?: QueryRunner) {
        this.logger[level](message);
    }
}