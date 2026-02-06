import { Injectable } from '@nestjs/common';
import { AIService } from '../../infrastructure/ai/ai.service';

@Injectable()
export class ChatService {
  constructor(private aiService: AIService) {}

  async sendMessage(message: string): Promise<string> {
    return this.aiService.chat(message);
  }
}
