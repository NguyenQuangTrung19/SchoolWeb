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

  @Column({ type: 'int', nullable: true })
  userid: number | null;

  @Column({ type: 'varchar', length: 100 })
  fullname: string;

  @Column({ type: 'date', nullable: true })
  dob: Date | null;

  @Column({
    type: 'enum',
    enum: ['M', 'F', 'O'],
    default: 'M',
  })
  gender: 'M' | 'F' | 'O';

  @Column({ type: 'varchar', length: 255, nullable: true })
  address: string | null;

  @Column({ type: 'varchar', length: 20, nullable: true })
  phone: string | null;

  @Column({ type: 'varchar', length: 20, nullable: true })
  citizenid: string | null;

  @Column({ type: 'varchar', length: 100, nullable: true })
  mainsubject: string | null;

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
