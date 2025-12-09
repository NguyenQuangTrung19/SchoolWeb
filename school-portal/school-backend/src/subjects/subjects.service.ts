// src/subjects/subjects.service.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SubjectEntity } from './entities/subject.entity';
import { CreateSubjectDto } from './dto/create-subject.dto';
import { UpdateSubjectDto } from './dto/update-subject.dto';
import { QuerySubjectDto } from './dto/query-subject.dto';

@Injectable()
export class SubjectsService {
  constructor(
    @InjectRepository(SubjectEntity)
    private readonly repo: Repository<SubjectEntity>,
  ) {}

  async findAll(query: QuerySubjectDto) {
    const { page = 0, pageSize = 10, search = '', grade = 'ALL' } = query;

    const qb = this.repo.createQueryBuilder('s');

    if (search) {
      qb.andWhere('(s.name LIKE :search OR s.code LIKE :search)', {
        search: `%${search}%`,
      });
    }

    if (grade !== 'ALL') {
      qb.andWhere('s.grade = :grade', { grade: Number(grade) });
    }

    qb.orderBy('s.grade', 'ASC')
      .addOrderBy('s.name', 'ASC')
      .skip(page * pageSize)
      .take(pageSize);

    const [data, total] = await qb.getManyAndCount();
    return { data, total };
  }

  async findOne(id: number) {
    return this.repo.findOne({ where: { id } });
  }

  async create(dto: CreateSubjectDto) {
    const entity = this.repo.create(dto);
    return this.repo.save(entity);
  }

  async update(id: number, dto: UpdateSubjectDto) {
    await this.repo.update(id, dto);
    return this.findOne(id);
  }

  async remove(id: number) {
    await this.repo.delete(id);
    return { success: true };
  }
}
