import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { StudentEntity } from '../../students/entities/student.entity';

@Entity('classes')
export class ClassEntity {
  @PrimaryGeneratedColumn()
  id: number; // 1,2,...

  @Column({ type: 'varchar', length: 100 })
  name: string;

  @Column({ type: 'int' })
  grade: number;

  @Column({ type: 'int' })
  year_start: number;

  @Column({ type: 'int' })
  year_end: number;

  @Column({ type: 'varchar', length: 20, nullable: true })
  homeroom_teacher_id: string | null;

  @Column({ type: 'varchar', length: 100, nullable: true })
  homeroom_teacher_name: string | null;

  @Column({ type: 'int', nullable: true })
  capacity: number | null;

  @Column({ type: 'int', default: 0 })
  total_students: number;

  @Column({ type: 'int', default: 0 })
  boys_count: number;

  @Column({ type: 'int', default: 0 })
  girls_count: number;

  @Column({
    type: 'enum',
    enum: ['ACTIVE', 'INACTIVE'],
    default: 'ACTIVE',
  })
  status: 'ACTIVE' | 'INACTIVE';

  @OneToMany(() => StudentEntity, (s) => s.currentClass)
  students?: StudentEntity[];

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
