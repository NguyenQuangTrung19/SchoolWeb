// src/scores/scores.service.ts

import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Score, ScoreType } from './entities/score.entity';
import { UpsertScoreDto } from './dto/upsert-score.dto';

@Injectable()
export class ScoresService {
  constructor(
    @InjectRepository(Score)
    private readonly scoresRepo: Repository<Score>,
  ) {}

  // ===== CRUD CƠ BẢN (tuỳ nhu cầu có dùng hay không) =====

  async findAll(): Promise<Score[]> {
    return this.scoresRepo.find();
  }

  async findOne(id: number): Promise<Score> {
    const score = await this.scoresRepo.findOne({ where: { id } });
    if (!score) {
      throw new NotFoundException(`Score #${id} not found`);
    }
    return score;
  }

  async remove(id: number): Promise<void> {
    const res = await this.scoresRepo.delete(id);
    if (!res.affected) {
      throw new NotFoundException(`Score #${id} not found`);
    }
  }

  // ===== API CHÍNH ĐANG DÙNG CHO FRONTEND =====

  // GET /scores/class-subject/:id
  async findByClassSubject(classSubjectId: number): Promise<Score[]> {
    return this.scoresRepo.find({
      where: { classSubjectId },
      order: { studentId: 'ASC', type: 'ASC' },
    });
  }

  // POST /scores/upsert
  // logic: nếu đã có (studentId,classSubjectId,type) -> update
  //        nếu chưa có -> create
  async upsert(dto: UpsertScoreDto): Promise<Score> {
    const { studentId, class_subject_id, type, score, date } = dto;

    const existing = await this.scoresRepo.findOne({
      where: {
        studentId: studentId,
        classSubjectId: class_subject_id,
        type: type as ScoreType,
      },
    });

    const numericScore =
      score === null || score === undefined ? null : Number(score);

    if (existing) {
      existing.score = numericScore;
      if (date) {
        existing.date = date;
      }
      return this.scoresRepo.save(existing);
    }

    const newScore = this.scoresRepo.create({
      studentId: studentId,
      classSubjectId: class_subject_id,
      type: type as ScoreType,
      score: numericScore,
      date: date ?? new Date().toISOString().slice(0, 10),
    });

    return this.scoresRepo.save(newScore);
  }
}
