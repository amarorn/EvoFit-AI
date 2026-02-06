import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { workoutsApi, WorkoutPlan, DailyWorkout } from '../api/workouts';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';

function ExerciseList({ exercises }: { exercises: { name: string; sets: number; reps: number; restTimeSeconds: number }[] }) {
  return (
    <div className="grid gap-2">
      {exercises.map((ex, i) => (
        <div
          key={i}
          className="flex items-center justify-between p-3 rounded-lg bg-primary/50"
        >
          <span className="text-white font-medium">{ex.name}</span>
          <span className="text-accent text-sm">
            {ex.sets} series x {ex.reps} rep • descanso {ex.restTimeSeconds}s
          </span>
        </div>
      ))}
    </div>
  );
}

function WorkoutPlanCard({
  plan,
  onDelete,
  deletingId,
}: {
  plan: WorkoutPlan;
  onDelete: (id: string) => void;
  deletingId: string | null;
}) {
  const hasDaily = plan.dailyWorkouts && plan.dailyWorkouts.length > 0;
  const [selectedDayIndex, setSelectedDayIndex] = useState(0);

  const days = plan.dailyWorkouts ?? [];
  const selectedDay = days[selectedDayIndex];
  const exercisesToShow = selectedDay?.exercises ?? plan.exercises ?? [];
  const canExecute = plan.status === 'active' && exercisesToShow.length > 0;

  return (
    <Card accent>
      <div className="flex flex-wrap justify-between gap-4">
        <div>
          <h3 className="font-heading font-semibold text-xl text-white">{plan.title}</h3>
          <p className="text-white/70 text-sm mt-1">
            {new Date(plan.startDate).toLocaleDateString('pt-BR')} - {new Date(plan.endDate).toLocaleDateString('pt-BR')}
          </p>
          <p className="text-accent text-sm mt-1">
            {hasDaily
              ? `${days.length} dias de treino • ${days.reduce((s, d) => s + d.exercises.length, 0)} exercicios`
              : `${plan.exercises?.length ?? 0} exercicios`}
          </p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <span
            className={`px-3 py-1 rounded-full text-sm font-medium ${
              plan.status === 'active' ? 'bg-accent/20 text-accent' : 'bg-secondary text-white/80'
            }`}
          >
            {plan.status === 'active' ? 'Ativo' : 'Concluido'}
          </span>
          {canExecute && (
            <Link
              to={
                hasDaily
                  ? `/workouts/${plan.id}/execute?day=${selectedDayIndex}`
                  : `/workouts/${plan.id}/execute`
              }
            >
              <Button variant="secondary" className="py-2">
                Iniciar treino{hasDaily ? ` - ${selectedDay?.weekday}` : ''}
              </Button>
            </Link>
          )}
          <Button
            variant="secondary"
            className="py-2 text-red-400 hover:text-red-300 hover:bg-red-500/20"
            onClick={() => onDelete(plan.id)}
            loading={deletingId === plan.id}
            disabled={!!deletingId}
          >
            Excluir
          </Button>
        </div>
      </div>

      {hasDaily ? (
        <div className="mt-6">
          <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
            {days.map((day: DailyWorkout, i: number) => (
              <button
                key={day.dayNumber}
                type="button"
                onClick={() => setSelectedDayIndex(i)}
                className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors ${
                  selectedDayIndex === i
                    ? 'bg-accent text-on-accent'
                    : 'bg-primary/50 text-white/80 hover:bg-primary/70'
                }`}
              >
                {day.weekday}
              </button>
            ))}
          </div>
          <div className="mb-4">
            <h4 className="font-heading font-medium text-white mb-3">
              {selectedDay?.weekday} - {exercisesToShow.length} exercicios
            </h4>
            <ExerciseList exercises={exercisesToShow} />
          </div>
        </div>
      ) : (
        exercisesToShow.length > 0 && (
          <div className="mt-6 space-y-3">
            <h4 className="font-heading font-medium text-white">Exercicios</h4>
            <ExerciseList exercises={exercisesToShow} />
          </div>
        )
      )}
    </Card>
  );
}

export default function Workouts() {
  const [workouts, setWorkouts] = useState<WorkoutPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const load = async () => {
    try {
      const { data } = await workoutsApi.list();
      setWorkouts(Array.isArray(data) ? data : []);
    } catch {
      setWorkouts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      await workoutsApi.generate();
      await load();
    } catch (e) {
      console.error(e);
    } finally {
      setGenerating(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Deseja excluir este treino?')) return;
    setDeletingId(id);
    try {
      await workoutsApi.delete(id);
      await load();
    } catch (e) {
      console.error(e);
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin h-12 w-12 border-2 border-accent border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="font-heading font-bold text-2xl text-content">Treinos</h1>
        <div className="flex gap-3">
          <Link to="/assessment">
            <Button variant="secondary">Avaliacao e Treino</Button>
          </Link>
          <Button onClick={handleGenerate} loading={generating}>
            Gerar Treino Rapido
          </Button>
        </div>
      </div>

      {workouts.length === 0 ? (
        <Card>
          <div className="text-center py-12">
            <p className="text-muted mb-4">
              Voce ainda nao tem treinos. Clique no botao abaixo para gerar um plano personalizado com IA.
            </p>
            <Button onClick={handleGenerate} loading={generating}>
              Gerar Meu Primeiro Treino
            </Button>
          </div>
        </Card>
      ) : (
        <div className="grid gap-6">
          {workouts.map((plan) => (
            <WorkoutPlanCard
              key={plan.id}
              plan={plan}
              onDelete={handleDelete}
              deletingId={deletingId}
            />
          ))}
        </div>
      )}
    </div>
  );
}
