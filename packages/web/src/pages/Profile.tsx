import { useEffect, useState } from 'react';
import { usersApi, UserProfile, FitnessLevel } from '../api/users';
import { useAuth } from '../contexts/AuthContext';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';

const FITNESS_LEVELS: { value: FitnessLevel; label: string }[] = [
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

export default function Profile() {
  const { user: authUser, updateUser } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [form, setForm] = useState({
    name: '',
    age: '',
    gender: '',
    weight: '',
    height: '',
    fitnessLevel: 'beginner' as FitnessLevel,
    goals: [] as string[],
  });

  useEffect(() => {
    usersApi
      .getMe()
      .then(({ data }) => {
        setProfile(data);
        setForm({
          name: data.name ?? '',
          age: data.age?.toString() ?? '',
          gender: data.gender ?? '',
          weight: data.weight?.toString() ?? '',
          height: data.height?.toString() ?? '',
          fitnessLevel: (data.fitnessLevel as FitnessLevel) ?? 'beginner',
          goals: data.goals ?? [],
        });
      })
      .catch(() => {
        setProfile(null);
      })
      .finally(() => setLoading(false));
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleGoalsChange = (value: string, checked: boolean) => {
    setForm((prev) => {
      const goals = checked
        ? [...prev.goals, value]
        : prev.goals.filter((g) => g !== value);
      return { ...prev, goals };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSuccess(false);
    try {
      const payload = {
        name: form.name || undefined,
        age: form.age ? parseInt(form.age, 10) : undefined,
        gender: form.gender || undefined,
        weight: form.weight ? parseFloat(form.weight) : undefined,
        height: form.height ? parseFloat(form.height) : undefined,
        fitnessLevel: form.fitnessLevel,
        goals: form.goals.length > 0 ? form.goals : undefined,
      };

      const { data } = await usersApi.updateProfile(payload);
      setProfile(data);

      updateUser({ id: data.id, email: data.email, name: data.name });

      setSuccess(true);
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
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
    <div className="max-w-2xl space-y-6">
      <h1 className="font-heading font-bold text-2xl text-content">
        Meu perfil
      </h1>

      <Card>
        <form onSubmit={handleSubmit} className="space-y-6">
          {success && (
            <div className="p-4 rounded-lg bg-green-500/20 text-green-400 text-sm">
              Perfil atualizado com sucesso.
            </div>
          )}

          <div>
            <label className="block text-muted text-sm font-medium mb-1">
              Nome
            </label>
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-lg border border-secondary focus:border-accent focus:ring-1 focus:ring-accent outline-none text-content bg-primary/50"
              placeholder="Seu nome"
            />
          </div>

          <div>
            <label className="block text-muted text-sm font-medium mb-1">
              Email
            </label>
            <input
              type="email"
              value={profile?.email ?? authUser?.email ?? ''}
              disabled
              className="w-full px-4 py-3 rounded-lg border border-secondary bg-secondary/50 text-muted"
            />
            <p className="text-muted text-xs mt-1">
              O email nao pode ser alterado.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-muted text-sm font-medium mb-1">
                Idade (anos)
              </label>
              <input
                type="number"
                name="age"
                value={form.age}
                onChange={handleChange}
                min={14}
                max={120}
                className="w-full px-4 py-3 rounded-lg border border-secondary focus:border-accent focus:ring-1 focus:ring-accent outline-none text-content bg-primary/50"
                placeholder="25"
              />
            </div>
            <div>
              <label className="block text-muted text-sm font-medium mb-1">
                Genero
              </label>
              <select
                name="gender"
                value={form.gender}
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
              <label className="block text-muted text-sm font-medium mb-1">
                Peso (kg)
              </label>
              <input
                type="number"
                name="weight"
                value={form.weight}
                onChange={handleChange}
                min={30}
                max={300}
                step={0.1}
                className="w-full px-4 py-3 rounded-lg border border-secondary focus:border-accent focus:ring-1 focus:ring-accent outline-none text-content bg-primary/50"
                placeholder="70"
              />
            </div>
            <div>
              <label className="block text-muted text-sm font-medium mb-1">
                Altura (cm)
              </label>
              <input
                type="number"
                name="height"
                value={form.height}
                onChange={handleChange}
                min={100}
                max={250}
                className="w-full px-4 py-3 rounded-lg border border-secondary focus:border-accent focus:ring-1 focus:ring-accent outline-none text-content bg-primary/50"
                placeholder="175"
              />
            </div>
          </div>

          <div>
            <label className="block text-muted text-sm font-medium mb-2">
              Nivel de fitness
            </label>
            <select
              name="fitnessLevel"
              value={form.fitnessLevel}
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
            <label className="block text-muted text-sm font-medium mb-2">
              Objetivos
            </label>
            <div className="space-y-2">
              {GOALS_OPTIONS.map((opt) => (
                <label
                  key={opt.value}
                  className="flex items-center gap-2 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={form.goals.includes(opt.value)}
                    onChange={(e) =>
                      handleGoalsChange(opt.value, e.target.checked)
                    }
                    className="rounded border-secondary text-accent focus:ring-accent"
                  />
                  <span className="text-content">{opt.label}</span>
                </label>
              ))}
            </div>
          </div>

          <Button type="submit" loading={saving} className="w-full sm:w-auto">
            Salvar alteracoes
          </Button>
        </form>
      </Card>
    </div>
  );
}
