import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { UploaderService } from './uploader.service';
import { UploadTokenEntity } from '../entities';
import { UploaderEntity } from '../entities/uploader.entity';

@Module({
  imports:[
    TypeOrmModule.forFeature([
      UploaderEntity,
      UploadTokenEntity,
    ]),
  ],
  providers: [UploaderService],
  exports :[TypeOrmModule, UploaderService],
})
export class UploaderModule {}
