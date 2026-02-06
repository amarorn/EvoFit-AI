import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/Button';

export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await register(email, password, name);
      navigate('/');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erro ao cadastrar');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-primary p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="font-heading font-bold text-3xl text-accent">EvoFit-AI</h1>
          <p className="text-secondary mt-1">Seu Treino, Sua Inteligencia</p>
        </div>

        <div className="bg-secondary rounded-xl p-8 shadow-xl border border-accent/20">
          <h2 className="font-heading font-semibold text-xl text-white mb-6">
            Criar conta
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 rounded-lg bg-red-500/20 text-red-400 text-sm">
                {error}
              </div>
            )}

            <div>
              <label className="block text-white/80 text-sm mb-1">Nome</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-3 rounded-lg bg-primary border border-secondary focus:border-accent focus:ring-1 focus:ring-accent outline-none text-white"
                placeholder="Seu nome"
                required
              />
            </div>

            <div>
              <label className="block text-white/80 text-sm mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-lg bg-primary border border-secondary focus:border-accent focus:ring-1 focus:ring-accent outline-none text-white"
                placeholder="seu@email.com"
                required
              />
            </div>

            <div>
              <label className="block text-white/80 text-sm mb-1">Senha (min 6 caracteres)</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-lg bg-primary border border-secondary focus:border-accent focus:ring-1 focus:ring-accent outline-none text-white"
                placeholder="••••••••"
                minLength={6}
                required
              />
            </div>

            <Button type="submit" loading={loading} className="w-full">
              Cadastrar
            </Button>
          </form>

          <p className="mt-6 text-center text-white/70 text-sm">
            Ja tem conta?{' '}
            <Link to="/login" className="text-accent hover:underline">
              Entrar
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
