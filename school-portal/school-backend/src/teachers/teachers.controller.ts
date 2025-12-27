// src/teachers/teachers.controller.ts
import {
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  Param,
  Post,
  Put,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { TeachersService } from './teachers.service';
import { CreateTeacherDto } from './dto/create-teacher.dto';
import { UpdateTeacherDto } from './dto/update-teacher.dto';
import { QueryTeacherDto } from './dto/query-teacher.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('teachers')
@UseGuards(JwtAuthGuard)
export class TeachersController {
  constructor(private readonly teachersService: TeachersService) {}

  @Get()
  findAll(@Req() req: any, @Query() query: QueryTeacherDto) {
    const role = req?.user?.role;
    const isAdmin = role === 'ADMIN';

    const want =
      query.includePassword === '1' || query.includePassword === 'true';

    return this.teachersService.findAll(query, {
      includePassword: isAdmin && want,
    });
  }

  @Get(':id')
  findOne(
    @Req() req: any,
    @Param('id') id: string,
    @Query('includePassword') includePassword?: string,
  ) {
    const isAdmin = req?.user?.role === 'ADMIN';
    const want = includePassword === '1' || includePassword === 'true';
    return this.teachersService.findOne(id, {
      includePassword: isAdmin && want,
    });
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Req() req: any, @Body() dto: CreateTeacherDto) {
    if (req?.user?.role !== 'ADMIN') {
      throw new ForbiddenException('Forbidden');
    }
    return this.teachersService.create(dto);
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id')
  update(
    @Req() req: any,
    @Param('id') id: string,
    @Body() dto: UpdateTeacherDto,
  ) {
    if (req?.user?.role !== 'ADMIN') {
      throw new ForbiddenException('Forbidden');
    }
    return this.teachersService.update(id, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  remove(@Req() req: any, @Param('id') id: string) {
    if (req?.user?.role !== 'ADMIN') {
      throw new ForbiddenException('Forbidden');
    }
    return this.teachersService.remove(id);
  }
}
