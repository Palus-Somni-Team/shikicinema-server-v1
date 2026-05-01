import { Module } from '@nestjs/common';
import { VideosModule } from './videos/videos.module';
import { StatusModule } from './status/status.module';

@Module({
  imports: [VideosModule, StatusModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
