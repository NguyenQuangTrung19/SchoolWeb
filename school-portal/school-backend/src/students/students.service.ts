// students.service.ts

import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { StudentEntity } from './entities/student.entity';
import { CreateStudentDto } from './dto/create-student.dto';
import { UpdateStudentDto } from './dto/update-student.dto';
import { QueryStudentDto } from './dto/query-student.dto';
import { UsersService } from '../users/users.service';
import { UpdateUserDto } from '../users/dto/update-user.dto';
import { UserRole } from '../users/entities/user.entity';

@Injectable()
export class StudentsService {
  constructor(
    @InjectRepository(StudentEntity)
    private readonly repo: Repository<StudentEntity>,
    private readonly usersService: UsersService,
  ) {}

  async findAll(query: QueryStudentDto) {
    const {
      page = 0,
      pageSize = 10,
      search = '',
      classId = 'ALL',
      status = 'ALL',
    } = query;

    const qb = this.repo.createQueryBuilder('s');

    if (search) {
      qb.andWhere(
        '(s.id LIKE :search OR s.fullname LIKE :search OR s.guardian_name LIKE :search OR s.guardian_phone LIKE :search)',
        { search: `%${search}%` },
      );
    }

    if (classId !== 'ALL') {
      qb.andWhere('s.current_class_id = :classId', {
        classId: Number(classId),
      });
    }

    if (status !== 'ALL') {
      qb.andWhere('s.status = :status', { status });
    }

    qb.orderBy('s.id', 'ASC')
      .skip(page * pageSize)
      .take(pageSize);

    const [data, total] = await qb.getManyAndCount();
    return { data, total };
  }

  async findOne(id: string) {
    return this.repo.findOne({ where: { id } });
  }

  async create(dto: CreateStudentDto) {
    // 1. Generate studentId nếu chưa truyền
    const studentId =
      dto.id && dto.id.trim().length > 0
        ? dto.id.trim().toUpperCase()
        : await this.generateStudentId(); // viết ở dưới

    // 2) Chuẩn hóa username/email/phone từ DTO (UsersPage sẽ gửi lên)
    const username =
      dto.username && dto.username.trim().length > 0
        ? dto.username.trim()
        : studentId.toLowerCase();

    const email =
      dto.email && dto.email.trim().length > 0 ? dto.email.trim() : undefined;

    const phone =
      dto.phone && dto.phone.trim().length > 0
        ? dto.phone.trim()
        : dto.guardian_phone && dto.guardian_phone.trim().length > 0
          ? dto.guardian_phone.trim()
          : undefined;

    // 2. Tạo User ứng với Student
    const createdUser = await this.usersService.create({
      username,
      fullname: dto.fullname,
      email,
      phone,
      role: UserRole.STUDENT,
    });

    // 3. Tạo Student
    const student = this.repo.create({
      id: studentId,
      userid: createdUser.id,
      fullname: dto.fullname,
      dob: dto.dob ?? null,
      gender: dto.gender ?? 'O',
      address: dto.address ?? null,
      current_class_id: dto.current_class_id ?? null,
      guardian_name: dto.guardian_name ?? null,
      guardian_phone: dto.guardian_phone ?? null,
      guardian_job: dto.guardian_job ?? null,
      guardian_citizenid: dto.guardian_citizenid ?? null,
      status: dto.status ?? 'ACTIVE',
      note: dto.note ?? null,
    });

    const saved = await this.repo.save(student);
    return saved;
  }

  async update(id: string, dto: UpdateStudentDto) {
    // 1. Lấy bản ghi hiện tại
    const student = await this.repo.findOne({ where: { id } });
    if (!student) throw new NotFoundException('Student not found');

    // 2. Update Student fields
    if (dto.fullname !== undefined) student.fullname = dto.fullname;
    if (dto.dob !== undefined) student.dob = dto.dob ? new Date(dto.dob) : null;
    if (dto.gender !== undefined) student.gender = dto.gender;
    if (dto.address !== undefined) student.address = dto.address ?? null;
    if (dto.current_class_id !== undefined)
      student.current_class_id = dto.current_class_id;
    if (dto.guardian_name !== undefined)
      student.guardian_name = dto.guardian_name ?? null;
    if (dto.guardian_phone !== undefined)
      student.guardian_phone = dto.guardian_phone ?? null;
    if (dto.guardian_job !== undefined)
      student.guardian_job = dto.guardian_job ?? null;
    if (dto.guardian_citizenid !== undefined)
      student.guardian_citizenid = dto.guardian_citizenid ?? null;
    if (dto.status !== undefined) student.status = dto.status;
    if (dto.note !== undefined) student.note = dto.note ?? null;

    // 3. Sync Update sang Users nếu có user_id
    if (student.userid) {
      const updateUser: UpdateUserDto = {};

      if (dto.fullname !== undefined) updateUser.fullname = dto.fullname;
      if (dto.email !== undefined) updateUser.email = dto.email;
      if (dto.phone !== undefined) updateUser.phone = dto.phone;

      if (dto.guardian_phone !== undefined)
        updateUser.phone = dto.guardian_phone;

      // Nếu bạn muốn sync status:
      // updateUser.status = student.status === 'ACTIVE' ? 'ACTIVE' : 'LOCKED';

      await this.usersService.update(student.userid, updateUser);
    }

    const saved = await this.repo.save(student);
    return saved;
  }

  async remove(id: string) {
    await this.repo.delete(id);
    return { success: true };
  }

  private async generateStudentId(): Promise<string> {
    const last = await this.repo
      .createQueryBuilder('s')
      .orderBy('s.id', 'DESC')
      .getOne();

    if (!last) return 'HS001';

    const num = parseInt(last.id.replace(/\D/g, ''), 10) + 1;
    return 'HS' + num.toString().padStart(3, '0');
  }
}
