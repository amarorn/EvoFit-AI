import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { workoutsApi, AssessmentData } from '../api/workouts';
import { usersApi } from '../api/users';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';

const FITNESS_LEVELS = [
  { value: 'beginner', label: 'Iniciante' },
  { value: 'intermediate', label: 'Intermediario' },
  { value: 'advanced', label: 'Avancado' },
];

const GOALS_OPTIONS = [
  { value: 'weight_loss', label: 'Perda de peso' },
  { value: 'muscle_gain', label: 'Ganho de massa' },
  { value: 'endurance', label: 'Resistencia' },
  { value: 'general', label: 'Condicionamento geral' },
];

const LOCATION_OPTIONS = [
  { value: 'gym', label: 'Academia' },
  { value: 'home', label: 'Casa' },
  { value: 'both', label: 'Ambos' },
];

export default function Assessment() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [error, setError] = useState('');
  const [form, setForm] = useState<AssessmentData>({
    fitnessLevel: 'beginner',
    goals: [],
    trainingDaysPerWeek: 3,
    sessionMinutes: 45,
    trainingLocation: 'both',
  });

  useEffect(() => {
    usersApi.getMe().then(({ data }) => {
      if (data) {
        setForm((prev) => ({
          ...prev,
          age: data.age,
          gender: data.gender,
          weight: data.weight,
          height: data.height,
          fitnessLevel: data.fitnessLevel ?? prev.fitnessLevel,
          goals: data.goals ?? prev.goals,
          injuriesOrLimitations: data.injuriesOrLimitations,
          trainingDaysPerWeek: data.trainingDaysPerWeek ?? prev.trainingDaysPerWeek,
          sessionMinutes: data.sessionMinutes ?? prev.sessionMinutes,
          trainingLocation: data.trainingLocation ?? prev.trainingLocation,
        }));
      }
    }).catch(() => {}).finally(() => setLoadingProfile(false));
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    let finalValue: string | number | undefined = value;
    if (type === 'number') {
      finalValue = value === '' ? undefined : parseFloat(value);
      if (finalValue !== undefined && isNaN(finalValue)) finalValue = undefined;
    }
    setForm((prev) => ({ ...prev, [name]: finalValue }));
  };

  const handleGoalsChange = (value: string, checked: boolean) => {
    setForm((prev) => {
      const goals = checked ? [...(prev.goals ?? []), value] : (prev.goals ?? []).filter((g) => g !== value);
      return { ...prev, goals };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { data } = await workoutsApi.generateWithAssessment(form);
      navigate(`/workouts`, { state: { createdId: data.id } });
    } catch (err) {
      setError('Erro ao gerar treino. Tente novamente.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl space-y-6">
      <h1 className="font-heading font-bold text-2xl text-content">
        Avaliacao para Treino
      </h1>
      <p className="text-muted">
        Preencha os dados abaixo para que a IA monte um treino personalizado para voce.
      </p>

      <Card>
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="p-4 rounded-lg bg-red-500/20 text-red-700 text-sm">{error}</div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-muted text-sm font-medium mb-1">Idade (anos)</label>
              <input
                type="number"
                name="age"
                value={form.age ?? ''}
                onChange={handleChange}
                min={14}
                max={120}
                className="w-full px-4 py-3 rounded-lg border border-secondary focus:border-accent focus:ring-1 focus:ring-accent outline-none text-content bg-primary/50"
                placeholder="25"
              />
            </div>
            <div>
              <label className="block text-muted text-sm font-medium mb-1">Genero</label>
              <select
                name="gender"
                value={form.gender ?? ''}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-lg border border-secondary focus:border-accent focus:ring-1 focus:ring-accent outline-none text-content bg-primary/50"
              >
                <option value="">Selecione</option>
                <option value="male">Masculino</option>
                <option value="female">Feminino</option>
                <option value="other">Outro</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-muted text-sm font-medium mb-1">Peso (kg)</label>
              <input
                type="number"
                name="weight"
                value={form.weight ?? ''}
                onChange={handleChange}
                min={30}
                max={300}
                step={0.1}
                className="w-full px-4 py-3 rounded-lg border border-secondary focus:border-accent focus:ring-1 focus:ring-accent outline-none text-content bg-primary/50"
                placeholder="70"
              />
            </div>
            <div>
              <label className="block text-muted text-sm font-medium mb-1">Altura (cm)</label>
              <input
                type="number"
                name="height"
                value={form.height ?? ''}
                onChange={handleChange}
                min={100}
                max={250}
                className="w-full px-4 py-3 rounded-lg border border-secondary focus:border-accent focus:ring-1 focus:ring-accent outline-none text-content bg-primary/50"
                placeholder="175"
              />
            </div>
          </div>

          <div>
            <label className="block text-muted text-sm font-medium mb-2">Nivel de fitness</label>
            <select
              name="fitnessLevel"
              value={form.fitnessLevel ?? 'beginner'}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-lg border border-secondary focus:border-accent focus:ring-1 focus:ring-accent outline-none text-content bg-primary/50"
            >
              {FITNESS_LEVELS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-muted text-sm font-medium mb-2">Objetivos</label>
            <div className="space-y-2">
              {GOALS_OPTIONS.map((opt) => (
                <label key={opt.value} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={(form.goals ?? []).includes(opt.value)}
                    onChange={(e) => handleGoalsChange(opt.value, e.target.checked)}
                    className="rounded border-secondary text-accent focus:ring-accent"
                  />
                  <span className="text-content">{opt.label}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-muted text-sm font-medium mb-1">
              Lesoes ou limitacoes fisicas
            </label>
            <textarea
              name="injuriesOrLimitations"
              value={form.injuriesOrLimitations ?? ''}
              onChange={handleChange}
              rows={3}
              className="w-full px-4 py-3 rounded-lg border border-secondary focus:border-accent focus:ring-1 focus:ring-accent outline-none text-content bg-primary/50 resize-none"
              placeholder="Ex: problema no joelho direito, lombar fragil..."
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-muted text-sm font-medium mb-1">
                Dias por semana para treinar
              </label>
              <input
                type="number"
                name="trainingDaysPerWeek"
                value={form.trainingDaysPerWeek ?? 3}
                onChange={handleChange}
                min={1}
                max={7}
                className="w-full px-4 py-3 rounded-lg border border-secondary focus:border-accent focus:ring-1 focus:ring-accent outline-none text-content bg-primary/50"
              />
            </div>
            <div>
              <label className="block text-muted text-sm font-medium mb-1">
                Tempo por sessao (minutos)
              </label>
              <input
                type="number"
                name="sessionMinutes"
                value={form.sessionMinutes ?? 45}
                onChange={handleChange}
                min={15}
                max={120}
                className="w-full px-4 py-3 rounded-lg border border-secondary focus:border-accent focus:ring-1 focus:ring-accent outline-none text-content bg-primary/50"
              />
            </div>
          </div>

          <div>
            <label className="block text-muted text-sm font-medium mb-2">
              Onde vai treinar
            </label>
            <select
              name="trainingLocation"
              value={form.trainingLocation ?? 'both'}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-lg border border-secondary focus:border-accent focus:ring-1 focus:ring-accent outline-none text-content bg-primary/50"
            >
              {LOCATION_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          <div className="flex gap-4">
            <Button type="submit" loading={loading} className="flex-1">
              Gerar meu treino com IA
            </Button>
            <Button type="button" variant="secondary" onClick={() => navigate('/workouts')}>
              Cancelar
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
