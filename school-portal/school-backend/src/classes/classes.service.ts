import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ClassEntity } from './entities/class.entity';
import { CreateClassDto } from './dto/create-class.dto';
import { UpdateClassDto } from './dto/update-class.dto';
import { QueryClassDto } from './dto/query-class.dto';

@Injectable()
export class ClassesService {
  constructor(
    @InjectRepository(ClassEntity)
    private readonly repo: Repository<ClassEntity>,
  ) {}

  async findAll(query: QueryClassDto) {
    const {
      page = 0,
      pageSize = 10,
      search = '',
      grade = 'ALL',
      status = 'ALL',
    } = query;

    const qb = this.repo.createQueryBuilder('c');

    if (search) {
      qb.andWhere(
        '(c.name LIKE :search OR c.year_start LIKE :search OR c.year_end LIKE :search)',
        {
          search: `%${search}%`,
        },
      );
    }

    if (grade !== 'ALL') {
      qb.andWhere('c.grade = :grade', { grade: Number(grade) });
    }

    if (status !== 'ALL') {
      qb.andWhere('c.status = :status', { status });
    }

    qb.orderBy('c.grade', 'ASC')
      .addOrderBy('c.name', 'ASC')
      .skip(page * pageSize)
      .take(pageSize);

    const [data, total] = await qb.getManyAndCount();
    return { data, total };
  }

  async findOne(id: number) {
    return this.repo.findOne({ where: { id } });
  }

  async create(dto: CreateClassDto) {
    const entity = this.repo.create(dto);
    return this.repo.save(entity);
  }

  async update(id: number, dto: UpdateClassDto) {
    await this.repo.update(id, dto);
    return this.findOne(id);
  }

  async remove(id: number) {
    await this.repo.delete(id);
    return { success: true };
  }
}
