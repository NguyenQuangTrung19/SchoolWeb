//src/students/students.module.ts
import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StudentsController } from './students.controller';
import { StudentsService } from './students.service';
import { StudentEntity } from './entities/student.entity';
import { UsersModule } from '../users/users.module';
import { TeacherEntity } from '../teachers/entities/teacher.entity';
import { ClassSubject } from '../class_subjects/entities/class-subject.entity';
import { User } from '../users/entities/user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      StudentEntity,
      TeacherEntity,
      ClassSubject,
      User,
    ]),
    forwardRef(() => UsersModule),
  ],
  controllers: [StudentsController],
  providers: [StudentsService],
  exports: [StudentsService],
})
export class StudentsModule {}
