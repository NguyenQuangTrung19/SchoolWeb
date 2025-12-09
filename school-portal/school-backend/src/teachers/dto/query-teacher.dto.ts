// src/teachers/dto/query-teacher.dto.ts
import { IsOptional, IsString } from 'class-validator';
import { PaginationDto } from '../../common/dto/pagination.dto';

export class QueryTeacherDto extends PaginationDto {
  @IsOptional()
  @IsString()
  search?: string; // search theo mã, tên, SĐT, CMND

  @IsOptional()
  @IsString()
  subject?: string; // "ALL" hoặc "Toán" ...

  @IsOptional()
  @IsString()
  status?: string; // "ALL" | "ACTIVE" | "INACTIVE"
}
