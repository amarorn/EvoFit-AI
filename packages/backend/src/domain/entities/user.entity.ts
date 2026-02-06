import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum FitnessLevel {
  BEGINNER = 'beginner',
  INTERMEDIATE = 'intermediate',
  ADVANCED = 'advanced',
}

export enum UserGoal {
  WEIGHT_LOSS = 'weight_loss',
  MUSCLE_GAIN = 'muscle_gain',
  ENDURANCE = 'endurance',
  GENERAL = 'general',
}

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column()
  passwordHash: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  age?: number;

  @Column({ nullable: true })
  gender?: string;

  @Column({ type: 'float', nullable: true })
  weight?: number;

  @Column({ type: 'float', nullable: true })
  height?: number;

  @Column({ default: FitnessLevel.BEGINNER })
  fitnessLevel: FitnessLevel;

  @Column({ type: 'simple-array', nullable: true })
  goals?: string[];

  @Column({ type: 'text', nullable: true })
  injuriesOrLimitations?: string;

  @Column({ type: 'int', nullable: true })
  trainingDaysPerWeek?: number;

  @Column({ type: 'int', nullable: true })
  sessionMinutes?: number;

  @Column({ type: 'varchar', length: 20, nullable: true })
  trainingLocation?: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
