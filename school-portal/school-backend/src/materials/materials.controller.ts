// src/materials/materials.controller.ts

import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Body,
  ParseIntPipe,
} from '@nestjs/common';
import { MaterialsService } from './materials.service';
import { CreateMaterialDto } from './dto/create-material.dto';

@Controller('materials')
export class MaterialsController {
  constructor(private readonly materialsService: MaterialsService) {}

  // GET /materials/class-subject/:id
  @Get('class-subject/:id')
  findByClassSubject(@Param('id', ParseIntPipe) classSubjectId: number) {
    return this.materialsService.findByClassSubject(classSubjectId);
  }

  // POST /materials
  @Post()
  create(@Body() dto: CreateMaterialDto) {
    return this.materialsService.create(dto);
  }

  // DELETE /materials/:id
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.materialsService.remove(id);
  }
}
