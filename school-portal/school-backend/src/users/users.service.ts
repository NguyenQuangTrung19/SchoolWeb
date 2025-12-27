// src/users/users.service.ts
import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { User, UserRole, UserStatus } from './entities/user.entity';
import { QueryUserDto } from './dto/query-user.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepo: Repository<User>,
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

  async findByUsername(username: string) {
    return this.usersRepo.findOne({ where: { username } });
  }

  async findAll(query: QueryUserDto) {
    const page = query.page ?? 0;
    const pageSize = query.pageSize ?? 10;

    const where: any = {};

    if (query.search) {
      const search = `%${query.search}%`;
      where['$or'] = [
        { username: Like(search) },
        { fullname: Like(search) },
        { email: Like(search) },
        { phone: Like(search) },
      ];
    }

    if (query.role && query.role !== 'ALL') {
      where.role = query.role as UserRole;
    }

    const [data, total] = await this.usersRepo.findAndCount({
      where,
      order: { id: 'ASC' },
      skip: page * pageSize,
      take: pageSize,
    });

    return { data, total, page, pageSize };
  }

  async findOne(id: number) {
    const user = await this.usersRepo.findOne({ where: { id } });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async create(dto: CreateUserDto): Promise<User> {
    const existed = await this.usersRepo.findOne({
      where: { username: dto.username },
    });
    if (existed)
      throw new BadRequestException(`Username ${dto.username} already exists`);

    // email/phone bắt buộc -> tuyệt đối không null
    if (!dto.email?.trim()) throw new BadRequestException('Email là bắt buộc');
    if (!dto.phone?.trim())
      throw new BadRequestException('Số điện thoại là bắt buộc');

    const password = dto.password?.trim() || this.generatePassword8();

    const user = this.usersRepo.create({
      username: dto.username.trim(),
      fullname: dto.fullname.trim(),
      email: dto.email.trim(),
      phone: dto.phone.trim(),
      role: dto.role,
      password,
      status: UserStatus.ACTIVE,
    });

    return this.usersRepo.save(user);
  }

  async update(id: number, dto: UpdateUserDto) {
    const user = await this.usersRepo.findOne({ where: { id } });
    if (!user) throw new NotFoundException('User not found');

    if (dto.username !== undefined) user.username = dto.username;
    if (dto.role !== undefined) user.role = dto.role;
    if (dto.fullname !== undefined) user.fullname = dto.fullname;

    // email/phone: không cho null nữa
    if (dto.email !== undefined) {
      if (!dto.email?.trim())
        throw new BadRequestException('Email không được rỗng');
      user.email = dto.email.trim();
    }

    if (dto.phone !== undefined) {
      if (!dto.phone?.trim())
        throw new BadRequestException('Số điện thoại không được rỗng');
      user.phone = dto.phone.trim();
    }

    return this.usersRepo.save(user);
  }

  async toggleStatus(id: number) {
    const user = await this.usersRepo.findOne({ where: { id } });
    if (!user) throw new NotFoundException('User not found');

    user.status =
      user.status === UserStatus.ACTIVE ? UserStatus.LOCKED : UserStatus.ACTIVE;

    return this.usersRepo.save(user);
  }
}
