import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ChatMessageDto, ChatResponseDto } from '../dto/chat.dto';
import { AIService } from '../../infrastructure/ai/ai.service';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { ChatService } from '../../application/services/chat.service';

@ApiTags('Chat')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('chat')
export class ChatController {
  constructor(private chatService: ChatService) {}

  @Post()
  @ApiOperation({ summary: 'Enviar mensagem para o personal trainer IA' })
  async chat(@Body() dto: ChatMessageDto): Promise<ChatResponseDto> {
    const response = await this.chatService.sendMessage(dto.message);
    return { response };
  }
}
