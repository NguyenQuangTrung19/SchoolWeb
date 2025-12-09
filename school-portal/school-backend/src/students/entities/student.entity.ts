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
  id: string; // "HS001"

  @Column({ type: 'int', nullable: true })
  user_id: number | null;

  @Column({ type: 'varchar', length: 100 })
  full_name: string;

  @Column({ type: 'date', nullable: true })
  dob: Date | null;

  @Column({
    type: 'enum',
    enum: ['M', 'F', 'O'],
    default: 'O',
  })
  gender: 'M' | 'F' | 'O';

  @Column({ type: 'varchar', length: 255, nullable: true })
  address: string | null;

  @Column({ type: 'int', nullable: true })
  current_class_id: number | null;

  @ManyToOne(() => ClassEntity, (cls) => cls.students, { nullable: true })
  @JoinColumn({ name: 'current_class_id' })
  currentClass?: ClassEntity;

  @Column({ type: 'varchar', length: 100, nullable: true })
  guardian_name: string | null;

  @Column({ type: 'varchar', length: 20, nullable: true })
  guardian_phone: string | null;

  @Column({ type: 'varchar', length: 100, nullable: true })
  guardian_job: string | null;

  @Column({ type: 'varchar', length: 20, nullable: true })
  guardian_citizen_id: string | null;

  @Column({
    type: 'enum',
    enum: ['ACTIVE', 'INACTIVE'],
    default: 'ACTIVE',
  })
  status: 'ACTIVE' | 'INACTIVE';

  @Column({ type: 'text', nullable: true })
  note: string | null;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
