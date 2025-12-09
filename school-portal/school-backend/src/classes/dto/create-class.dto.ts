import {
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class CreateClassDto {
  @IsString()
  @MaxLength(100)
  name: string;

  @IsInt()
  grade: number;

  @IsInt()
  year_start: number;

  @IsInt()
  year_end: number;

  @IsOptional()
  @IsString()
  homeroom_teacher_id?: string;

  @IsOptional()
  @IsString()
  homeroom_teacher_name?: string;

  @IsOptional()
  @IsInt()
  capacity?: number;

  @IsOptional()
  @IsInt()
  total_students?: number;

  @IsOptional()
  @IsInt()
  boys_count?: number;

  @IsOptional()
  @IsInt()
  girls_count?: number;

  @IsOptional()
  @IsEnum(['ACTIVE', 'INACTIVE'])
  status?: 'ACTIVE' | 'INACTIVE';
}
