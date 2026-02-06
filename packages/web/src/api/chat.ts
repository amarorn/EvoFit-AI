import { api } from './client';

export interface ChatResponse {
  response: string;
}

export const chatApi = {
  send: (message: string) =>
    api.post<ChatResponse>('/chat', { message }),
};
