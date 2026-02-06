import { useEffect, useState, useCallback, useMemo } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { workoutsApi, WorkoutPlan, Exercise } from '../api/workouts';
import { progressApi } from '../api/progress';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Timer } from '../components/workout/Timer';

export default function WorkoutExecution() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const dayIndex = parseInt(searchParams.get('day') ?? '-1', 10);
  const [workout, setWorkout] = useState<WorkoutPlan | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [exerciseIndex, setExerciseIndex] = useState(0);
  const [setCompleted, setSetCompleted] = useState(0);
  const [isResting, setIsResting] = useState(false);
  const [restRunning, setRestRunning] = useState(false);
  const [completedSets, setCompletedSets] = useState<Record<number, number>>({});
  const [setFeelings, setSetFeelings] = useState<Record<number, string[]>>({});
  const [showFeelingPicker, setShowFeelingPicker] = useState(false);
  const [workoutFinished, setWorkoutFinished] = useState(false);

  const exercises = useMemo(() => {
    if (!workout) return [];
    const hasDaily = workout.dailyWorkouts && workout.dailyWorkouts.length > 0;
    if (hasDaily && dayIndex >= 0 && dayIndex < (workout.dailyWorkouts?.length ?? 0)) {
      return workout.dailyWorkouts![dayIndex].exercises;
    }
    return workout.exercises ?? [];
  }, [workout, dayIndex]);
  const currentExercise = exercises[exerciseIndex] as Exercise | undefined;
  const totalSets = currentExercise?.sets ?? 0;
  const restTime = currentExercise?.restTimeSeconds ?? 60;

  const loadWorkout = useCallback(async () => {
    if (!id) return;
    try {
      const { data } = await workoutsApi.getById(id);
      setWorkout(data);
    } catch {
      navigate('/workouts');
    } finally {
      setLoading(false);
    }
  }, [id, navigate]);

  useEffect(() => {
    loadWorkout();
  }, [loadWorkout]);

  const FEELING_OPTIONS: { value: string; emoji: string; label: string }[] = [
    { value: 'easy', emoji: '\u{1F60A}', label: 'Facil' },
    { value: 'ok', emoji: '\u{1F610}', label: 'Normal' },
    { value: 'hard', emoji: '\u{1F625}', label: 'Dificil' },
    { value: 'very_hard', emoji: '\u{1F62D}', label: 'Muito dificil' },
  ];

  const handleRequestCompleteSet = () => {
    setShowFeelingPicker(true);
  };

  const handleSelectFeeling = (feeling: string) => {
    const newCompleted = setCompleted + 1;
    const newFeelings = [...(setFeelings[exerciseIndex] ?? []), feeling];
    setSetFeelings((prev) => ({ ...prev, [exerciseIndex]: newFeelings }));
    setSetCompleted(newCompleted);
    setCompletedSets((prev) => ({ ...prev, [exerciseIndex]: newCompleted }));
    setShowFeelingPicker(false);

    if (newCompleted >= totalSets) {
      if (exerciseIndex < exercises.length - 1) {
        setExerciseIndex((i) => i + 1);
        setSetCompleted(0);
      } else {
        setWorkoutFinished(true);
      }
    } else {
      setIsResting(true);
      setRestRunning(true);
    }
  };

  const handleRestComplete = () => {
    setRestRunning(false);
    setIsResting(false);
  };

  const handleSkipRest = () => {
    setRestRunning(false);
    setIsResting(false);
  };

  const handleFinishWorkout = async () => {
    if (!workout?.id) return;
    setSaving(true);
    try {
      const today = new Date().toISOString().slice(0, 10);
      for (let i = 0; i < exercises.length; i++) {
        const ex = exercises[i];
        const setsDone = completedSets[i] ?? ex.sets;
        const feelings = setFeelings[i];
        const payload: Parameters<typeof progressApi.record>[0] = {
          workoutPlanId: workout.id,
          exerciseName: ex.name,
          date: today,
          setsCompleted: setsDone,
          repsCompleted: setsDone * ex.reps,
        };
        if (Array.isArray(feelings) && feelings.length > 0) {
          payload.setFeelings = feelings;
        }
        await progressApi.record(payload);
      }
      navigate('/workouts');
    } catch (e: unknown) {
      const err = e as { response?: { data?: unknown } };
      console.error('Erro ao salvar progresso:', err.response?.data ?? err);
    } finally {
      setSaving(false);
    }
  };

  const handleExit = () => {
    if (window.confirm('Deseja sair sem salvar o progresso?')) {
      navigate('/workouts');
    }
  };

  if (loading || !workout) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin h-12 w-12 border-2 border-accent border-t-transparent rounded-full" />
      </div>
    );
  }

  if (exercises.length === 0) {
    return (
      <Card>
        <p className="text-muted mb-4">Este treino nao possui exercicios.</p>
        <Button onClick={() => navigate('/workouts')}>Voltar</Button>
      </Card>
    );
  }

  if (workoutFinished) {
    return (
      <div className="max-w-md mx-auto space-y-6">
        <Card className="text-center py-12">
          <h2 className="font-heading font-bold text-2xl text-content mb-2">Treino Concluido!</h2>
          <p className="text-muted mb-6">Parabens! Voce completou todos os exercicios.</p>
          <Button onClick={handleFinishWorkout} loading={saving} className="w-full">
            Salvar e Finalizar
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <button
          onClick={handleExit}
          className="text-muted hover:text-content text-sm font-medium"
        >
          Sair
        </button>
        <span className="text-muted text-sm">
          {exerciseIndex + 1}/{exercises.length} exercicios
        </span>
      </div>

      <Card className="p-8">
        {showFeelingPicker ? (
          <div className="space-y-6">
            <p className="text-center text-content font-medium">Como voce se sentiu nessa serie?</p>
            <div className="grid grid-cols-2 gap-4">
              {FEELING_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => handleSelectFeeling(opt.value)}
                  className="flex flex-col items-center gap-2 p-4 rounded-xl bg-primary/50 hover:bg-accent/20 transition-colors border-2 border-transparent hover:border-accent"
                >
                  <span className="text-4xl">{opt.emoji}</span>
                  <span className="text-sm text-muted">{opt.label}</span>
                </button>
              ))}
            </div>
          </div>
        ) : isResting ? (
          <div className="space-y-6">
            <Timer
              seconds={restTime}
              onComplete={handleRestComplete}
              running={restRunning}
            />
            <p className="text-center text-muted text-sm">
              Proxima serie: {currentExercise?.name}
            </p>
            <Button variant="secondary" onClick={handleSkipRest} className="w-full">
              Pular descanso
            </Button>
          </div>
        ) : (
          <>
            <div className="text-center mb-8">
              <h2 className="font-heading font-bold text-2xl text-content mb-2">
                {currentExercise?.name}
              </h2>
              {currentExercise?.description && (
                <p className="text-muted text-sm mt-1">{currentExercise.description}</p>
              )}
              <div className="mt-4 flex justify-center gap-6">
                <span className="text-accent font-heading font-semibold">
                  {setCompleted}/{totalSets} series
                </span>
                <span className="text-muted">
                  {currentExercise?.reps} repeticoes
                </span>
                <span className="text-muted">
                  Descanso: {restTime}s
                </span>
              </div>
            </div>

            <div className="w-24 h-24 mx-auto mb-8 rounded-full border-4 border-accent flex items-center justify-center">
              <span className="font-heading font-bold text-3xl text-accent">
                {setCompleted}/{totalSets}
              </span>
            </div>

            <Button onClick={handleRequestCompleteSet} className="w-full py-4 text-lg">
              Serie concluida
            </Button>
          </>
        )}
      </Card>

      <div className="flex gap-2 overflow-x-auto pb-2">
        {exercises.map((ex, i) => (
          <div
            key={i}
            className={`flex-shrink-0 px-4 py-2 rounded-lg text-sm font-medium ${
              i === exerciseIndex
                ? 'bg-accent text-on-accent'
                : (completedSets[i] ?? 0) >= ex.sets
                ? 'bg-secondary/50 text-white'
                : 'bg-secondary/30 text-white/80'
            }`}
          >
            {ex.name}
            <span className="ml-2 opacity-80">
              {(completedSets[i] ?? (i === exerciseIndex ? setCompleted : 0))}/{ex.sets}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
