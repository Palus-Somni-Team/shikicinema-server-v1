import { Injectable, NestMiddleware, Logger } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { UAParser } from 'ua-parser-js';

@Injectable()
export class HttpLoggerMiddleware implements NestMiddleware {
    private readonly logger = new Logger('HTTP');
    private readonly empty = '-';
    private readonly isVerbose = process.env.SHIKICINEMA_API_V1_LOG === 'verbose';

    private formatString(value?: string): string {
        return value || this.empty;
    }

    private formatUA(userAgent?: string): string {
        if (!userAgent) return this.empty;

        const { browser, os } = UAParser(userAgent);

        return (!browser.name || !browser.version || !os)
            ? userAgent
            : `${browser.name} ${browser.version} (${os})`;
    }

    use(req: Request, res: Response, next: NextFunction) {
        const start = performance.now();

        res.on('finish', () => {
            const durationMs = performance.now() - start;
            const duration = (durationMs).toFixed(2);
            const method = req.method;
            const path = req.originalUrl;
            const ip = this.formatString(req.ip || req.socket.remoteAddress);
            const origin = this.formatString(req.headers.origin || req.headers.referer);
            const ua = this.formatUA(req.headers['user-agent']);
            const status = res.statusCode;
            const query = JSON.stringify(req.query || {});
            const body = JSON.stringify(req.body || {});
            const resBodySize = res.getHeader('content-length');

            const line = `${method} ${path} ${status} (${resBodySize} bytes) (${duration}ms) | ${ip} | ${origin} | ${ua}`;

            if (status >= 500) {
                this.logger.error(`${line} | query: ${query} | body: ${body}`);
            } else if (status >= 400 || durationMs > 200 || this.isVerbose) {
                this.logger.warn(`${line} | query: ${query} | body: ${body}`);
            } else {
                this.logger.log(`${line} | query: ${query}`);
            }
        });

        next();
    }
}