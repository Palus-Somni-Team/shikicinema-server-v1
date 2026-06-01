import { Injectable, Logger } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale/ru';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class AlertService {
    private readonly logger = new Logger('ALERT MAILER');

    constructor(private readonly mailer: MailerService) {}

    async error(context: string, message: string, error: any): Promise<void> {
        const uuid = uuidv4();

        this.logger.error(`[${uuid}] ${message}`, error);

        const text = [
            `ID: ${uuid}`,
            `Контекст: ${context}`,
            `Сообщение: ${message}`,
            `Время: ${format(Date.now(), 'do MMMM y, HH:mm:ss 0', { locale: ru })}`,
            `Окружение: ${process.env.NODE_ENV || 'development'}`,
        ].join('\n');

        try {
            await this.mailer.sendMail({
                to: process.env.ALERT_EMAIL,
                subject: `[Shikicinema API v1] Инцидент`,
                text,
            });

            this.logger.log(`Incident ${uuid} mail sent`);
        } catch (err) {
            this.logger.error('Failed to send alert email', err);
        }
    }
}
