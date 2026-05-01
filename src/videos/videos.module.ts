import { Logger, Module } from '@nestjs/common';

import { VideosController } from './videos.controller';
import { VideosService } from './videos.service';

@Module({
  controllers: [VideosController],
  providers: [VideosService, Logger],
})
export class VideosModule {}
