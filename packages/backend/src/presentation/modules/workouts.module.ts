import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WorkoutsController } from '../controllers/workouts.controller';
import { WorkoutsService } from '../../application/services/workouts.service';
import { WorkoutPlan } from '../../domain/entities/workout.entity';
import { UsersModule } from './users.module';
import { AIService } from '../../infrastructure/ai/ai.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([WorkoutPlan]),
    UsersModule,
  ],
  controllers: [WorkoutsController],
  providers: [WorkoutsService, AIService],
})
export class WorkoutsModule {}
