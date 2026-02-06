import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ExerciseDto {
  @ApiProperty()
  name: string;

  @ApiPropertyOptional()
  description?: string;

  @ApiPropertyOptional({ default: 3 })
  sets?: number;

  @ApiPropertyOptional({ default: 10 })
  reps?: number;

  @ApiPropertyOptional({ default: 60 })
  restTimeSeconds?: number;
}

export class WorkoutPlanDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  title: string;

  @ApiProperty()
  startDate: string;

  @ApiProperty()
  endDate: string;

  @ApiProperty()
  status: string;

  @ApiPropertyOptional({ type: [ExerciseDto] })
  exercises?: ExerciseDto[];

  @ApiProperty()
  createdAt: string;

  @ApiProperty()
  updatedAt: string;
}
