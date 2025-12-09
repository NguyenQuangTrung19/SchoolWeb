import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { StudentEntity } from './entities/student.entity';
import { CreateStudentDto } from './dto/create-student.dto';
import { UpdateStudentDto } from './dto/update-student.dto';
import { QueryStudentDto } from './dto/query-student.dto';

@Injectable()
export class StudentsService {
  constructor(
    @InjectRepository(StudentEntity)
    private readonly repo: Repository<StudentEntity>,
  ) {}

  async findAll(query: QueryStudentDto) {
    const {
      page = 0,
      pageSize = 10,
      search = '',
      classId = 'ALL',
      status = 'ALL',
    } = query;

    const qb = this.repo.createQueryBuilder('s');

    if (search) {
      qb.andWhere(
        '(s.id LIKE :search OR s.full_name LIKE :search OR s.guardian_name LIKE :search OR s.guardian_phone LIKE :search)',
        { search: `%${search}%` },
      );
    }

    if (classId !== 'ALL') {
      qb.andWhere('s.current_class_id = :classId', {
        classId: Number(classId),
      });
    }

    if (status !== 'ALL') {
      qb.andWhere('s.status = :status', { status });
    }

    qb.orderBy('s.id', 'ASC')
      .skip(page * pageSize)
      .take(pageSize);

    const [data, total] = await qb.getManyAndCount();
    return { data, total };
  }

  async findOne(id: string) {
    return this.repo.findOne({ where: { id } });
  }

  async create(dto: CreateStudentDto) {
    const entity = this.repo.create(dto);
    return this.repo.save(entity);
  }

  async update(id: string, dto: UpdateStudentDto) {
    await this.repo.update(id, dto);
    return this.findOne(id);
  }

  async remove(id: string) {
    await this.repo.delete(id);
    return { success: true };
  }
}
