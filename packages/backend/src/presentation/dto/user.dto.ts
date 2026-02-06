import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsNumber, IsEnum, IsArray, IsIn, Min, Max } from 'class-validator';

export enum FitnessLevelDto {
  BEGINNER = 'beginner',
  INTERMEDIATE = 'intermediate',
  ADVANCED = 'advanced',
}

export class UpdateProfileDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(14)
  @Max(120)
  age?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  gender?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(30)
  @Max(300)
  weight?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(100)
  @Max(250)
  height?: number;

  @ApiPropertyOptional({ enum: FitnessLevelDto })
  @IsOptional()
  @IsEnum(FitnessLevelDto)
  fitnessLevel?: FitnessLevelDto;

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  goals?: string[];

  @ApiPropertyOptional({ description: 'Lesoes ou limitacoes fisicas' })
  @IsOptional()
  @IsString()
  injuriesOrLimitations?: string;

  @ApiPropertyOptional({ description: 'Dias por semana para treinar (1-7)' })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(7)
  trainingDaysPerWeek?: number;

  @ApiPropertyOptional({ description: 'Tempo disponivel por sessao em minutos' })
  @IsOptional()
  @IsNumber()
  @Min(15)
  @Max(120)
  sessionMinutes?: number;

  @ApiPropertyOptional({ description: 'Local do treino: gym, home, both' })
  @IsOptional()
  @IsString()
  @IsIn(['gym', 'home', 'both'])
  trainingLocation?: string;
}
