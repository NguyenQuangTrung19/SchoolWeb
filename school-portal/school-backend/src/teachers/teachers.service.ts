// src/teachers/teachers.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TeacherEntity } from './entities/teacher.entity';
import { CreateTeacherDto } from './dto/create-teacher.dto';
import { UpdateTeacherDto } from './dto/update-teacher.dto';
import { QueryTeacherDto } from './dto/query-teacher.dto';
import { UsersService } from '../users/users.service';
import { UserRole } from '../users/entities/user.entity';
import { UpdateUserDto } from '../users/dto/update-user.dto';

@Injectable()
export class TeachersService {
  constructor(
    @InjectRepository(TeacherEntity)
    private readonly repo: Repository<TeacherEntity>,
    private readonly usersService: UsersService,
  ) {}

  async findAll(query: QueryTeacherDto) {
    const {
      page = 0,
      pageSize = 10,
      search = '',
      subject = 'ALL',
      status = 'ALL',
    } = query;

    const qb = this.repo.createQueryBuilder('t');

    if (search) {
      qb.andWhere(
        '(t.id LIKE :search OR t.fullname LIKE :search OR t.phone LIKE :search OR t.citizen_id LIKE :search OR t.main_subject LIKE :search)',
        { search: `%${search}%` },
      );
    }

    if (subject !== 'ALL') {
      qb.andWhere('t.main_subject = :subject', { subject });
      // nếu muốn ignore case:
      // qb.andWhere("LOWER(t.main_subject) = LOWER(:subject)", { subject });
    }

    if (status !== 'ALL') {
      qb.andWhere('t.status = :status', { status });
    }

    qb.orderBy('t.id', 'ASC')
      .skip(page * pageSize)
      .take(pageSize);

    const [data, total] = await qb.getManyAndCount();
    return { data, total };
  }

  async findOne(id: string) {
    return this.repo.findOne({ where: { id } });
  }

  async create(dto: CreateTeacherDto) {
    // 1. Tạo user trước
    const username =
      dto.username && dto.username.trim().length > 0
        ? dto.username.trim()
        : dto.id.toLowerCase(); // ví dụ "GV010" -> "gv010"

    const user = await this.usersService.create({
      username,
      fullname: dto.fullname,
      email: dto.email,
      phone: dto.phone,
      role: UserRole.TEACHER,
    });
    // 2. Tạo teacher gắn user_id
    const teacher = this.repo.create({
      id: dto.id,
      userid: user.id,
      fullname: dto.fullname,
      dob: dto.dob ?? null,
      gender: dto.gender ?? 'O',
      address: dto.address ?? null,
      phone: dto.phone ?? null,
      citizenid: dto.citizenid ?? null,
      mainsubject: dto.mainsubject ?? null,
      status: 'ACTIVE',
    });

    const saved = await this.repo.save(teacher);

    return saved;
  }

  async update(id: string, dto: UpdateTeacherDto) {
    // 1. Lấy teacher hiện tại
    const teacher = await this.repo.findOne({ where: { id } });
    if (!teacher) {
      throw new NotFoundException('Teacher not found');
    }

    // 2. Cập nhật thông tin TEACHER tại bảng teachers
    if (dto.fullname !== undefined) teacher.fullname = dto.fullname;
    if (dto.dob !== undefined) teacher.dob = dto.dob ?? null;
    if (dto.gender !== undefined) teacher.gender = dto.gender;
    if (dto.address !== undefined) teacher.address = dto.address ?? null;
    if (dto.phone !== undefined) teacher.phone = dto.phone ?? null;
    if (dto.citizenid !== undefined) teacher.citizenid = dto.citizenid ?? null;
    if (dto.mainsubject !== undefined)
      teacher.mainsubject = dto.mainsubject ?? null;
    if (dto.status !== undefined) teacher.status = dto.status;
    // nếu sau này bạn có thêm field note, email... thì bổ sung thêm ở đây

    // 3. Nếu teacher đã gắn user_id thì sync luôn sang bảng users
    if (teacher.userid) {
      const userUpdate: UpdateUserDto = {};

      // các field cần sync: tên hiển thị, email, phone
      if (dto.fullname !== undefined) {
        userUpdate.fullname = dto.fullname;
      }
      if (dto.email !== undefined) {
        userUpdate.email = dto.email;
      }
      if (dto.phone !== undefined) {
        userUpdate.phone = dto.phone;
      }

      // (Không đụng tới username / role ở đây cho an toàn)
      // Gọi UsersService.update để cập nhật bản ghi user tương ứng
      await this.usersService.update(teacher.userid, userUpdate);
    }

    // 4. Lưu lại teacher sau khi chỉnh sửa
    const saved = await this.repo.save(teacher);
    return saved;
  }

  async remove(id: string) {
    await this.repo.delete(id);
    return { success: true };
  }
}
