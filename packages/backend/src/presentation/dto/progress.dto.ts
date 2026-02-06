import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsDateString, IsNotEmpty, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class RecordProgressDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  workoutPlanId: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  exerciseName: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsDateString()
  date: string;

  @ApiPropertyOptional({ default: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  setsCompleted?: number;

  @ApiPropertyOptional({ default: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  repsCompleted?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(0)
  weightLifted?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(0)
  caloriesBurned?: number;

  @ApiPropertyOptional({ description: 'Sentimento por serie: easy, ok, hard, very_hard', type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  setFeelings?: string[];
}
