import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ActivityLog } from '../../domain/entities/activity-log.entity';
import { RecordProgressDto } from '../../presentation/dto/progress.dto';
import { UsersService } from './users.service';

@Injectable()
export class ProgressService {
  constructor(
    @InjectRepository(ActivityLog)
    private readonly activityRepo: Repository<ActivityLog>,
    private usersService: UsersService,
  ) {}

  async record(userId: string, dto: RecordProgressDto): Promise<ActivityLog> {
    const user = await this.usersService.findById(userId);
    if (!user) throw new NotFoundException('Usuario nao encontrado');

    const log = this.activityRepo.create({
      userId,
      workoutPlanId: dto.workoutPlanId,
      exerciseName: dto.exerciseName,
      date: new Date(dto.date),
      setsCompleted: dto.setsCompleted ?? 0,
      repsCompleted: dto.repsCompleted ?? 0,
      weightLifted: dto.weightLifted,
      notes: dto.notes,
      caloriesBurned: dto.caloriesBurned,
      setFeelings: dto.setFeelings,
    });
    return this.activityRepo.save(log);
  }

  async getByUser(userId: string, days = 30): Promise<ActivityLog[]> {
    const since = new Date();
    since.setDate(since.getDate() - days);
    return this.activityRepo.find({
      where: { userId },
      order: { date: 'DESC' },
    });
  }

  async getRecentFeedback(userId: string, days = 14): Promise<ActivityLog[]> {
    const since = new Date();
    since.setDate(since.getDate() - days);
    const logs = await this.activityRepo.find({
      where: { userId },
      order: { date: 'DESC' },
      take: 80,
    });
    return logs.filter((l) => new Date(l.date) >= since && l.setFeelings?.length);
  }

  async getStats(userId: string, days = 7) {
    const logs = await this.getByUser(userId, days);
    const workoutsCompleted = new Set(
      logs.map((l) => `${(typeof l.date === 'string' ? new Date(l.date) : l.date).toISOString().slice(0, 10)}-${l.exerciseName}`),
    ).size;
    const totalCalories = logs.reduce((s, l) => s + (l.caloriesBurned ?? 0), 0);
    const exercisesCompleted = logs.reduce((s, l) => s + l.repsCompleted, 0);

    return {
      workoutsCompleted,
      totalCalories,
      exercisesCompleted,
      activityCount: logs.length,
    };
  }
}
