// src/subjects/dto/query-subject.dto.ts
import { IsOptional, IsString } from 'class-validator';
import { PaginationDto } from '../../common/dto/pagination.dto';

export class QuerySubjectDto extends PaginationDto {
  @IsOptional()
  @IsString()
  search?: string; // tìm theo tên / code

  @IsOptional()
  @IsString()
  grade?: string; // "ALL" hoặc "10", "11"...
}
