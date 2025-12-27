// src/teachers/entities/teacher.entity.ts
import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('teachers')
export class TeacherEntity {
  @PrimaryColumn({ type: 'varchar', length: 20 })
  id: string; // "GV001"

  @Column({ type: 'int' })
  userid: number;

  @Column({ type: 'varchar', length: 100 })
  fullname: string;

  @Column({ type: 'date' })
  dob: Date;

  @Column({ type: 'enum', enum: ['M', 'F', 'O'] })
  gender: 'M' | 'F' | 'O';

  @Column({ type: 'varchar', length: 255, nullable: true })
  address: string | null;

  @Column({ type: 'varchar', length: 20 })
  phone: string;

  @Column({ type: 'varchar', length: 20 })
  citizenid: string;

  @Column({ type: 'varchar', length: 100 })
  mainsubject: string;

  @Column({
    type: 'enum',
    enum: ['ACTIVE', 'INACTIVE'],
    default: 'ACTIVE',
  })
  status: 'ACTIVE' | 'INACTIVE';

  @Column({ type: 'text', nullable: true })
  note: string | null;

  @CreateDateColumn({ name: 'createdAt' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updatedAt' })
  updatedAt: Date;
}
