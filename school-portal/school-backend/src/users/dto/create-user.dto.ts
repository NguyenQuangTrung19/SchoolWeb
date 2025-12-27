// src/users/dto/create-user.dto.ts
import {
  IsEmail,
  IsEnum,
  IsOptional,
  IsString,
  Length,
  IsNotEmpty,
} from 'class-validator';
import { UserRole } from '../entities/user.entity';

export class CreateUserDto {
  @IsNotEmpty()
  @IsString()
  username: string; // auto gen từ techerId/studentId

  @IsNotEmpty()
  @IsString()
  fullname: string;

  @IsOptional()
  @IsString()
  @Length(8, 100)
  password?: string; // nếu không nhập thì service tự sinh

  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @IsString()
  phone: string;

  @IsEnum(UserRole)
  role: UserRole;
}
