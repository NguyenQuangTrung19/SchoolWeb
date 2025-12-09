// src/teachers/dto/create-teacher.dto.ts
import {
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class CreateTeacherDto {
  @IsString()
  @MaxLength(20)
  id: string; // mã GV

  @IsOptional()
  @IsInt()
  user_id?: number;

  @IsString()
  @MaxLength(100)
  full_name: string;

  @IsOptional()
  @IsString()
  dob?: string; // "YYYY-MM-DD"

  @IsOptional()
  @IsEnum(['M', 'F', 'O'])
  gender?: 'M' | 'F' | 'O';

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  citizen_id?: string;

  @IsOptional()
  @IsString()
  main_subject?: string;

  @IsOptional()
  @IsEnum(['ACTIVE', 'INACTIVE'])
  status?: 'ACTIVE' | 'INACTIVE';

  @IsOptional()
  @IsString()
  note?: string;
}
