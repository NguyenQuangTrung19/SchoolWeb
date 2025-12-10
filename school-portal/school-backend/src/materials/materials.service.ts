// src/materials/materials.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Material } from './entities/material.entity';
import { CreateMaterialDto } from './dto/create-material.dto';

@Injectable()
export class MaterialsService {
  constructor(
    @InjectRepository(Material)
    private readonly matsRepo: Repository<Material>,
  ) {}

  // GET /materials/class-subject/:id
  async findByClassSubject(classSubjectId: number): Promise<Material[]> {
    return this.matsRepo.find({
      where: { classSubjectId },
      order: { createdAt: 'DESC' },
    });
  }

  // POST /materials
  async create(dto: CreateMaterialDto): Promise<Material> {
    const mat = this.matsRepo.create({
      classSubjectId: dto.class_subject_id,
      title: dto.title,
      description: dto.description ?? null,
      url: dto.url ?? null,
    });
    return this.matsRepo.save(mat);
  }

  // DELETE /materials/:id
  async remove(id: number): Promise<void> {
    const res = await this.matsRepo.delete(id);
    if (!res.affected) {
      throw new NotFoundException(`Material #${id} not found`);
    }
  }

  // (tuỳ chọn) CRUD phụ
  async findAll(): Promise<Material[]> {
    return this.matsRepo.find();
  }

  async findOne(id: number): Promise<Material> {
    const mat = await this.matsRepo.findOne({ where: { id } });
    if (!mat) throw new NotFoundException('Material not found');
    return mat;
  }
}
