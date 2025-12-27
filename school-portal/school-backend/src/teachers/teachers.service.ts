// src/teachers/teachers.service.ts
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { TeacherEntity } from './entities/teacher.entity';
import { CreateTeacherDto } from './dto/create-teacher.dto';
import { UpdateTeacherDto } from './dto/update-teacher.dto';
import { QueryTeacherDto } from './dto/query-teacher.dto';
import { UsersService } from '../users/users.service';
import { UserRole } from '../users/entities/user.entity';
import { UpdateUserDto } from '../users/dto/update-user.dto';
import { User } from '../users/entities/user.entity';

@Injectable()
export class TeachersService {
  constructor(
    @InjectRepository(TeacherEntity)
    private readonly repo: Repository<TeacherEntity>,
    private readonly usersService: UsersService,

    @InjectRepository(User)
    private readonly usersRepo: Repository<User>,
    private readonly dataSource: DataSource,
  ) {}

  private generatePassword8(): string {
    const lower = 'abcdefghijklmnopqrstuvwxyz';
    const upper = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const all = lower + upper;
    const pick = (s: string) => s[Math.floor(Math.random() * s.length)];

    const arr = [pick(lower), pick(upper)];
    while (arr.length < 8) arr.push(pick(all));

    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr.join('');
  }

  async findAll(query: QueryTeacherDto, opts?: { includePassword?: boolean }) {
    const {
      page = 0,
      pageSize = 10,
      search = '',
      subject = 'ALL',
      status = 'ALL',
    } = query;

    const qb = this.repo
      .createQueryBuilder('t')
      .leftJoin('users', 'u', 'u.id = t.userid')
      .select([
        't.id AS id',
        't.userid AS userid',
        't.fullname AS fullname',
        't.dob AS dob',
        't.gender AS gender',
        't.address AS address',
        't.phone AS phone',
        't.citizenid AS citizenid',
        't.mainsubject AS mainsubject',
        't.status AS status',
        't.note AS note',
        'u.email AS email',
      ]);

    if (opts?.includePassword) qb.addSelect('u.password AS password');

    if (search) {
      qb.andWhere(
        '(t.id LIKE :search OR t.fullname LIKE :search OR t.phone LIKE :search OR t.citizenid LIKE :search OR t.mainsubject LIKE :search)',
        { search: `%${search}%` },
      );
    }

    if (subject !== 'ALL') qb.andWhere('t.mainsubject = :subject', { subject });
    if (status !== 'ALL') qb.andWhere('t.status = :status', { status });

    const total = await qb.getCount();

    qb.orderBy('t.id', 'ASC')
      .skip(page * pageSize)
      .take(pageSize);

    const rows = await qb.getRawMany();
    const data = rows.map((r: any) => {
      const base = {
        id: r.id,
        userid: r.userid,
        fullname: r.fullname,
        dob: r.dob,
        gender: r.gender,
        address: r.address,
        phone: r.phone,
        citizenid: r.citizenid,
        mainsubject: r.mainsubject,
        status: r.status,
        note: r.note,
        email: r.email,
      };
      return opts?.includePassword ? { ...base, password: r.password } : base;
    });

    return { data, total };
  }

  async findOne(id: string, opts?: { includePassword?: boolean }) {
    const qb = this.repo
      .createQueryBuilder('t')
      .leftJoin('users', 'u', 'u.id = t.userid')
      .select([
        't.id AS id',
        't.userid AS userid',
        't.fullname AS fullname',
        't.dob AS dob',
        't.gender AS gender',
        't.address AS address',
        't.phone AS phone',
        't.citizenid AS citizenid',
        't.mainsubject AS mainsubject',
        't.status AS status',
        't.note AS note',
        'u.email AS email',
      ])
      .where('t.id = :id', { id });

    if (opts?.includePassword) {
      qb.addSelect('u.password AS password');
    }

    const r: any = await qb.getRawOne();
    if (!r) throw new NotFoundException('Teacher not found');

    const base = {
      id: r.id,
      userid: r.userid,
      fullname: r.fullname,
      dob: r.dob,
      gender: r.gender,
      address: r.address,
      phone: r.phone,
      citizenid: r.citizenid,
      mainsubject: r.mainsubject,
      status: r.status,
      note: r.note,
      email: r.email,
    };

    return opts?.includePassword ? { ...base, password: r.password } : base;
  }

  async create(dto: CreateTeacherDto) {
    // chặn required (ngoài DTO) để message rõ ràng
    const required: Array<[keyof CreateTeacherDto, string]> = [
      ['fullname', 'Họ tên'],
      ['email', 'Email'],
      ['dob', 'Ngày sinh'],
      ['gender', 'Giới tính'],
      ['phone', 'Số điện thoại'],
      ['citizenid', 'CCCD'],
      ['mainsubject', 'Môn dạy chính'],
    ];

    for (const [k, label] of required) {
      const v = (dto as any)[k];
      if (!String(v ?? '').trim()) {
        throw new BadRequestException(`${label} là bắt buộc`);
      }
    }

    // id: có thể nhập hoặc auto-gen
    const teacherId =
      dto.id && dto.id.trim().length > 0
        ? dto.id.trim().toUpperCase()
        : await this.generateTeacherId();

    // check trùng id nếu user tự nhập
    const existedTeacher = await this.repo.findOne({
      where: { id: teacherId },
    });
    if (existedTeacher) {
      throw new BadRequestException(`Mã giáo viên ${teacherId} đã tồn tại`);
    }

    let username = teacherId.toLowerCase();
    for (let i = 1; i <= 50; i++) {
      try {
        // thử create user -> nếu trùng username, UsersService sẽ ném lỗi
        // => ta catch và đổi username
        const password = this.generatePassword8();

        const user = await this.usersService.create({
          username,
          fullname: dto.fullname,
          email: dto.email,
          phone: dto.phone,
          role: UserRole.TEACHER,
          password,
        } as any);

        // tạo teacher đồng bộ userid
        const teacher = this.repo.create({
          id: teacherId,
          userid: user.id,
          fullname: dto.fullname,
          dob: new Date(dto.dob),
          gender: dto.gender,
          address: dto.address?.trim() ? dto.address.trim() : null,
          phone: dto.phone,
          citizenid: dto.citizenid,
          mainsubject: dto.mainsubject,
          status: dto.status ?? 'ACTIVE',
          note: dto.note?.trim() ? dto.note.trim() : null,
        });

        const saved = await this.repo.save(teacher);

        // trả password cho ADMIN (controller đã chặn admin-only)
        return { ...saved, email: user.email, password };
      } catch (e: any) {
        // nếu lỗi do username trùng -> đổi username và thử lại
        const msg = String(e?.message || '');
        if (
          msg.toLowerCase().includes('username') &&
          msg.toLowerCase().includes('exists')
        ) {
          username = `${teacherId.toLowerCase()}_${i}`;
          continue;
        }
        throw e;
      }
    }

    throw new BadRequestException(
      'Không thể tạo username hợp lệ cho giáo viên',
    );
  }

  async update(id: string, dto: UpdateTeacherDto) {
    const teacher = await this.repo.findOne({ where: { id } });
    if (!teacher) throw new NotFoundException('Teacher not found');

    if (dto.fullname !== undefined) teacher.fullname = dto.fullname;
    if (dto.dob !== undefined)
      teacher.dob = dto.dob ? new Date(dto.dob) : teacher.dob;
    if (dto.gender !== undefined) teacher.gender = dto.gender;
    if (dto.address !== undefined) teacher.address = dto.address ?? null;
    if (dto.phone !== undefined) teacher.phone = dto.phone;
    if (dto.citizenid !== undefined) teacher.citizenid = dto.citizenid;
    if (dto.mainsubject !== undefined) teacher.mainsubject = dto.mainsubject;
    if (dto.status !== undefined) teacher.status = dto.status;
    if (dto.note !== undefined) teacher.note = dto.note ?? null;

    // sync sang users: fullname/email/phone
    if (teacher.userid) {
      const userUpdate: UpdateUserDto = {};
      if (dto.fullname !== undefined) userUpdate.fullname = dto.fullname;
      if (dto.email !== undefined) userUpdate.email = dto.email;
      if (dto.phone !== undefined) userUpdate.phone = dto.phone;
      await this.usersService.update(teacher.userid, userUpdate);
    }

    return this.repo.save(teacher);
  }

  async remove(id: string) {
    return this.dataSource.transaction(async (manager) => {
      const teacherRepo = manager.getRepository(TeacherEntity);
      const userRepo = manager.getRepository(User);

      const teacher = await teacherRepo.findOne({ where: { id } });
      if (!teacher) throw new NotFoundException('Teacher not found');

      const userId = teacher.userid;

      // 1) xóa teacher trước
      await teacherRepo.delete({ id });

      // 2) xóa user sau
      await userRepo.delete({ id: userId });

      return { success: true };
    });
  }

  private async generateTeacherId(): Promise<string> {
    const last = await this.repo
      .createQueryBuilder('t')
      .orderBy('t.id', 'DESC')
      .getOne();

    if (!last) return 'GV001';

    const num = parseInt(last.id.replace(/\D/g, ''), 10) + 1;
    return 'GV' + num.toString().padStart(3, '0');
  }
}
