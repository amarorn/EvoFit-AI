import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { WorkoutPlan } from '../../domain/entities/workout.entity';
import { AIService } from '../../infrastructure/ai/ai.service';
import { UsersService } from './users.service';
import { GenerateWorkoutWithAssessmentDto } from '../../presentation/dto/assessment.dto';
import { UserProfileForAI } from '../../infrastructure/ai/ai.service';

@Injectable()
export class WorkoutsService {
  constructor(
    @InjectRepository(WorkoutPlan)
    private readonly workoutRepo: Repository<WorkoutPlan>,
    private usersService: UsersService,
    private aiService: AIService,
  ) {}

  async generate(userId: string): Promise<WorkoutPlan> {
    const user = await this.usersService.findById(userId);
    if (!user) throw new NotFoundException('Usuario nao encontrado');

    const profile: UserProfileForAI = {
      age: user.age,
      fitnessLevel: user.fitnessLevel,
      goals: user.goals,
      weight: user.weight,
      height: user.height,
      injuriesOrLimitations: user.injuriesOrLimitations,
      trainingDaysPerWeek: user.trainingDaysPerWeek,
      sessionMinutes: user.sessionMinutes,
      trainingLocation: user.trainingLocation,
    };

    const exercises = await this.aiService.generateWorkout(profile);

    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + 7);

    const plan = this.workoutRepo.create({
      userId,
      title: `Plano Semanal - ${startDate.toLocaleDateString('pt-BR')}`,
      startDate,
      endDate,
      exercises,
    });
    return this.workoutRepo.save(plan);
  }

  async generateWithAssessment(userId: string, dto: GenerateWorkoutWithAssessmentDto): Promise<WorkoutPlan> {
    const user = await this.usersService.findById(userId);
    if (!user) throw new NotFoundException('Usuario nao encontrado');

    await this.usersService.saveAssessment(userId, dto);

    const profile: UserProfileForAI = {
      age: dto.age ?? user.age,
      fitnessLevel: dto.fitnessLevel ?? user.fitnessLevel,
      goals: dto.goals?.length ? dto.goals : user.goals,
      weight: dto.weight ?? user.weight,
      height: dto.height ?? user.height,
      injuriesOrLimitations: dto.injuriesOrLimitations ?? user.injuriesOrLimitations,
      trainingDaysPerWeek: dto.trainingDaysPerWeek ?? user.trainingDaysPerWeek,
      sessionMinutes: dto.sessionMinutes ?? user.sessionMinutes,
      trainingLocation: dto.trainingLocation ?? user.trainingLocation,
    };

    const exercises = await this.aiService.generateWorkout(profile);

    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + 7);

    const plan = this.workoutRepo.create({
      userId,
      title: `Plano Personalizado - ${startDate.toLocaleDateString('pt-BR')}`,
      startDate,
      endDate,
      exercises,
    });
    return this.workoutRepo.save(plan);
  }

  async findByUser(userId: string): Promise<WorkoutPlan[]> {
    return this.workoutRepo.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
  }

  async findById(id: string, userId: string): Promise<WorkoutPlan> {
    const plan = await this.workoutRepo.findOne({ where: { id, userId } });
    if (!plan) throw new NotFoundException('Treino nao encontrado');
    return plan;
  }

  async delete(id: string, userId: string): Promise<void> {
    const plan = await this.workoutRepo.findOne({ where: { id, userId } });
    if (!plan) throw new NotFoundException('Treino nao encontrado');
    await this.workoutRepo.remove(plan);
  }
}
