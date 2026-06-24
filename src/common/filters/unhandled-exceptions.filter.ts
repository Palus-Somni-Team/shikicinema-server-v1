import {
    ExceptionFilter,
    Catch,
    ArgumentsHost,
    HttpException,
    HttpStatus,
    Inject,
} from '@nestjs/common';

import { AlertService } from '../services/alert';

@Catch()
export class UnhandledExceptionsFilter implements ExceptionFilter {
    constructor(
        @Inject(AlertService)
        private readonly alert: AlertService,
    ) {}

    catch(exception: unknown, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse();

        if (exception instanceof HttpException) {
            return response
                .status(exception.getStatus())
                .json(exception.getResponse());
        } else {
            this.alert.error('UNHANDLED', 'Unhandled exception', exception);

            response
                .status(HttpStatus.INTERNAL_SERVER_ERROR)
                .json({
                    statusCode: 500,
                    message: 'Internal Server Error',
                });
        }
    }
}
