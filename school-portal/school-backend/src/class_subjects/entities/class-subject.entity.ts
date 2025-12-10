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

  @Column({ name: 'class_id', type: 'int' })
  classId: number;

  @Column({ name: 'subject_id', type: 'int' })
  subjectId: number;

  @Column({ name: 'teacher_id', type: 'varchar', length: 20 })
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
