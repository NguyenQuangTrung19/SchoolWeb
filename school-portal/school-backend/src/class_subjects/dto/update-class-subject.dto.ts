import { PartialType } from '@nestjs/mapped-types';
import { CreateClassSubjectDto } from './create-class-subject.dto';

export class UpdateClassSubjectDto extends PartialType(CreateClassSubjectDto) {}
