import { Module } from '@nestjs/common';
import { ChatController } from '../controllers/chat.controller';
import { ChatService } from '../../application/services/chat.service';
import { AIService } from '../../infrastructure/ai/ai.service';

@Module({
  controllers: [ChatController],
  providers: [ChatService, AIService],
})
export class ChatModule {}
