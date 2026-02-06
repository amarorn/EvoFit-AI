import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from './user.entity';

export enum WorkoutStatus {
  ACTIVE = 'active',
  COMPLETED = 'completed',
}

export interface ExerciseData {
  name: string;
  description?: string;
  sets: number;
  reps: number;
  restTimeSeconds: number;
}

export interface DailyWorkout {
  dayNumber: number;
  weekday: string;
  exercises: ExerciseData[];
}

@Entity('workout_plans')
export class WorkoutPlan {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column()
  title: string;

  @Column({ type: 'date' })
  startDate: Date;

  @Column({ type: 'date' })
  endDate: Date;

  @Column({ default: WorkoutStatus.ACTIVE })
  status: WorkoutStatus;

  @Column({ type: 'jsonb', nullable: true })
  exercises: ExerciseData[];

  @Column({ type: 'jsonb', nullable: true })
  dailyWorkouts?: { dayNumber: number; weekday: string; exercises: ExerciseData[] }[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
