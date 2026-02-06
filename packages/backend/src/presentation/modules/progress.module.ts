import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProgressController } from '../controllers/progress.controller';
import { ProgressService } from '../../application/services/progress.service';
import { ActivityLog } from '../../domain/entities/activity-log.entity';
import { UsersModule } from './users.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([ActivityLog]),
    UsersModule,
  ],
  controllers: [ProgressController],
  providers: [ProgressService],
  exports: [ProgressService],
})
export class ProgressModule {}
