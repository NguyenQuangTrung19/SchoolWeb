// src/students/entities/student.entity.ts
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ClassEntity } from '../../classes/entities/class.entity';

@Entity('students')
export class StudentEntity {
  @PrimaryColumn({ type: 'varchar', length: 20 })
  id: string; // HS001

  @Column({ type: 'int' })
  userid: number; // users.id

  @Column({ type: 'varchar', length: 100 })
  fullname: string;

  @Column({ type: 'date' })
  dob: Date;

  @Column({ type: 'enum', enum: ['M', 'F', 'O'], default: 'O' })
  gender: 'M' | 'F' | 'O';

  @Column({ type: 'varchar', length: 255, nullable: true })
  address: string | null;

  @Column({ type: 'int' })
  current_class_id: number;

  @ManyToOne(() => ClassEntity, (cls) => cls.students, { nullable: true })
  @JoinColumn({ name: 'current_class_id' })
  currentClass?: ClassEntity;

  @Column({ type: 'varchar', length: 100 })
  guardian_name: string;

  @Column({ type: 'varchar', length: 20 })
  guardian_phone: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  guardian_job: string | null;

  @Column({ type: 'varchar', length: 20, nullable: true })
  guardian_citizenid: string | null;

  @Column({
    type: 'enum',
    enum: ['ACTIVE', 'INACTIVE'],
    default: 'ACTIVE',
  })
  status: 'ACTIVE' | 'INACTIVE';

  @Column({ type: 'text', nullable: true })
  note: string | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
