// src/scores/dto/upsert-score.dto.ts
import {
  IsString,
  IsInt,
  IsOptional,
  IsNumber,
  Min,
  Max,
  IsIn,
  IsDateString,
} from 'class-validator';
import { Type } from 'class-transformer';

export class UpsertScoreDto {
  @IsString()
  studentId: string; // "HS001"

  @IsInt()
  @Type(() => Number)
  class_subject_id: number;

  @IsString()
  @IsIn(['oral', 'quiz', 'mid', 'final'])
  type: 'oral' | 'quiz' | 'mid' | 'final';

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @Max(10)
  score?: number | null;

  @IsOptional()
  @IsDateString()
  date?: string;
}
