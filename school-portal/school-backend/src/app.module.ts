import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClassesModule } from './classes/classes.module';
import { StudentsModule } from './students/students.module';
import { SubjectsModule } from './subjects/subjects.module';
import { TeachersModule } from './teachers/teachers.module';
import { ScoresModule } from './scores/scores.module';
import { AttendanceModule } from './attendance/attendance.module';
import { MaterialsModule } from './materials/materials.module';
import { ClassSubjectsModule } from './class_subjects/class-subjects.module';
import { UsersModule } from './users/users.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT) || 3306,
      username: process.env.DB_USER,
      password: process.env.DB_PASS,
      database: process.env.DB_NAME,
      autoLoadEntities: true,
      synchronize: false, // vì ta dùng SQL tạo table
    }),
    ClassesModule,
    StudentsModule,
    SubjectsModule,
    TeachersModule,
    ScoresModule,
    AttendanceModule,
    MaterialsModule,
    ClassSubjectsModule,
    UsersModule,
  ],
})
export class AppModule {}
