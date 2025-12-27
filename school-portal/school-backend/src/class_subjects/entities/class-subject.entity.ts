// src/class_subjects/entities/class-subject.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Unique,
} from 'typeorm';

export enum ClassSubjectStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
}

@Entity('class_subjects')
@Unique('uq_class_subject_teacher', ['classId', 'subjectId', 'teacherId'])
export class ClassSubject {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'classId', type: 'int' })
  classId: number;

  @Column({ name: 'subjectId', type: 'int' })
  subjectId: number;

  @Column({ name: 'teacherId', type: 'varchar', length: 20 })
  teacherId: string;

  @Column({ name: 'weekly_lessons', type: 'int', nullable: true })
  weeklyLessons: number | null;

  @Column({ type: 'varchar', length: 50, nullable: true })
  room: string | null;

  @Column({
    type: 'enum',
    enum: ClassSubjectStatus,
    default: ClassSubjectStatus.ACTIVE,
  })
  status: ClassSubjectStatus;

  @CreateDateColumn({ name: 'createdAt', type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updatedAt', type: 'timestamp' })
  updatedAt: Date;
}
