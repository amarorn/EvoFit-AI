import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { WorkoutPlan, ExerciseData } from '../../domain/entities/workout.entity';
import { AIService } from '../../infrastructure/ai/ai.service';
import { UsersService } from './users.service';
import { ProgressService } from './progress.service';
import { GenerateWorkoutWithAssessmentDto } from '../../presentation/dto/assessment.dto';
import { UserProfileForAI } from '../../infrastructure/ai/ai.service';

const MUSCLE_GROUP_LABELS: Record<string, string> = {
  'Full Body': 'Corpo inteiro',
  'Upper Body': 'Tronco',
  'Lower Body': 'Pernas',
  'Legs': 'Pernas',
  'Push (Chest/Shoulders/Triceps)': 'Empurrar (Peito/Ombros/Triceps)',
  'Pull (Back/Biceps)': 'Puxar (Costas/Biceps)',
  'Chest': 'Peito',
  'Back': 'Costas',
  'Shoulders': 'Ombros',
  'Arms': 'Bracos',
  'Biceps': 'Biceps',
  'Triceps': 'Triceps',
  'Core': 'Core',
};

function toDayLabel(dayNumber: number, muscleGroup: string): string {
  const label = MUSCLE_GROUP_LABELS[muscleGroup] ?? muscleGroup;
  return `Dia ${dayNumber} - ${label}`;
}

function buildFeedbackSummary(logs: { exerciseName: string; setFeelings?: string[] }[]): string {
  if (logs.length === 0) return '';
  const byExercise: Record<string, string[]> = {};
  for (const log of logs) {
    if (!log.setFeelings?.length) continue;
    if (!byExercise[log.exerciseName]) byExercise[log.exerciseName] = [];
    byExercise[log.exerciseName].push(...log.setFeelings);
  }
  const parts: string[] = [];
  for (const [ex, feelings] of Object.entries(byExercise)) {
    const hard = feelings.filter((f) => f === 'hard' || f === 'very_hard').length;
    const easy = feelings.filter((f) => f === 'easy').length;
    if (hard > easy) parts.push(`${ex}: felt hard`);
    else if (easy > hard) parts.push(`${ex}: felt easy`);
  }
  return parts.join('; ') || '';
}

@Injectable()
export class WorkoutsService {
  constructor(
    @InjectRepository(WorkoutPlan)
    private readonly workoutRepo: Repository<WorkoutPlan>,
    private usersService: UsersService,
    private progressService: ProgressService,
    private aiService: AIService,
  ) {}

  async generate(userId: string): Promise<WorkoutPlan> {
    const user = await this.usersService.findById(userId);
    if (!user) throw new NotFoundException('Usuario nao encontrado');

    const feedbackLogs = await this.progressService.getRecentFeedback(userId, 14);
    const recentFeedback = buildFeedbackSummary(feedbackLogs);

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
      recentFeedback: recentFeedback || undefined,
    };

    const daily = await this.aiService.generateWorkoutByDays(profile);
    const dailyWorkouts = daily.map((d) => ({
      dayNumber: d.dayNumber,
      weekday: toDayLabel(d.dayNumber, d.muscleGroup),
      exercises: d.exercises,
    }));
    const exercises = daily.flatMap((d) => d.exercises);

    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + 7);

    const plan = this.workoutRepo.create({
      userId,
      title: `Plano Semanal - ${startDate.toLocaleDateString('pt-BR')}`,
      startDate,
      endDate,
      exercises,
      dailyWorkouts,
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

    const feedbackLogs = await this.progressService.getRecentFeedback(userId, 14);
    profile.recentFeedback = buildFeedbackSummary(feedbackLogs) || undefined;

    const daily = await this.aiService.generateWorkoutByDays(profile);
    const dailyWorkouts = daily.map((d) => ({
      dayNumber: d.dayNumber,
      weekday: toDayLabel(d.dayNumber, d.muscleGroup),
      exercises: d.exercises,
    }));
    const exercises = daily.flatMap((d) => d.exercises);

    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + 7);

    const plan = this.workoutRepo.create({
      userId,
      title: `Plano Personalizado - ${startDate.toLocaleDateString('pt-BR')}`,
      startDate,
      endDate,
      exercises,
      dailyWorkouts,
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
