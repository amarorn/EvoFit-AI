import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ExerciseData } from '../../domain/entities/workout.entity';

export interface UserProfileForAI {
  age?: number;
  fitnessLevel: string;
  goals?: string[];
  weight?: number;
  height?: number;
  injuriesOrLimitations?: string;
  trainingDaysPerWeek?: number;
  sessionMinutes?: number;
  trainingLocation?: string;
  recentFeedback?: string;
}

const DEFAULT_MODEL = 'https://api-inference.huggingface.co/models/Lukamac/PlayPart-AI-Personal-Trainer';
const FALLBACK_MODEL = 'https://api-inference.huggingface.co/models/openai-community/gpt2';

@Injectable()
export class AIService {
  constructor(private config: ConfigService) {}

  private async callInferenceApi(
    apiKey: string,
    apiUrl: string,
    prompt: string,
    maxTokens: number,
    options?: { targetLanguage?: string },
  ): Promise<string | null> {
    const isLocal = apiUrl.includes('localhost') || apiUrl.includes('127.0.0.1');
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (!isLocal) {
      headers.Authorization = `Bearer ${apiKey}`;
    }

    const parameters: Record<string, unknown> = {
      max_new_tokens: maxTokens,
      temperature: 0.9,
      do_sample: true,
    };
    if (options?.targetLanguage) {
      parameters.target_language = options.targetLanguage;
    }

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify({ inputs: prompt, parameters }),
    });

    if (!response.ok) return null;

    const data = (await response.json()) as { generated_text?: string } | { error?: string }[];
    const text = Array.isArray(data)
      ? (data[0] as { generated_text?: string })?.generated_text
      : (data as { generated_text?: string })?.generated_text;

    return text?.trim() ?? null;
  }

  async generateWorkout(profile: UserProfileForAI): Promise<ExerciseData[]> {
    const apiKey = this.config.get<string>('HUGGINGFACE_API_KEY');
    const apiUrl = this.config.get<string>('HUGGINGFACE_API_URL', DEFAULT_MODEL);
    const fallbackUrl = this.config.get<string>('HUGGINGFACE_FALLBACK_MODEL', FALLBACK_MODEL);

    const isLocal = apiUrl.includes('localhost') || apiUrl.includes('127.0.0.1');
    if (!apiKey && !isLocal) return this.getFallbackWorkout(profile);

    try {
      const prompt = this.buildPrompt(profile);
      let text = await this.callInferenceApi(apiKey ?? '', apiUrl, prompt, 800);

      if (!text) {
        text = await this.callInferenceApi(apiKey ?? '', fallbackUrl, prompt, 800);
      }

      if (text) {
        const parsed = this.parseAIResponse(text);
        if (parsed.length >= 5) {
          console.log('[AI] Treino gerado pelo modelo:', parsed.map((e) => e.name).join(', '));
          return parsed;
        }
      }

      console.log('[AI] Usando treino fallback (modelo nao retornou 5+ exercicios validos)');
      return this.getFallbackWorkout(profile);
    } catch (error) {
      console.error('AI service error:', error);
      return this.getFallbackWorkout(profile);
    }
  }

  private buildPrompt(profile: UserProfileForAI): string {
    const level = profile.fitnessLevel || 'beginner';
    const goals = profile.goals?.join(', ') || 'general fitness';
    let prompt = `Generate a complete, balanced full-body workout. Cover ALL major muscle groups: legs (2-3 exercises), chest (1-2), back (1-2), shoulders (1), arms/biceps/triceps (1-2), core/abs (1-2). Level: ${level}. Goals: ${goals}.`;
    if (profile.age) prompt += ` Age: ${profile.age}.`;
    if (profile.weight) prompt += ` Weight: ${profile.weight}kg.`;
    if (profile.height) prompt += ` Height: ${profile.height}cm.`;
    if (profile.injuriesOrLimitations) {
      prompt += ` IMPORTANT - Physical limitations to avoid: ${profile.injuriesOrLimitations}.`;
    }
    if (profile.trainingDaysPerWeek) {
      prompt += ` Trains ${profile.trainingDaysPerWeek} days per week.`;
    }
    if (profile.sessionMinutes) {
      prompt += ` Session duration: ${profile.sessionMinutes} minutes.`;
    }
    if (profile.trainingLocation) {
      prompt += ` Training location: ${profile.trainingLocation}.`;
    }
    prompt += ` List 8-10 exercises. Use EXACTLY this format for each line:
EXERCISE: Exercise Name | SETS: 3 | REPS: 10 | REST: 60 seconds
Example:
EXERCISE: Barbell Squats | SETS: 4 | REPS: 10 | REST: 90 seconds
EXERCISE: Bench Press | SETS: 3 | REPS: 12 | REST: 60 seconds
EXERCISE: Dumbbell Rows | SETS: 3 | REPS: 10 | REST: 60 seconds`;
    return prompt;
  }

  private isValidExerciseName(name: string): boolean {
    const lower = name.toLowerCase().trim();
    if (lower.length < 3 || lower.length > 50) return false;

    const blocklist = [
      'exercise', 'future', 'medicine', 'answer', 'the', 'and', 'or', 'for', 'with',
      'example', 'format', 'list', 'name', 'seconds', 'rest', 'sets', 'reps',
      'workout', 'fitness', 'training', 'personal', 'assistant',
    ];
    if (blocklist.some((b) => lower === b || lower.startsWith(b + ' ') || lower.endsWith(' ' + b))) {
      return false;
    }

    const validPatterns = [
      /squat|lunge|plank|push|press|curl|row|deadlift|jump|burpee|crunch|raise|dip|pull|kick|step|bridge|fly|extension|hold/i,
      /mountain|box|rope|bicycle|russian|wall|sit-up|run|walk|swing|high.?knee|jack/i,
      /cardio|strength|abs|core|leg|arm|back|chest|shoulder|hip|calf|glute|tricep|bicep/i,
    ];
    return validPatterns.some((p) => p.test(lower));
  }

  private parseAIResponse(text: string): ExerciseData[] {
    const lines = text.split(/[\n•]/).map((l) => l.trim()).filter(Boolean);
    const exercises: ExerciseData[] = [];
    const seen = new Set<string>();

    for (const line of lines) {
      let name: string | null = null;
      let sets = 3;
      let reps = 10;
      let rest = 60;

      const exact = line.match(/EXERCISE:\s*(.+?)\s*\|\s*SETS:\s*(\d+)\s*\|\s*REPS:\s*(\d+)\s*\|\s*REST:\s*(\d+)/i);
      if (exact) {
        name = exact[1].trim();
        sets = parseInt(exact[2], 10);
        reps = parseInt(exact[3], 10);
        rest = parseInt(exact[4], 10);
      } else {
        const withNumbers = line.match(/(.+?)\s*[-–:]\s*(\d+)\s*(?:sets?|series?|x)\s*(?:\s*x\s*)?(\d+)\s*(?:reps?|repeticoes?)/i)
          || line.match(/(.+?)\s+(\d+)\s*(?:sets?|x)\s*(\d+)\s*(?:reps?)/i);
        if (withNumbers) {
          name = withNumbers[1].trim();
          sets = parseInt(withNumbers[2], 10) || 3;
          reps = parseInt(withNumbers[3], 10) || 10;
          const restM = line.match(/(\d+)\s*(?:s|sec|second|segundo)/i);
          if (restM) rest = parseInt(restM[1], 10);
        } else {
          const nameOnly = line.match(/^[\d.]*\s*([A-Za-z][A-Za-z\s]{2,35}?)(?:\s*[-–:,]|\s+\d|$)/);
          if (nameOnly) name = nameOnly[1].replace(/^\d+\.\s*/, '').trim();
        }
      }

      if (name && name.length >= 3 && !seen.has(name.toLowerCase()) && this.isValidExerciseName(name)) {
        seen.add(name.toLowerCase());
        exercises.push({
          name,
          sets: Math.min(6, Math.max(1, sets || 3)),
          reps: Math.min(50, Math.max(1, reps || 10)),
          restTimeSeconds: Math.min(180, Math.max(15, rest || 60)),
        });
      }
    }

    return exercises;
  }

  async chat(message: string): Promise<string> {
    const apiKey = this.config.get<string>('HUGGINGFACE_API_KEY');
    const apiUrl = this.config.get<string>('HUGGINGFACE_API_URL', DEFAULT_MODEL);
    const fallbackUrl = this.config.get<string>('HUGGINGFACE_FALLBACK_MODEL', FALLBACK_MODEL);

    const systemContext = 'You are a friendly personal trainer AI assistant. Answer questions about exercises, nutrition, and fitness in Portuguese. Be concise and helpful.';
    const prompt = `${systemContext}\n\nUser: ${message}\n\nAssistant:`;

    const isLocal = apiUrl.includes('localhost') || apiUrl.includes('127.0.0.1');
    if (!apiKey && !isLocal) return this.getFallbackChatResponse(message);

    try {
      const opts = { targetLanguage: 'pt' };
      let text = await this.callInferenceApi(apiKey ?? '', apiUrl, prompt, 300, opts);
      if (!text) {
        text = await this.callInferenceApi(apiKey ?? '', fallbackUrl, prompt, 300, opts);
      }

      if (text) {
        let cleaned = text.replace(prompt, '').trim();
        if (!cleaned && text.includes('Assistant:')) {
          cleaned = text.split('Assistant:').pop()?.trim() ?? '';
        }
        if (cleaned.length > 0) return cleaned;
      }

      return this.getFallbackChatResponse(message);
    } catch (error) {
      console.error('AI chat error:', error);
      return this.getFallbackChatResponse(message);
    }
  }

  private getFallbackChatResponse(message: string): string {
    const lower = message.toLowerCase();
    if (lower.includes('nutricao') || lower.includes('aliment') || lower.includes('dieta')) {
      return 'Para nutricao, recomendo uma alimentacao balanceada com proteinas, carboidratos e gorduras saudaveis. Consulte um nutricionista para um plano personalizado. Mantenha-se hidratado e evite alimentos ultraprocessados.';
    }
    if (lower.includes('exercicio') || lower.includes('treino') || lower.includes('muscul')) {
      return 'Para treinos eficazes, combine exercicios de forca (3-4x/semana) com cardio (2-3x/semana). Sempre faca aquecimento e alongamento. Aumente a intensidade gradualmente para evitar lesoes.';
    }
    if (lower.includes('perder peso') || lower.includes('emagrec')) {
      return 'Para perder peso de forma saudavel: deficit calorico moderado, treinos regulares e boa qualidade de sono. Evite dietas radicais - foque em habitos sustentaveis.';
    }
    return 'Sou seu assistente de treino. Posso ajudar com duvidas sobre exercicios, nutricao e fitness. Como posso te ajudar hoje?';
  }

  private shuffle<T>(arr: T[]): T[] {
    const copy = [...arr];
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  }

  private getFallbackWorkout(profile: UserProfileForAI): ExerciseData[] {
    const level = profile.fitnessLevel || 'beginner';
    const goals = profile.goals ?? [];
    const isBeginner = level === 'beginner';
    const sets = isBeginner ? 3 : 4;
    const reps = isBeginner ? 10 : 12;

    const templates: ExerciseData[][] = [
      [
        { name: 'Squats', sets, reps, restTimeSeconds: 60 },
        { name: 'Push-ups', sets, reps: isBeginner ? 8 : 12, restTimeSeconds: 45 },
        { name: 'Lunges', sets: 3, reps: isBeginner ? 8 : 10, restTimeSeconds: 60 },
        { name: 'Plank', sets: 3, reps: 1, restTimeSeconds: 30, description: '30s' },
        { name: 'Jumping Jacks', sets: 3, reps: 20, restTimeSeconds: 30 },
      ],
      [
        { name: 'Goblet Squats', sets, reps, restTimeSeconds: 60 },
        { name: 'Dumbbell Rows', sets, reps, restTimeSeconds: 60 },
        { name: 'Shoulder Press', sets: 3, reps, restTimeSeconds: 45 },
        { name: 'Crunches', sets: 3, reps: 15, restTimeSeconds: 30 },
        { name: 'High Knees', sets: 3, reps: 20, restTimeSeconds: 30 },
      ],
      [
        { name: 'Deadlifts', sets: 3, reps: isBeginner ? 8 : 10, restTimeSeconds: 90 },
        { name: 'Incline Push-ups', sets, reps: isBeginner ? 8 : 12, restTimeSeconds: 45 },
        { name: 'Bulgarian Split Squats', sets: 3, reps: 8, restTimeSeconds: 60 },
        { name: 'Bicycle Kicks', sets: 3, reps: 20, restTimeSeconds: 30 },
        { name: 'Burpees', sets: 3, reps: isBeginner ? 5 : 8, restTimeSeconds: 45 },
      ],
      [
        { name: 'Box Jumps', sets: 3, reps: 10, restTimeSeconds: 45 },
        { name: 'Tricep Dips', sets: 3, reps, restTimeSeconds: 45 },
        { name: 'Bicep Curls', sets: 3, reps: 12, restTimeSeconds: 45 },
        { name: 'Russian Twists', sets: 3, reps: 20, restTimeSeconds: 30 },
        { name: 'Mountain Climbers', sets: 3, reps: 15, restTimeSeconds: 30 },
      ],
      [
        { name: 'Sumo Squats', sets, reps, restTimeSeconds: 60 },
        { name: 'Pike Push-ups', sets: 3, reps: 8, restTimeSeconds: 45 },
        { name: 'Glute Bridges', sets: 3, reps: 12, restTimeSeconds: 45 },
        { name: 'Leg Raises', sets: 3, reps: 12, restTimeSeconds: 45 },
        { name: 'Jump Rope', sets: 3, reps: 1, restTimeSeconds: 30, description: '1 min' },
      ],
      [
        { name: 'Lateral Lunges', sets: 3, reps: 10, restTimeSeconds: 60 },
        { name: 'Diamond Push-ups', sets: 3, reps: 8, restTimeSeconds: 45 },
        { name: 'Superman Hold', sets: 3, reps: 1, restTimeSeconds: 30, description: '30s' },
        { name: 'Dead Bug', sets: 3, reps: 12, restTimeSeconds: 45 },
        { name: 'Skater Jumps', sets: 3, reps: 12, restTimeSeconds: 45 },
      ],
      [
        { name: 'Step-ups', sets: 3, reps: 10, restTimeSeconds: 60 },
        { name: 'Wide Push-ups', sets, reps: isBeginner ? 8 : 12, restTimeSeconds: 45 },
        { name: 'Reverse Lunges', sets: 3, reps: 10, restTimeSeconds: 60 },
        { name: 'V-ups', sets: 3, reps: 10, restTimeSeconds: 45 },
        { name: 'Jackknife', sets: 3, reps: 12, restTimeSeconds: 45 },
      ],
    ];

    let chosen: ExerciseData[];
    if (goals.includes('weight_loss')) {
      chosen = [templates[2], templates[3], templates[5]][Math.floor(Math.random() * 3)];
    } else if (goals.includes('muscle_gain')) {
      chosen = [templates[1], templates[2], templates[4]][Math.floor(Math.random() * 3)];
    } else if (goals.includes('endurance')) {
      chosen = [templates[3], templates[5], templates[6]][Math.floor(Math.random() * 3)];
    } else {
      chosen = templates[Math.floor(Math.random() * templates.length)];
    }

    return this.shuffle(chosen);
  }
}
