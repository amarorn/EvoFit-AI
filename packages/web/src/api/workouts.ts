import { api } from './client';

export interface Exercise {
  name: string;
  description?: string;
  sets: number;
  reps: number;
  restTimeSeconds: number;
}

export interface DailyWorkout {
  dayNumber: number;
  weekday: string;
  exercises: Exercise[];
}

export interface WorkoutPlan {
  id: string;
  title: string;
  startDate: string;
  endDate: string;
  status: string;
  exercises?: Exercise[];
  dailyWorkouts?: DailyWorkout[];
  createdAt: string;
  updatedAt: string;
}

export interface AssessmentData {
  age?: number;
  gender?: string;
  weight?: number;
  height?: number;
  fitnessLevel?: string;
  goals?: string[];
  injuriesOrLimitations?: string;
  trainingDaysPerWeek?: number;
  sessionMinutes?: number;
  trainingLocation?: string;
}

export const workoutsApi = {
  generate: () => api.post<WorkoutPlan>('/workouts/generate'),
  generateWithAssessment: (data: AssessmentData) =>
    api.post<WorkoutPlan>('/workouts/generate-with-assessment', data),
  list: () => api.get<WorkoutPlan[]>('/workouts'),
  getById: (id: string) => api.get<WorkoutPlan>(`/workouts/${id}`),
  delete: (id: string) => api.delete(`/workouts/${id}`),
};
