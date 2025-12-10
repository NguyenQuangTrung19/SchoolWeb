// src/attendance/dto/save-attendance-bulk.dto.ts

import {
  IsInt,
  IsDateString,
  ValidateNested,
  IsString,
  IsIn,
  ArrayNotEmpty,
} from 'class-validator';
import { Type } from 'class-transformer';

class AttendanceItemDto {
  @IsString()
  studentId: string; // "HS001"

  @IsString()
  @IsIn(['PRESENT', 'ABSENT', 'LATE', 'EXCUSED'])
  status: 'PRESENT' | 'ABSENT' | 'LATE' | 'EXCUSED';
}

export class SaveAttendanceBulkDto {
  @IsInt()
  @Type(() => Number)
  classId: number;

  @IsDateString()
  date: string;

  @ArrayNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => AttendanceItemDto)
  items: AttendanceItemDto[];
}
