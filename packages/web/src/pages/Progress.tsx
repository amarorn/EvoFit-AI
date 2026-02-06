import { useEffect, useState } from 'react';
import { progressApi, ProgressStats, ActivityLog } from '../api/progress';
import { Card } from '../components/ui/Card';

export default function Progress() {
  const [stats, setStats] = useState<ProgressStats | null>(null);
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [s, l] = await Promise.all([
          progressApi.stats(30).then((r) => r.data),
          progressApi.list(30).then((r) => r.data),
        ]);
        setStats(s);
        setLogs(Array.isArray(l) ? l : []);
      } catch {
        setStats({ workoutsCompleted: 0, totalCalories: 0, exercisesCompleted: 0, activityCount: 0 });
        setLogs([]);
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

  return (
    <div className="space-y-6">
      <h1 className="font-heading font-bold text-2xl text-primary">Progresso</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <h3 className="font-heading font-semibold text-secondary text-sm mb-1">Treinos concluidos</h3>
          <p className="font-heading font-bold text-2xl text-accent">{stats?.workoutsCompleted ?? 0}</p>
          <p className="text-secondary text-xs mt-1">ultimos 30 dias</p>
        </Card>
        <Card>
          <h3 className="font-heading font-semibold text-secondary text-sm mb-1">Calorias queimadas</h3>
          <p className="font-heading font-bold text-2xl text-accent">{stats?.totalCalories ?? 0}</p>
          <p className="text-secondary text-xs mt-1">ultimos 30 dias</p>
        </Card>
        <Card>
          <h3 className="font-heading font-semibold text-secondary text-sm mb-1">Repeticoes totais</h3>
          <p className="font-heading font-bold text-2xl text-accent">{stats?.exercisesCompleted ?? 0}</p>
          <p className="text-secondary text-xs mt-1">ultimos 30 dias</p>
        </Card>
        <Card>
          <h3 className="font-heading font-semibold text-secondary text-sm mb-1">Registros</h3>
          <p className="font-heading font-bold text-2xl text-accent">{stats?.activityCount ?? 0}</p>
          <p className="text-secondary text-xs mt-1">atividades registradas</p>
        </Card>
      </div>

      <Card>
        <h3 className="font-heading font-semibold text-primary mb-4">Historico de Atividades</h3>
        {logs.length === 0 ? (
          <p className="text-secondary">Nenhuma atividade registrada ainda. Complete treinos para ver seu progresso aqui.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="pb-3 text-secondary font-medium">Data</th>
                  <th className="pb-3 text-secondary font-medium">Exercicio</th>
                  <th className="pb-3 text-secondary font-medium">Series</th>
                  <th className="pb-3 text-secondary font-medium">Repeticoes</th>
                  <th className="pb-3 text-secondary font-medium">Peso (kg)</th>
                  <th className="pb-3 text-secondary font-medium">Calorias</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => (
                  <tr key={log.id} className="border-b border-gray-100">
                    <td className="py-3">{new Date(log.date).toLocaleDateString('pt-BR')}</td>
                    <td className="py-3 font-medium">{log.exerciseName}</td>
                    <td className="py-3">{log.setsCompleted}</td>
                    <td className="py-3">{log.repsCompleted}</td>
                    <td className="py-3">{log.weightLifted ?? '-'}</td>
                    <td className="py-3">{log.caloriesBurned ?? '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
