// src/teachers/dto/create-teacher.dto.ts
import {
  IsEmail,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  MaxLength,
  IsNotEmpty,
  IsDateString,
} from 'class-validator';

export class CreateTeacherDto {
  @IsOptional()
  @IsString()
  @MaxLength(20)
  id?: string;

  @IsOptional()
  @IsInt()
  userid?: number;

  @IsOptional()
  @IsString()
  username?: string;

  @IsNotEmpty({ message: 'Họ tên là bắt buộc' })
  @IsString()
  @MaxLength(100)
  fullname: string;

  @IsNotEmpty({ message: 'Email là bắt buộc' })
  @IsEmail({}, { message: 'Email không hợp lệ' })
  email: string;

  @IsNotEmpty({ message: 'Ngày sinh là bắt buộc' })
  @IsDateString({}, { message: 'Ngày sinh phải theo định dạng YYYY-MM-DD' })
  dob: string;

  @IsNotEmpty({ message: 'Giới tính là bắt buộc' })
  @IsIn(['M', 'F', 'O'], { message: 'Giới tính phải là M, F hoặc O' })
  gender: 'M' | 'F' | 'O';

  @IsNotEmpty({ message: 'Số điện thoại là bắt buộc' })
  @IsString()
  @MaxLength(20)
  phone: string;

  @IsNotEmpty({ message: 'CCCD là bắt buộc' })
  @IsString()
  @MaxLength(20)
  citizenid: string;

  @IsNotEmpty({ message: 'Môn dạy chính là bắt buộc' })
  @IsString()
  @MaxLength(100)
  mainsubject: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  address?: string;

  @IsOptional()
  @IsIn(['ACTIVE', 'INACTIVE'])
  status?: 'ACTIVE' | 'INACTIVE';

  @IsOptional()
  @IsString()
  note?: string;
}
