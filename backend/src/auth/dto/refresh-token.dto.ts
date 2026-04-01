import { Transform } from 'class-transformer';
import { IsJWT, IsOptional } from 'class-validator';

export class RefreshTokenDto {
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsOptional()
  @IsJWT()
  refreshToken?: string;
}
