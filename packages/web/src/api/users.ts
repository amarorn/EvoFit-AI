import { api } from './client';

export type FitnessLevel = 'beginner' | 'intermediate' | 'advanced';

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  age?: number;
  gender?: string;
  weight?: number;
  height?: number;
  fitnessLevel?: FitnessLevel;
  goals?: string[];
  injuriesOrLimitations?: string;
  trainingDaysPerWeek?: number;
  sessionMinutes?: number;
  trainingLocation?: string;
}

export interface UpdateProfilePayload {
  name?: string;
  age?: number;
  gender?: string;
  weight?: number;
  height?: number;
  fitnessLevel?: FitnessLevel;
  goals?: string[];
  injuriesOrLimitations?: string;
  trainingDaysPerWeek?: number;
  sessionMinutes?: number;
  trainingLocation?: string;
}

export const usersApi = {
  getMe: () => api.get<UserProfile>('/users/me'),
  updateProfile: (data: UpdateProfilePayload) => api.put<UserProfile>('/users/me', data),
};
