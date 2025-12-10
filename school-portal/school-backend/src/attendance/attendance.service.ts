// src/attendance/attendance.service.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Attendance, AttendanceStatus } from './entities/attendance.entity';
import { SaveAttendanceBulkDto } from './dto/save-attendance-bulk.dto';

@Injectable()
export class AttendanceService {
  constructor(
    @InjectRepository(Attendance)
    private readonly attRepo: Repository<Attendance>,
  ) {}

  // GET /attendance/class/:classId/date/:date
  async getByClassAndDate(
    classId: number,
    date: string,
  ): Promise<Attendance[]> {
    return this.attRepo.find({
      where: { classId, date },
      order: { studentId: 'ASC' },
    });
  }

  // POST /attendance/bulk
  // Logic:
  //   1. Xoá hết record cũ của (class_id, date)
  //   2. Insert lại tất cả items mới
  async saveBulk(dto: SaveAttendanceBulkDto): Promise<{ success: boolean }> {
    const { classId, date, items } = dto;

    // Xoá attendance cũ
    await this.attRepo.delete({ classId: classId, date });

    // Tạo mới
    const entities: Attendance[] = items.map((it) =>
      this.attRepo.create({
        studentId: it.studentId,
        classId: classId,
        date,
        status: it.status as AttendanceStatus,
      }),
    );

    await this.attRepo.save(entities);

    return { success: true };
  }

  // (Tuỳ chọn) CRUD khác nếu cần dùng ở admin / thống kê

  async findAll(): Promise<Attendance[]> {
    return this.attRepo.find();
  }

  async remove(id: number): Promise<void> {
    await this.attRepo.delete(id);
  }
}
