import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { StudiosService } from './studios.service';
import { StudiosController } from './studios.controller';
import { StudioEntity } from '../entities';

@Module({
    imports: [
        TypeOrmModule.forFeature([StudioEntity])
    ],
    controllers: [StudiosController],
    providers: [StudiosService],
})
export class StudiosModule {}
