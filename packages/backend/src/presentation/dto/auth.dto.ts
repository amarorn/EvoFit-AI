import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength } from 'class-validator';

export class RegisterDto {
  @ApiProperty({ example: 'sarah@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'Senha123!', minLength: 6 })
  @IsString()
  @MinLength(6, { message: 'Senha deve ter no minimo 6 caracteres' })
  password: string;

  @ApiProperty({ example: 'Sarah' })
  @IsString()
  @MinLength(2, { message: 'Nome deve ter no minimo 2 caracteres' })
  name: string;
}

export class LoginDto {
  @ApiProperty()
  @IsEmail()
  email: string;

  @ApiProperty()
  @IsString()
  password: string;
}

export class AuthResponseDto {
  @ApiProperty()
  accessToken: string;

  @ApiProperty()
  expiresIn: string;

  @ApiProperty()
  user: {
    id: string;
    email: string;
    name: string;
  };
}
