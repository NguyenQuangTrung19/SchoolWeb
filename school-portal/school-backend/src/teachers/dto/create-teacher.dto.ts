// src/teachers/dto/create-teacher.dto.ts
import {
  IsEmail,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class CreateTeacherDto {
  @IsString()
  @MaxLength(20)
  id: string;

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
  dob?: Date; // "YYYY-MM-DD"

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
  user_name: string;
}
