// src/students/dto/create-student.dto.ts
import {
  IsEmail,
  IsIn,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  IsDateString,
} from 'class-validator';

export class CreateStudentDto {
  @IsOptional()
  @IsString()
  @MaxLength(20)
  id?: string; // HS001 auto-gen nếu bỏ trống (nhưng FE sẽ không cho nhập)

  @IsOptional()
  @IsInt()
  userid?: number;

  @IsOptional()
  @IsString()
  username?: string; // auto-gen nếu bỏ trống

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

  @IsOptional()
  @IsString()
  address?: string;

  @IsNotEmpty({ message: 'Lớp hiện tại là bắt buộc' })
  @IsInt({ message: 'Lớp hiện tại phải là số (class id)' })
  current_class_id: number;

  @IsNotEmpty({ message: 'Tên người giám hộ là bắt buộc' })
  @IsString()
  guardian_name: string;

  @IsNotEmpty({ message: 'SĐT giám hộ là bắt buộc' })
  @IsString()
  guardian_phone: string;

  @IsOptional()
  @IsString()
  guardian_job?: string;

  @IsOptional()
  @IsString()
  guardian_citizenid?: string;

  @IsOptional()
  @IsIn(['ACTIVE', 'INACTIVE'])
  status?: 'ACTIVE' | 'INACTIVE';

  @IsOptional()
  @IsString()
  note?: string;
}
