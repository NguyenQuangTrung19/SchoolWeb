import { IsInt, IsOptional, IsString, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';
import { ClassSubjectStatus } from '../entities/class-subject.entity';

export class CreateClassSubjectDto {
  @IsInt()
  @Type(() => Number)
  classId: number;

  @IsInt()
  @Type(() => Number)
  subjectId: number;

  @IsString()
  teacherId: string;

  @IsOptional()
  @Type(() => Number)
  weekly_lessons?: number;

  @IsOptional()
  @IsString()
  room?: string;

  @IsOptional()
  @IsEnum(ClassSubjectStatus)
  status?: ClassSubjectStatus;
}
