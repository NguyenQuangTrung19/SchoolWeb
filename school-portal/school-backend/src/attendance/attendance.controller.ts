// src/attendance/attendance.controller.ts
import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  ParseIntPipe,
} from '@nestjs/common';
import { AttendanceService } from './attendance.service';
import { SaveAttendanceBulkDto } from './dto/save-attendance-bulk.dto';

@Controller('attendance')
export class AttendanceController {
  constructor(private readonly attendanceService: AttendanceService) {}

  // GET /attendance/class/:classId/date/:date
  @Get('class/:classId/date/:date')
  getByClassAndDate(
    @Param('classId', ParseIntPipe) classId: number,
    @Param('date') date: string, // "2025-12-09"
  ) {
    return this.attendanceService.getByClassAndDate(classId, date);
  }

  // POST /attendance/bulk
  @Post('bulk')
  saveBulk(@Body() dto: SaveAttendanceBulkDto) {
    return this.attendanceService.saveBulk(dto);
  }
}
