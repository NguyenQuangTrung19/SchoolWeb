import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder } from 'typeorm';
import {
  ClassSubject,
  ClassSubjectStatus,
} from './entities/class-subject.entity';
import { CreateClassSubjectDto } from './dto/create-class-subject.dto';
import { UpdateClassSubjectDto } from './dto/update-class-subject.dto';
import { QueryClassSubjectDto } from './dto/query-class-subject.dto';

@Injectable()
export class ClassSubjectsService {
  constructor(
    @InjectRepository(ClassSubject)
    private readonly csRepo: Repository<ClassSubject>,
  ) {}

  private baseQuery(): SelectQueryBuilder<ClassSubject> {
    return this.csRepo
      .createQueryBuilder('cs')
      .leftJoinAndSelect('classes', 'c', 'c.id = cs.class_id')
      .leftJoinAndSelect('subjects', 's', 's.id = cs.subject_id')
      .leftJoinAndSelect('teachers', 't', 't.id = cs.teacher_id');
  }

  // GET /class-subjects
  async findAll(query: QueryClassSubjectDto) {
    const { page = 0, pageSize = 10, classId, subjectId, teacherId } = query;

    let qb = this.baseQuery();

    if (classId) {
      qb = qb.andWhere('cs.class_id = :classId', { classId });
    }
    if (subjectId) {
      qb = qb.andWhere('cs.subject_id = :subjectId', { subjectId });
    }
    if (teacherId && teacherId !== 'ALL') {
      qb = qb.andWhere('cs.teacher_id = :teacherId', { teacherId });
    }

    const [rows, total] = await qb
      .skip(page * pageSize)
      .take(pageSize)
      .orderBy('cs.id', 'ASC')
      .getManyAndCount();

    // map sang format FE đang dùng
    const data = rows.map((cs: any) => ({
      id: cs.id,
      class_id: cs.classId,
      class_name: (cs as any).c?.name ?? undefined,
      subject_id: cs.subjectId,
      subject_name: (cs as any).s?.name ?? undefined,
      teacher_id: cs.teacherId,
      teacher_name: (cs as any).t?.full_name ?? undefined,
      weekly_lessons: cs.weeklyLessons,
      room: cs.room,
      status: cs.status,
    }));

    return { data, total };
  }

  // GET /class-subjects/:id
  async findOne(id: number) {
    const qb = this.baseQuery().where('cs.id = :id', { id });

    const cs = await qb.getOne();
    if (!cs) {
      throw new NotFoundException(`ClassSubject #${id} not found`);
    }

    const raw = await this.baseQuery()
      .select([
        'cs.id as id',
        'cs.class_id as class_id',
        'c.name as class_name',
        'cs.subject_id as subject_id',
        's.name as subject_name',
        'cs.teacher_id as teacher_id',
        't.full_name as teacher_name',
        'cs.weekly_lessons as weekly_lessons',
        'cs.room as room',
        'cs.status as status',
      ])
      .where('cs.id = :id', { id })
      .getRawOne();

    return raw;
  }

  // POST /class-subjects
  async create(dto: CreateClassSubjectDto) {
    const cs = this.csRepo.create({
      classId: dto.classId,
      subjectId: dto.subjectId,
      teacherId: dto.teacherId,
      weeklyLessons: dto.weekly_lessons ?? null,
      room: dto.room ?? null,
      status: dto.status ?? ClassSubjectStatus.ACTIVE,
    });

    const saved = await this.csRepo.save(cs);
    return this.findOne(saved.id);
  }

  // PUT /class-subjects/:id
  async update(id: number, dto: UpdateClassSubjectDto) {
    const cs = await this.csRepo.findOne({ where: { id } });
    if (!cs) {
      throw new NotFoundException(`ClassSubject #${id} not found`);
    }

    if (dto.classId !== undefined) cs.classId = dto.classId;
    if (dto.subjectId !== undefined) cs.subjectId = dto.subjectId;
    if (dto.teacherId !== undefined) cs.teacherId = dto.teacherId;
    if (dto.weekly_lessons !== undefined) cs.weeklyLessons = dto.weekly_lessons;
    if (dto.room !== undefined) cs.room = dto.room;
    if (dto.status !== undefined) cs.status = dto.status;

    await this.csRepo.save(cs);
    return this.findOne(id);
  }

  // DELETE /class-subjects/:id
  async remove(id: number): Promise<void> {
    const res = await this.csRepo.delete(id);
    if (!res.affected) {
      throw new NotFoundException(`ClassSubject #${id} not found`);
    }
  }
}
