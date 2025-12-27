// src/students/students.service.ts
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { StudentEntity } from './entities/student.entity';
import { CreateStudentDto } from './dto/create-student.dto';
import { UpdateStudentDto } from './dto/update-student.dto';
import { QueryStudentDto } from './dto/query-student.dto';
import { UsersService } from '../users/users.service';
import { UserRole } from '../users/entities/user.entity';
import { UpdateUserDto } from '../users/dto/update-user.dto';
import { TeacherEntity } from '../teachers/entities/teacher.entity';
import { ClassSubject } from '../class_subjects/entities/class-subject.entity';

@Injectable()
export class StudentsService {
  constructor(
    @InjectRepository(StudentEntity)
    private readonly repo: Repository<StudentEntity>,
    private readonly usersService: UsersService,

    @InjectRepository(TeacherEntity)
    private readonly teacherRepo: Repository<TeacherEntity>,

    @InjectRepository(ClassSubject)
    private readonly csRepo: Repository<ClassSubject>,
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

  private isAtLeast10(dobStr: string): boolean {
    if (!dobStr) return false;
    const dob = new Date(dobStr);
    if (Number.isNaN(dob.getTime())) return false;

    const today = new Date();
    let age = today.getFullYear() - dob.getFullYear();
    const m = today.getMonth() - dob.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) age--;
    return age >= 10;
  }

  private async getTeacherIdByUserId(userId: number): Promise<string | null> {
    const t = await this.teacherRepo.findOne({ where: { userid: userId } });
    return t?.id ?? null; // GVxxx
  }

  async teacherCanEditClass(userId: number, classId: number): Promise<boolean> {
    const teacherId = await this.getTeacherIdByUserId(userId);
    if (!teacherId) return false;

    const count = await this.csRepo.count({
      where: { teacherId, classId },
    });

    return count > 0;
  }

  async teacherCanEditStudent(
    userId: number,
    studentId: string,
  ): Promise<boolean> {
    const s = await this.repo.findOne({ where: { id: studentId } });
    if (!s) return false;
    return this.teacherCanEditClass(userId, Number(s.current_class_id));
  }

  async findAll(query: QueryStudentDto, opts?: { includePassword?: boolean }) {
    const {
      page = 0,
      pageSize = 10,
      search = '',
      classId = 'ALL',
      status = 'ALL',
    } = query as any;

    const qb = this.repo
      .createQueryBuilder('s')
      .leftJoin('users', 'u', 'u.id = s.userid')
      .select([
        's.id AS id',
        's.userid AS userid',
        's.fullname AS fullname',
        's.dob AS dob',
        's.gender AS gender',
        's.address AS address',
        's.current_class_id AS current_class_id',
        's.guardian_name AS guardian_name',
        's.guardian_phone AS guardian_phone',
        's.guardian_job AS guardian_job',
        's.guardian_citizenid AS guardian_citizenid',
        's.status AS status',
        's.note AS note',
        'u.email AS email',
      ]);

    if (opts?.includePassword) qb.addSelect('u.password AS password');

    if (search) {
      qb.andWhere(
        `(s.id LIKE :search OR s.fullname LIKE :search
          OR s.guardian_name LIKE :search OR s.guardian_phone LIKE :search)`,
        { search: `%${search}%` },
      );
    }

    if (String(classId) !== 'ALL') {
      qb.andWhere('s.current_class_id = :classId', {
        classId: Number(classId),
      });
    }

    if (status !== 'ALL') qb.andWhere('s.status = :status', { status });

    const total = await qb.getCount();

    qb.orderBy('s.id', 'ASC')
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
        current_class_id: r.current_class_id,
        guardian_name: r.guardian_name,
        guardian_phone: r.guardian_phone,
        guardian_job: r.guardian_job,
        guardian_citizenid: r.guardian_citizenid,
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
      .createQueryBuilder('s')
      .leftJoin('users', 'u', 'u.id = s.userid')
      .select([
        's.id AS id',
        's.userid AS userid',
        's.fullname AS fullname',
        's.dob AS dob',
        's.gender AS gender',
        's.address AS address',
        's.current_class_id AS current_class_id',
        's.guardian_name AS guardian_name',
        's.guardian_phone AS guardian_phone',
        's.guardian_job AS guardian_job',
        's.guardian_citizenid AS guardian_citizenid',
        's.status AS status',
        's.note AS note',
        'u.email AS email',
      ])
      .where('s.id = :id', { id });

    if (opts?.includePassword) qb.addSelect('u.password AS password');

    const r: any = await qb.getRawOne();
    if (!r) throw new NotFoundException('Student not found');

    const base = {
      id: r.id,
      userid: r.userid,
      fullname: r.fullname,
      dob: r.dob,
      gender: r.gender,
      address: r.address,
      current_class_id: r.current_class_id,
      guardian_name: r.guardian_name,
      guardian_phone: r.guardian_phone,
      guardian_job: r.guardian_job,
      guardian_citizenid: r.guardian_citizenid,
      status: r.status,
      note: r.note,
      email: r.email,
    };

    return opts?.includePassword ? { ...base, password: r.password } : base;
  }

  async create(dto: CreateStudentDto) {
    const required: Array<[keyof CreateStudentDto, string]> = [
      ['fullname', 'Họ tên'],
      ['email', 'Email'],
      ['dob', 'Ngày sinh'],
      ['gender', 'Giới tính'],
      ['current_class_id', 'Lớp hiện tại'],
      ['guardian_name', 'Tên người giám hộ'],
      ['guardian_phone', 'SĐT giám hộ'],
    ];

    for (const [k, label] of required) {
      const v = (dto as any)[k];
      if (!String(v ?? '').trim())
        throw new BadRequestException(`${label} là bắt buộc`);
    }

    if (!this.isAtLeast10(dto.dob)) {
      throw new BadRequestException('Học sinh phải đủ 10 tuổi');
    }

    // ✅ ID: nhập tay hoặc auto-gen
    let studentId: string;
    if (dto.id && dto.id.trim().length > 0) {
      studentId = dto.id.trim().toUpperCase();

      // ✅ CHECK TRÙNG ID nếu nhập tay
      const existedStudent = await this.repo.findOne({
        where: { id: studentId },
      });
      if (existedStudent) {
        throw new BadRequestException(
          `Mã học sinh ${studentId} đã tồn tại, vui lòng nhập mã khác`,
        );
      }
    } else {
      studentId = await this.generateStudentId();
    }

    const username =
      dto.username && dto.username.trim().length > 0
        ? dto.username.trim()
        : studentId.toLowerCase();

    const password = this.generatePassword8();

    // user.phone = guardian_phone (theo bạn đang làm)
    const user = await this.usersService.create({
      username,
      fullname: dto.fullname,
      email: dto.email,
      phone: dto.guardian_phone,
      role: UserRole.STUDENT,
      password,
    } as any);

    const student = this.repo.create({
      id: studentId,
      userid: user.id,
      fullname: dto.fullname,
      dob: new Date(dto.dob),
      gender: dto.gender,
      address: dto.address ?? null,
      current_class_id: Number(dto.current_class_id),
      guardian_name: dto.guardian_name,
      guardian_phone: dto.guardian_phone,
      guardian_job: dto.guardian_job ?? null,
      guardian_citizenid: dto.guardian_citizenid ?? null,
      status: dto.status ?? 'ACTIVE',
      note: dto.note ?? null,
    });

    const saved = await this.repo.save(student);
    return { ...saved, email: user.email, password };
  }

  async update(id: string, dto: UpdateStudentDto) {
    const s = await this.repo.findOne({ where: { id } });
    if (!s) throw new NotFoundException('Student not found');

    if (dto.fullname !== undefined) s.fullname = dto.fullname;
    if ((dto as any).dob !== undefined)
      s.dob = (dto as any).dob ? new Date((dto as any).dob) : s.dob;
    if (dto.gender !== undefined) s.gender = dto.gender as any;
    if (dto.address !== undefined) s.address = dto.address ?? null;
    if ((dto as any).current_class_id !== undefined)
      s.current_class_id = Number((dto as any).current_class_id);

    if ((dto as any).guardian_name !== undefined)
      s.guardian_name = (dto as any).guardian_name;
    if ((dto as any).guardian_phone !== undefined)
      s.guardian_phone = (dto as any).guardian_phone;
    if ((dto as any).guardian_job !== undefined)
      s.guardian_job = (dto as any).guardian_job ?? null;
    if ((dto as any).guardian_citizenid !== undefined)
      s.guardian_citizenid = (dto as any).guardian_citizenid ?? null;

    if (dto.status !== undefined) s.status = dto.status as any;
    if (dto.note !== undefined) s.note = dto.note ?? null;

    // sync users
    if (s.userid) {
      const userUpdate: UpdateUserDto = {};
      if (dto.fullname !== undefined) userUpdate.fullname = dto.fullname;
      if ((dto as any).email !== undefined)
        userUpdate.email = (dto as any).email;
      if ((dto as any).guardian_phone !== undefined)
        userUpdate.phone = (dto as any).guardian_phone;
      await this.usersService.update(s.userid, userUpdate);
    }

    return this.repo.save(s);
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
