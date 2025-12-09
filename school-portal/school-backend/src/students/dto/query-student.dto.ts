import { IsOptional, IsString } from 'class-validator';
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
}
