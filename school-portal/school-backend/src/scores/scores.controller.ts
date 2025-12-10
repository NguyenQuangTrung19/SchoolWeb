// src/scores/scores.controller.ts
import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  ParseIntPipe,
} from '@nestjs/common';
import { ScoresService } from './scores.service';
import { UpsertScoreDto } from './dto/upsert-score.dto';

@Controller('scores')
export class ScoresController {
  constructor(private readonly scoresService: ScoresService) {}

  // GET /scores/class-subject/:id
  @Get('class-subject/:id')
  findByClassSubject(@Param('id', ParseIntPipe) classSubjectId: number) {
    return this.scoresService.findByClassSubject(classSubjectId);
  }

  // POST /scores/upsert
  @Post('upsert')
  upsert(@Body() dto: UpsertScoreDto) {
    return this.scoresService.upsert(dto);
  }
}
