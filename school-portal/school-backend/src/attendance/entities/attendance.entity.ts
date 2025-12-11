// src/attendance/attendance.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Unique,
} from 'typeorm';

export enum AttendanceStatus {
  PRESENT = 'PRESENT',
  ABSENT = 'ABSENT',
  LATE = 'LATE',
  EXCUSED = 'EXCUSED',
}

@Entity('attendance')
@Unique('uq_attendance_student_class_date', ['studentId', 'classId', 'date'])
export class Attendance {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'studentId', type: 'varchar', length: 20 })
  studentId: string; // FK -> students.id

  @Column({ name: 'classId', type: 'int' })
  classId: number; // FK -> classes.id

  @Column({ type: 'date' })
  date: string;

  @Column({
    type: 'enum',
    enum: AttendanceStatus,
    default: AttendanceStatus.PRESENT,
  })
  status: AttendanceStatus;

  @CreateDateColumn({ name: 'createdAt', type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updatedAt', type: 'timestamp' })
  updatedAt: Date;
}
