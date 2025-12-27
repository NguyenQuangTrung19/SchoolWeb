// src/students/students.controller.ts
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
import { StudentsService } from './students.service';
import { CreateStudentDto } from './dto/create-student.dto';
import { UpdateStudentDto } from './dto/update-student.dto';
import { QueryStudentDto } from './dto/query-student.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('students')
@UseGuards(JwtAuthGuard)
export class StudentsController {
  constructor(private readonly studentsService: StudentsService) {}

  @Get()
  findAll(@Req() req: any, @Query() query: QueryStudentDto) {
    const role = req?.user?.role;
    if (role !== 'ADMIN' && role !== 'TEACHER') {
      throw new ForbiddenException('Forbidden');
    }

    const wantPwd =
      query.includePassword === '1' || query.includePassword === 'true';

    if (wantPwd && role !== 'ADMIN') {
      throw new ForbiddenException('Chỉ ADMIN được xem password');
    }

    return this.studentsService.findAll(query, {
      includePassword: role === 'ADMIN' && wantPwd,
    });
  }

  @Get(':id')
  findOne(
    @Req() req: any,
    @Param('id') id: string,
    @Query('includePassword') includePassword?: string,
  ) {
    const role = req?.user?.role;
    if (role !== 'ADMIN' && role !== 'TEACHER') {
      throw new ForbiddenException('Forbidden');
    }

    const want = includePassword === '1' || includePassword === 'true';
    if (want && role !== 'ADMIN') {
      throw new ForbiddenException('Chỉ ADMIN được xem password');
    }

    return this.studentsService.findOne(id, {
      includePassword: role === 'ADMIN' && want,
    });
  }

  @Post()
  async create(@Req() req: any, @Body() dto: CreateStudentDto) {
    const role = req?.user?.role;

    if (role === 'ADMIN') return this.studentsService.create(dto);

    if (role === 'TEACHER') {
      // teacher chỉ được tạo HS nếu classId thuộc lớp được phân công
      const ok = await this.studentsService.teacherCanEditClass(
        req.user.sub, // users.id
        Number(dto.current_class_id),
      );
      if (!ok) throw new ForbiddenException('Bạn không được phân công lớp này');
      return this.studentsService.create(dto);
    }

    throw new ForbiddenException('Forbidden');
  }

  @Put(':id')
  async update(
    @Req() req: any,
    @Param('id') id: string,
    @Body() dto: UpdateStudentDto,
  ) {
    const role = req?.user?.role;

    if (role === 'ADMIN') return this.studentsService.update(id, dto);

    if (role === 'TEACHER') {
      const ok = await this.studentsService.teacherCanEditStudent(
        req.user.sub,
        id,
      );
      if (!ok)
        throw new ForbiddenException('Bạn không được phân công lớp của HS này');
      return this.studentsService.update(id, dto);
    }

    throw new ForbiddenException('Forbidden');
  }

  @Delete(':id')
  async remove(@Req() req: any, @Param('id') id: string) {
    const role = req?.user?.role;

    if (role === 'ADMIN') return this.studentsService.remove(id);

    if (role === 'TEACHER') {
      const ok = await this.studentsService.teacherCanEditStudent(
        req.user.sub,
        id,
      );
      if (!ok)
        throw new ForbiddenException('Bạn không được phân công lớp của HS này');
      return this.studentsService.remove(id);
    }

    throw new ForbiddenException('Forbidden');
  }
}
