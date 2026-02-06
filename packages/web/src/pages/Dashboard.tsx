import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { progressApi, ProgressStats } from '../api/progress';
import { workoutsApi, WorkoutPlan } from '../api/workouts';

const SAMPLE_ACTIVITY = [
  { day: 'Seg', value: 65 },
  { day: 'Ter', value: 72 },
  { day: 'Qua', value: 80 },
  { day: 'Qui', value: 55 },
  { day: 'Sex', value: 90 },
  { day: 'Sab', value: 95 },
  { day: 'Dom', value: 70 },
];

const SAMPLE_CALORIES = [
  { day: 'Seg', value: 450 },
  { day: 'Ter', value: 620 },
  { day: 'Qua', value: 380 },
  { day: 'Qui', value: 540 },
  { day: 'Sex', value: 710 },
  { day: 'Sab', value: 890 },
];

export default function Dashboard() {
  const [stats, setStats] = useState<ProgressStats | null>(null);
  const [workouts, setWorkouts] = useState<WorkoutPlan[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [s, w] = await Promise.all([
          progressApi.stats(7).then((r) => r.data),
          workoutsApi.list().then((r) => r.data),
        ]);
        setStats(s);
        setWorkouts(Array.isArray(w) ? w : []);
      } catch {
        setStats({ workoutsCompleted: 0, totalCalories: 0, exercisesCompleted: 0, activityCount: 0 });
        setWorkouts([]);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin h-12 w-12 border-2 border-accent border-t-transparent rounded-full" />
      </div>
    );
  }

  const recentWorkouts = workouts.slice(0, 2);

  return (
    <div className="space-y-6">
      <h1 className="font-heading font-bold text-2xl text-primary">Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <h3 className="font-heading font-semibold text-secondary text-sm mb-2">
            Treinos esta semana
          </h3>
          <p className="font-heading font-bold text-3xl text-accent">
            {stats?.workoutsCompleted ?? 0}
          </p>
        </Card>
        <Card>
          <h3 className="font-heading font-semibold text-secondary text-sm mb-2">
            Calorias (ultimos 7 dias)
          </h3>
          <p className="font-heading font-bold text-3xl text-accent">
            {stats?.totalCalories ?? 0}
          </p>
        </Card>
        <Card>
          <h3 className="font-heading font-semibold text-secondary text-sm mb-2">
            Exercicios concluidos
          </h3>
          <p className="font-heading font-bold text-3xl text-accent">
            {stats?.exercisesCompleted ?? 0}
          </p>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <h3 className="font-heading font-semibold text-primary mb-4">
            Nivel de Atividade Semanal
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={SAMPLE_ACTIVITY}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E0E1DD" />
                <XAxis dataKey="day" stroke="#415A77" />
                <YAxis stroke="#415A77" />
                <Tooltip />
                <Line type="monotone" dataKey="value" stroke="#00FFFF" strokeWidth={2} fill="#00FFFF" fillOpacity={0.1} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card>
          <h3 className="font-heading font-semibold text-primary mb-4">
            Calorias Queimadas (ultimos 7 dias)
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={SAMPLE_CALORIES}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E0E1DD" />
                <XAxis dataKey="day" stroke="#415A77" />
                <YAxis stroke="#415A77" />
                <Tooltip />
                <Bar dataKey="value" fill="#00FFFF" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="flex flex-wrap gap-4">
            <Link to="/workouts">
              <Button className="flex items-center gap-2">
                <span>Iniciar Treino</span>
              </Button>
            </Link>
            <Button variant="secondary" className="flex items-center gap-2">
              Registrar Refeicao
            </Button>
            <Link to="/workouts">
              <Button variant="secondary" className="flex items-center gap-2">
                Planejar Semana
              </Button>
            </Link>
          </div>

          <h3 className="font-heading font-semibold text-primary">Treinos Recentes</h3>
          {recentWorkouts.length === 0 ? (
            <Card>
              <p className="text-secondary">Nenhum treino ainda. Gere seu primeiro treino personalizado!</p>
              <Link to="/workouts">
                <Button className="mt-4">Gerar Treino com IA</Button>
              </Link>
            </Card>
          ) : (
            <div className="grid gap-4">
              {recentWorkouts.map((w) => (
                <Card key={w.id} className="hover:border-accent/50 transition-colors">
                  <h4 className="font-heading font-semibold text-primary">{w.title}</h4>
                  <p className="text-secondary text-sm mt-1">
                    {w.exercises?.length ?? 0} exercicios • Inicio: {new Date(w.startDate).toLocaleDateString('pt-BR')}
                  </p>
                  {w.status === 'active' && w.exercises && w.exercises.length > 0 && (
                    <Link to={`/workouts/${w.id}/execute`}>
                      <Button variant="secondary" className="mt-3">
                        Iniciar treino
                      </Button>
                    </Link>
                  )}
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
