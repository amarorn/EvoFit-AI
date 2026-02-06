import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navClass = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
      isActive ? 'bg-accent/20 text-accent' : 'text-white/80 hover:bg-secondary/50'
    }`;

  return (
    <div className="flex min-h-screen bg-primary">
      <aside className="w-64 bg-primary border-r border-secondary/50 flex flex-col">
        <div className="p-6">
          <h1 className="font-heading font-bold text-xl text-accent">EvoFit-AI</h1>
          <p className="text-secondary text-sm">Personal Trainer</p>
        </div>
        <nav className="flex-1 px-3 space-y-1">
          <NavLink to="/" end className={navClass}>
            <span>Dashboard</span>
          </NavLink>
          <NavLink to="/workouts" className={navClass}>
            <span>Treinos</span>
          </NavLink>
          <NavLink to="/assessment" className={navClass}>
            <span>Avaliacao</span>
          </NavLink>
          <NavLink to="/progress" className={navClass}>
            <span>Progresso</span>
          </NavLink>
          <NavLink to="/chat" className={navClass}>
            <span>Chat IA</span>
          </NavLink>
          <NavLink to="/profile" className={navClass}>
            <span>Perfil</span>
          </NavLink>
        </nav>
      </aside>

      <main className="flex-1 flex flex-col bg-bg-light">
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6">
          <div>
            <h2 className="font-heading font-semibold text-primary">Bem-vindo(a), {user?.name}</h2>
            <p className="text-secondary text-sm">Treino personalizado com IA</p>
          </div>
          <button
            onClick={handleLogout}
            className="px-4 py-2 text-secondary hover:text-primary border border-secondary rounded-lg hover:border-accent transition-colors"
          >
            Sair
          </button>
        </header>

        <div className="flex-1 p-6 overflow-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
