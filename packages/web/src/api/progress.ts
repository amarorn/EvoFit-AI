import { api } from './client';

export interface ActivityLog {
  id: string;
  exerciseName: string;
  date: string;
  setsCompleted: number;
  repsCompleted: number;
  weightLifted?: number;
  notes?: string;
  caloriesBurned?: number;
}

export interface ProgressStats {
  workoutsCompleted: number;
  totalCalories: number;
  exercisesCompleted: number;
  activityCount: number;
}

export const progressApi = {
  record: (data: {
    workoutPlanId: string;
    exerciseName: string;
    date: string;
    setsCompleted?: number;
    repsCompleted?: number;
    weightLifted?: number;
    notes?: string;
  }) => api.post('/progress/record', data),
  list: (days?: number) =>
    api.get<ActivityLog[]>('/progress', { params: days ? { days } : {} }),
  stats: (days?: number) =>
    api.get<ProgressStats>('/progress/stats', { params: days ? { days } : {} }),
};
