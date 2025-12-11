// src/scores/score.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Unique,
} from 'typeorm';

export enum ScoreType {
  ORAL = 'oral',
  QUIZ = 'quiz',
  MID = 'mid',
  FINAL = 'final',
}

@Entity('scores')
@Unique('uq_score_student_class_type', ['studentId', 'classSubjectId', 'type'])
export class Score {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'studentId', type: 'varchar', length: 20 })
  studentId: string; // FK -> students.id (HS001)

  @Column({ name: 'class_subject_id', type: 'int' })
  classSubjectId: number; // FK -> class_subjects.id

  @Column({
    type: 'enum',
    enum: ScoreType,
  })
  type: ScoreType;

  @Column({
    type: 'decimal',
    precision: 4,
    scale: 2,
    nullable: true,
  })
  score: number | null;

  @Column({ type: 'date', nullable: true })
  date: string | null;

  @CreateDateColumn({ name: 'createdAt', type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updatedAt', type: 'timestamp' })
  updatedAt: Date;
}
