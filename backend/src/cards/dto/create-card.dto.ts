import {
  IsString,
  IsOptional,
  IsBoolean,
  IsDateString,
  IsObject,
} from 'class-validator';

export class CreateCardDto {
  @IsString()
  title!: string;

  @IsOptional()
  @IsString()
  template?: string;

  @IsObject()
  content!: any;

  @IsOptional()
  @IsString()
  thumbnailUrl?: string;

  @IsOptional()
  @IsString()
  password?: string;

  @IsOptional()
  @IsBoolean()
  isPublic?: boolean;

  @IsOptional()
  @IsDateString()
  scheduledAt?: string;
}