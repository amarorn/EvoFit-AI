import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { workoutsApi, WorkoutPlan } from '../api/workouts';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';

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
        <h1 className="font-heading font-bold text-2xl text-primary">Treinos</h1>
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
            <p className="text-secondary mb-4">
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
            <Card key={plan.id} accent>
              <div className="flex flex-wrap justify-between gap-4">
                <div>
                  <h3 className="font-heading font-semibold text-xl text-white">{plan.title}</h3>
                  <p className="text-white/70 text-sm mt-1">
                    {new Date(plan.startDate).toLocaleDateString('pt-BR')} - {new Date(plan.endDate).toLocaleDateString('pt-BR')}
                  </p>
                  <p className="text-accent text-sm mt-1">
                    {plan.exercises?.length ?? 0} exercicios
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
                  {plan.status === 'active' && plan.exercises && plan.exercises.length > 0 && (
                    <Link to={`/workouts/${plan.id}/execute`}>
                      <Button variant="secondary" className="py-2">
                        Iniciar treino
                      </Button>
                    </Link>
                  )}
                  <Button
                    variant="secondary"
                    className="py-2 text-red-400 hover:text-red-300 hover:bg-red-500/20"
                    onClick={() => handleDelete(plan.id)}
                    loading={deletingId === plan.id}
                    disabled={!!deletingId}
                  >
                    Excluir
                  </Button>
                </div>
              </div>

              {plan.exercises && plan.exercises.length > 0 && (
                <div className="mt-6 space-y-3">
                  <h4 className="font-heading font-medium text-white">Exercicios</h4>
                  <div className="grid gap-2">
                    {plan.exercises.map((ex, i) => (
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
                </div>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
