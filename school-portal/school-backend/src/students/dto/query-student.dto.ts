// src/students/dto/query-student.dto.ts
import { IsIn, IsOptional, IsString } from 'class-validator';
import { PaginationDto } from '../../common/dto/pagination.dto';

export class QueryStudentDto extends PaginationDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsString()
  classId?: string; // "ALL" hoặc "1"

  @IsOptional()
  @IsString()
  status?: string; // "ALL", "ACTIVE", "INACTIVE"

  @IsOptional()
  @IsIn(['0', '1', 'true', 'false'])
  includePassword?: string;
}
