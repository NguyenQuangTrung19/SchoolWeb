// src/teachers/teachers.service.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TeacherEntity } from './entities/teacher.entity';
import { CreateTeacherDto } from './dto/create-teacher.dto';
import { UpdateTeacherDto } from './dto/update-teacher.dto';
import { QueryTeacherDto } from './dto/query-teacher.dto';

@Injectable()
export class TeachersService {
  constructor(
    @InjectRepository(TeacherEntity)
    private readonly repo: Repository<TeacherEntity>,
  ) {}

  async findAll(query: QueryTeacherDto) {
    const {
      page = 0,
      pageSize = 10,
      search = '',
      subject = 'ALL',
      status = 'ALL',
    } = query;

    const qb = this.repo.createQueryBuilder('t');

    if (search) {
      qb.andWhere(
        '(t.id LIKE :search OR t.full_name LIKE :search OR t.phone LIKE :search OR t.citizen_id LIKE :search OR t.main_subject LIKE :search)',
        { search: `%${search}%` },
      );
    }

    if (subject !== 'ALL') {
      qb.andWhere('t.main_subject = :subject', { subject });
      // nếu muốn ignore case:
      // qb.andWhere("LOWER(t.main_subject) = LOWER(:subject)", { subject });
    }

    if (status !== 'ALL') {
      qb.andWhere('t.status = :status', { status });
    }

    qb.orderBy('t.id', 'ASC')
      .skip(page * pageSize)
      .take(pageSize);

    const [data, total] = await qb.getManyAndCount();
    return { data, total };
  }

  async findOne(id: string) {
    return this.repo.findOne({ where: { id } });
  }

  async create(dto: CreateTeacherDto) {
    const entity = this.repo.create(dto);
    return this.repo.save(entity);
  }

  async update(id: string, dto: UpdateTeacherDto) {
    await this.repo.update(id, dto);
    return this.findOne(id);
  }

  async remove(id: string) {
    await this.repo.delete(id);
    return { success: true };
  }
}
