import {
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class CreateStudentDto {
  @IsString()
  @MaxLength(20)
  id: string; // cho phép FE tự nhập HS001, hoặc sau này backend auto-gen

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
  guardian_citizen_id?: string;

  @IsOptional()
  @IsEnum(['ACTIVE', 'INACTIVE'])
  status?: 'ACTIVE' | 'INACTIVE';

  @IsOptional()
  @IsString()
  note?: string;
}
