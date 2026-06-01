import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MailerModule as NestMailerModule } from '@nestjs-modules/mailer';

@Module({
    imports: [
        NestMailerModule.forRootAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: (config: ConfigService) => ({
                transport: {
                    host: config.get<string>('SMTP_HOST'),
                    port: config.get<number>('SMTP_PORT'),
                    secure: true,
                    auth: {
                        user: config.get<string>('SMTP_USER'),
                        pass: config.get<string>('SMTP_PASS'),
                    },
                },
                defaults: {
                    from: config.get<string>('SMTP_FROM'),
                },
                tls: {
                    rejectUnauthorized: true,
                    minVersion: 'TLSv1.2',
                },
            }),
        }),
    ],
    exports: [NestMailerModule],
})
export class MailerModule {}
