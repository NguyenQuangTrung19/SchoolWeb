// src/materials/dto/create-material.dto.ts
import { IsInt, IsString, IsOptional, IsUrl } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateMaterialDto {
  @IsInt()
  @Type(() => Number)
  class_subject_id: number;

  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  // nếu muốn strict hơn:
  // @IsUrl()
  url?: string;
}
