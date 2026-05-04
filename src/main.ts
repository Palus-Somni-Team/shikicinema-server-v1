import { NestFactory } from '@nestjs/core';

import { AppModule } from './app.module';
import { addGlobal } from './add-global';

async function bootstrap() {
    const app = await NestFactory.create(AppModule);

    addGlobal(app);

    await app.listen(process.env.SHIKICINEMA_API_V1_PORT ?? 8603);
}

void bootstrap();
