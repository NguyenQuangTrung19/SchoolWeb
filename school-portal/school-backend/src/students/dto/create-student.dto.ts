// src/students/dto/create-student.dto.ts

import {
  IsEmail,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class CreateStudentDto {
  @IsString()
  @MaxLength(20)
  id: string; // mã HS, ví dụ "HS001"

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
  @IsInt()
  current_class_id?: number;

  @IsOptional()
  @IsString()
  guardian_name?: string;

  @IsOptional()
  @IsString()
  guardian_phone?: string;

  @IsOptional()
  @IsString()
  guardian_job?: string;

  @IsOptional()
  @IsString()
  guardian_citizenid?: string;

  @IsOptional()
  @IsIn(['ACTIVE', 'INACTIVE'])
  status?: 'ACTIVE' | 'INACTIVE';

  @IsOptional()
  @IsString()
  note?: string;
}
