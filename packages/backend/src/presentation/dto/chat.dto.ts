import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength } from 'class-validator';

export class ChatMessageDto {
  @ApiProperty({ example: 'Quais os melhores exercicios para emagrecer?' })
  @IsString()
  @MinLength(1, { message: 'Mensagem nao pode ser vazia' })
  message: string;
}

export class ChatResponseDto {
  @ApiProperty()
  response: string;
}
