// src/users/users.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
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

  async findAll(query: QueryUserDto) {
    const page = query.page ?? 0;
    const pageSize = query.pageSize ?? 10;

    const where: any = {};

    if (query.search) {
      const search = `%${query.search}%`;
      // tìm theo username, fullname, email, phone
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
    // Có thể check trùng username nếu muốn:
    const existed = await this.usersRepo.findOne({
      where: { username: dto.username },
    });
    if (existed) {
      throw new Error(`Username ${dto.username} already exists`);
    }

    const user = this.usersRepo.create({
      username: dto.username,
      fullname: dto.fullname,
      email: dto.email ?? null,
      phone: dto.phone ?? null,
      role: dto.role,
      status: UserStatus.ACTIVE,
    });

    return this.usersRepo.save(user);
  }

  async update(id: number, dto: UpdateUserDto) {
    const user = await this.usersRepo.findOne({ where: { id } });
    if (!user) throw new NotFoundException('User not found');

    // Không bắt buộc cho phép đổi username/role;
    // nếu bạn MUỐN cho phép, để như dưới. Nếu không, bỏ 2 if đầu.
    if (dto.username !== undefined) {
      user.username = dto.username;
    }

    if (dto.role !== undefined) {
      user.role = dto.role;
    }

    if (dto.fullname !== undefined) {
      user.fullname = dto.fullname;
    }

    if (dto.email !== undefined) {
      user.email = dto.email ?? null;
    }

    if (dto.phone !== undefined) {
      user.phone = dto.phone ?? null;
    }

    return this.usersRepo.save(user);
  }

  async toggleStatus(id: number) {
    const user = await this.usersRepo.findOne({ where: { id } });
    if (!user) throw new NotFoundException('User not found');

    user.status =
      user.status === UserStatus.ACTIVE ? UserStatus.LOCKED : UserStatus.ACTIVE;

    const saved = await this.usersRepo.save(user);
    return saved;
  }
}
