import { IsOptional, IsString } from 'class-validator';
import { PaginationDto } from '../../common/dto/pagination.dto';

export class QueryClassDto extends PaginationDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsString()
  grade?: string; // "ALL" hoặc "10"

  @IsOptional()
  @IsString()
  status?: string; // "ALL", "ACTIVE", "INACTIVE"
}
