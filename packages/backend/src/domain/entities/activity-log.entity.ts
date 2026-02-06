import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from './user.entity';

@Entity('activity_logs')
export class ActivityLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column()
  workoutPlanId: string;

  @Column()
  exerciseName: string;

  @Column({ type: 'date' })
  date: Date;

  @Column({ default: 0 })
  setsCompleted: number;

  @Column({ default: 0 })
  repsCompleted: number;

  @Column({ type: 'float', nullable: true })
  weightLifted?: number;

  @Column({ type: 'text', nullable: true })
  notes?: string;

  @Column({ type: 'int', nullable: true })
  caloriesBurned?: number;

  @CreateDateColumn()
  createdAt: Date;
}
