import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../domain/entities/user.entity';
import { UpdateProfileDto } from '../../presentation/dto/user.dto';
import { FitnessLevel } from '../../domain/entities/user.entity';
import { GenerateWorkoutWithAssessmentDto } from '../../presentation/dto/assessment.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {}

  async findById(id: string): Promise<User | null> {
    return this.userRepo.findOne({ where: { id } });
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.userRepo.findOne({ where: { email: email.toLowerCase() } });
  }

  async create(data: {
    email: string;
    passwordHash: string;
    name: string;
  }): Promise<User> {
    const user = this.userRepo.create({
      ...data,
      email: data.email.toLowerCase(),
      fitnessLevel: FitnessLevel.BEGINNER,
    });
    return this.userRepo.save(user);
  }

  async updateProfile(id: string, dto: UpdateProfileDto): Promise<User> {
    const user = await this.findById(id);
    if (!user) throw new NotFoundException('Usuario nao encontrado');

    Object.assign(user, {
      ...dto,
      fitnessLevel: (dto.fitnessLevel as unknown as FitnessLevel) ?? user.fitnessLevel,
    });
    return this.userRepo.save(user);
  }

  async saveAssessment(id: string, dto: GenerateWorkoutWithAssessmentDto): Promise<User> {
    const user = await this.findById(id);
    if (!user) throw new NotFoundException('Usuario nao encontrado');

    const updates: Partial<User> = {};
    if (dto.age !== undefined) updates.age = dto.age;
    if (dto.gender !== undefined) updates.gender = dto.gender;
    if (dto.weight !== undefined) updates.weight = dto.weight;
    if (dto.height !== undefined) updates.height = dto.height;
    if (dto.fitnessLevel !== undefined) updates.fitnessLevel = dto.fitnessLevel as unknown as FitnessLevel;
    if (dto.goals !== undefined) updates.goals = dto.goals;
    if (dto.injuriesOrLimitations !== undefined) updates.injuriesOrLimitations = dto.injuriesOrLimitations;
    if (dto.trainingDaysPerWeek !== undefined) updates.trainingDaysPerWeek = dto.trainingDaysPerWeek;
    if (dto.sessionMinutes !== undefined) updates.sessionMinutes = dto.sessionMinutes;
    if (dto.trainingLocation !== undefined) updates.trainingLocation = dto.trainingLocation;

    Object.assign(user, updates);
    return this.userRepo.save(user);
  }

  toPublic(user: User) {
    const { passwordHash, ...rest } = user;
    return rest;
  }
}
