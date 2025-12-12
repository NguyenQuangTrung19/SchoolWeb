// src/teachers/dto/create-teacher.dto.ts
import {
  IsEmail,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  MaxLength,
  IsDate,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateTeacherDto {
  @IsOptional()
  @IsString()
  @MaxLength(20)
  id?: string;

  @IsOptional()
  @IsInt()
  userid?: number;

  @IsOptional()
  @IsString()
  username?: string;

  @IsString()
  @MaxLength(100)
  fullname: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  dob?: string;

  @IsOptional()
  @IsIn(['M', 'F', 'O'])
  gender?: 'M' | 'F' | 'O';

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsString()
  citizenid?: string;

  @IsOptional()
  @IsString()
  mainsubject?: string;

  @IsOptional()
  @IsIn(['ACTIVE', 'INACTIVE'])
  status?: 'ACTIVE' | 'INACTIVE';

  @IsOptional()
  @IsString()
  note?: string;
  // user_name: string;
}
