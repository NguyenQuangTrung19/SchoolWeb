// class-subjects.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClassSubject } from './entities/class-subject.entity';
import { ClassSubjectsService } from './class-subjects.service';
import { ClassSubjectsController } from './class-subjects.controller';

@Module({
  imports: [TypeOrmModule.forFeature([ClassSubject])],
  providers: [ClassSubjectsService],
  controllers: [ClassSubjectsController],
  exports: [ClassSubjectsService],
})
export class ClassSubjectsModule {}
