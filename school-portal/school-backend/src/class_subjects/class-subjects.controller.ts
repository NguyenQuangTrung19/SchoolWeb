import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Query,
  Param,
  Body,
  ParseIntPipe,
} from '@nestjs/common';
import { ClassSubjectsService } from './class-subjects.service';
import { QueryClassSubjectDto } from './dto/query-class-subject.dto';
import { CreateClassSubjectDto } from './dto/create-class-subject.dto';
import { UpdateClassSubjectDto } from './dto/update-class-subject.dto';

@Controller('class-subjects')
export class ClassSubjectsController {
  constructor(private readonly csService: ClassSubjectsService) {}

  // GET /class-subjects?page=&pageSize=&classId=&subjectId=&teacherId=
  @Get()
  findAll(@Query() query: QueryClassSubjectDto) {
    return this.csService.findAll(query);
  }

  // GET /class-subjects/:id
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.csService.findOne(id);
  }

  // POST /class-subjects
  @Post()
  create(@Body() dto: CreateClassSubjectDto) {
    return this.csService.create(dto);
  }

  // PUT /class-subjects/:id
  @Put(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateClassSubjectDto,
  ) {
    return this.csService.update(id, dto);
  }

  // DELETE /class-subjects/:id
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.csService.remove(id);
  }
}
