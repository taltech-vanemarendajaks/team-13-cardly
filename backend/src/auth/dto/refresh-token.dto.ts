import { Transform } from 'class-transformer';
import { IsJWT, IsNotEmpty } from 'class-validator';

export class RefreshTokenDto {
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsNotEmpty()
  @IsJWT()
  refreshToken!: string;
}
