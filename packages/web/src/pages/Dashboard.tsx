import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { useAuth } from '../contexts/AuthContext';
import { Card } from '../components/ui/Card';
import { progressApi, ProgressStats } from '../api/progress';
import { workoutsApi, WorkoutPlan } from '../api/workouts';

const CHART_COLOR = '#00FFFF';

const chartStyle = {
  gridStroke: 'rgba(0, 255, 255, 0.15)',
  axisStroke: '#415A77',
  tooltip: { backgroundColor: '#0D1B2A', border: '1px solid rgba(0, 255, 255, 0.4)', borderRadius: 8 },
};

export default function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState<ProgressStats | null>(null);
  const [workouts, setWorkouts] = useState<WorkoutPlan[]>([]);
  const [activeTab, setActiveTab] = useState<'overview' | 'workouts' | 'progress'>('overview');
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

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin h-12 w-12 border-2 border-accent border-t-transparent rounded-full" />
      </div>
    );
  }

  const weeklyWorkoutData = [
    { day: 'Seg', value: stats?.workoutsCompleted ? Math.min(100, (stats.workoutsCompleted / 7) * 100 + 20) : 40 },
    { day: 'Ter', value: 55 },
    { day: 'Qua', value: 70 },
    { day: 'Qui', value: 45 },
    { day: 'Sex', value: 85 },
  ];
  const workoutTotal = 560;

  const totalCal = stats?.totalCalories ?? 2400;
  const caloriesData = [
    { day: 'Seg', value: Math.round(totalCal * 0.12) },
    { day: 'Ter', value: Math.round(totalCal * 0.18) },
    { day: 'Qua', value: Math.round(totalCal * 0.11) },
    { day: 'Qui', value: Math.round(totalCal * 0.22) },
    { day: 'Sex', value: Math.round(totalCal * 0.15) },
    { day: 'Sab', value: Math.round(totalCal * 0.22) },
  ];

  const exercisesData = [
    { day: '1', value: 4 },
    { day: '2', value: 8 },
    { day: '3', value: 12 },
    { day: '4', value: 16 },
    { day: '5', value: 24 },
    { day: '6', value: 40 },
  ];

  const activityLevelData = [
    { day: 'Seg 18', value: 22 },
    { day: 'Ter 22', value: 35 },
    { day: 'Qua 24', value: 45 },
    { day: 'Qui 30', value: 65 },
    { day: 'Sex 13', value: 35 },
    { day: 'Sab 14', value: 40 },
    { day: 'Dom 8', value: 92 },
  ];

  const nextWorkouts = workouts.filter((w) => w.status === 'active').slice(0, 2);
  const firstWorkout = nextWorkouts[0];
  const secondWorkout = nextWorkouts[1] ?? firstWorkout;

  const getWorkoutMeta = (w: WorkoutPlan) => {
    const exs = w.dailyWorkouts?.[0]?.exercises ?? w.exercises ?? [];
    const totalMins = exs.length * 3 + 10;
    return { exercises: exs.length, minutes: totalMins, title: w.dailyWorkouts?.[0]?.weekday ?? w.title };
  };

  return (
    <div className="flex flex-col min-h-full">
      <header className="flex-shrink-0 bg-secondary/40 border-b border-accent/20 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-accent/20 flex items-center justify-center overflow-hidden">
              {user?.name?.charAt(0)?.toUpperCase() ?? '?'}
            </div>
            <div>
              <h1 className="font-heading font-bold text-xl text-content">
                Welcome, {user?.name?.split(' ')[0] ?? 'User'}
              </h1>
              <p className="text-muted text-sm">Greeting for AI personal trainer!</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link
              to="/chat"
              className="p-2 rounded-lg text-muted hover:text-accent hover:bg-accent/10 transition-all"
              title="Chat IA"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </Link>
            <button className="p-2 rounded-lg text-muted hover:text-accent hover:bg-accent/10 transition-all" title="Notifications">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
            </button>
            <button className="p-2 rounded-lg text-muted hover:text-accent hover:bg-accent/10 transition-all" title="Share">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
            </button>
            <button
              onClick={handleLogout}
              className="p-2 rounded-lg text-muted hover:text-accent hover:bg-accent/10 transition-all"
              title="Logout"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </button>
          </div>
        </div>
        <div className="flex gap-6 mt-4 border-b border-accent/10 -mb-px">
          {(['overview', 'workouts', 'progress'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-3 text-sm font-medium transition-colors ${
                activeTab === tab
                  ? 'text-accent border-b-2 border-accent'
                  : 'text-muted hover:text-content'
              }`}
            >
              {tab === 'overview' ? 'Overview' : tab === 'workouts' ? 'Workouts' : 'Progress'}
              {tab === 'workouts' && (workouts.filter((w) => w.status === 'active').length > 0) && (
                <span className="ml-1.5 inline-flex items-center justify-center w-5 h-5 text-xs rounded-full bg-accent text-on-accent">
                  1
                </span>
              )}
            </button>
          ))}
        </div>
      </header>

      <div className="flex-1 p-6 app-bg">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="border-accent/30">
              <h3 className="font-heading font-semibold text-content text-sm mb-2">Weekly Workout Progress</h3>
              <div className="flex items-center gap-4">
                <div className="relative w-24 h-24 flex-shrink-0">
                  <svg className="w-24 h-24 -rotate-90">
                    <circle cx="48" cy="48" r="40" fill="none" stroke="#415A77" strokeWidth="8" />
                    <circle
                      cx="48"
                      cy="48"
                      r="40"
                      fill="none"
                      stroke={CHART_COLOR}
                      strokeWidth="8"
                      strokeDasharray={`${((stats?.workoutsCompleted ?? 0) / 7) * 251} 251`}
                      strokeLinecap="round"
                    />
                  </svg>
                  <span className="absolute inset-0 flex items-center justify-center font-heading font-bold text-accent text-sm">
                    {workoutTotal}
                  </span>
                </div>
                <div className="flex-1 h-16 min-w-0">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={weeklyWorkoutData}>
                      <Line type="monotone" dataKey="value" stroke={CHART_COLOR} strokeWidth={2} dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </Card>

            <Card className="border-accent/30">
              <h3 className="font-heading font-semibold text-content text-sm mb-4">Calories Burned (Last 7 Days)</h3>
              <div className="h-28">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={caloriesData}>
                    <XAxis dataKey="day" stroke={chartStyle.axisStroke} fontSize={10} />
                    <YAxis stroke={chartStyle.axisStroke} fontSize={10} domain={[0, 1000]} />
                    <Tooltip contentStyle={chartStyle.tooltip} />
                    <Bar dataKey="value" fill={CHART_COLOR} radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>

            <Card className="border-accent/30">
              <h3 className="font-heading font-semibold text-content text-sm mb-4">Exercises Completed</h3>
              <div className="h-28">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={exercisesData}>
                    <XAxis dataKey="day" stroke={chartStyle.axisStroke} fontSize={10} />
                    <YAxis stroke={chartStyle.axisStroke} fontSize={10} domain={[0, 50]} />
                    <Tooltip contentStyle={chartStyle.tooltip} />
                    <Line
                      type="monotone"
                      dataKey="value"
                      stroke={CHART_COLOR}
                      strokeWidth={2}
                      dot={{ fill: CHART_COLOR, r: 3 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <p className="text-accent font-heading font-bold text-lg mt-1">{stats?.exercisesCompleted ?? 40}</p>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="border-accent/30">
              <h3 className="font-heading font-semibold text-content mb-4">Weekly Activity Level</h3>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={activityLevelData}>
                    <defs>
                      <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={CHART_COLOR} stopOpacity={0.4} />
                        <stop offset="100%" stopColor={CHART_COLOR} stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke={chartStyle.gridStroke} />
                    <XAxis dataKey="day" stroke={chartStyle.axisStroke} fontSize={11} />
                    <YAxis stroke={chartStyle.axisStroke} fontSize={11} domain={[0, 100]} />
                    <Tooltip contentStyle={chartStyle.tooltip} />
                    <Area
                      type="monotone"
                      dataKey="value"
                      stroke={CHART_COLOR}
                      strokeWidth={2}
                      fill="url(#areaGradient)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
              <p className="text-accent text-sm mt-2">Personal Best</p>
            </Card>

            <Card className="border-accent/30">
              <h3 className="font-heading font-semibold text-content mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <Link
                  to="/workouts"
                  className="flex items-center gap-3 w-full px-4 py-3 rounded-xl bg-accent text-on-accent font-medium hover:bg-accent/90 transition-colors"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                  </svg>
                  Start Workout
                </Link>
                <Link
                  to="/nutrition"
                  className="flex items-center gap-3 w-full px-4 py-3 rounded-xl bg-accent text-on-accent font-medium hover:bg-accent/90 transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Log Meal
                </Link>
                <Link
                  to="/workouts"
                  className="flex items-center gap-3 w-full px-4 py-3 rounded-xl bg-accent text-on-accent font-medium hover:bg-accent/90 transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  Plan Week
                </Link>
              </div>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="border-accent/30">
              <h3 className="font-heading font-bold text-content mb-2">
                {firstWorkout ? getWorkoutMeta(firstWorkout).title : 'HIIT Circuit'}
              </h3>
              <p className="text-muted text-sm mb-4">
                {firstWorkout
                  ? `Treino completo com exercicios variados para ${firstWorkout.title?.toLowerCase() ?? 'forca e resistencia'}.`
                  : 'HIIT circuit com exercicios e treino de resistencia.'}
              </p>
              <p className="text-muted text-sm mb-4">
                {firstWorkout
                  ? `${getWorkoutMeta(firstWorkout).exercises} exercicios • ${getWorkoutMeta(firstWorkout).minutes} min`
                  : '9 exercicios • 7 min'}
              </p>
              <div className="flex gap-2">
                <Link
                  to={firstWorkout ? `/workouts/${firstWorkout.id}/execute` : '/workouts'}
                  className="px-4 py-2 rounded-lg border border-accent/50 text-accent text-sm font-medium hover:bg-accent/10"
                >
                  Learn More
                </Link>
                <Link
                  to={firstWorkout ? `/workouts/${firstWorkout.id}/execute` : '/assessment'}
                  className="px-4 py-2 rounded-lg bg-accent text-on-accent text-sm font-medium hover:bg-accent/90"
                >
                  {firstWorkout ? 'Start' : 'Ver Plano'}
                </Link>
              </div>
            </Card>

            <Card className="border-accent/30">
              <h3 className="font-heading font-bold text-content mb-2">
                {secondWorkout ? getWorkoutMeta(secondWorkout).title : 'Strength Training'}
              </h3>
              <p className="text-muted text-sm mb-4">
                {secondWorkout
                  ? `Treino de forca focado em ${secondWorkout.title?.toLowerCase() ?? 'grupos musculares'}`
                  : 'Treino de forca para ganho de massa e resistencia muscular.'}
              </p>
              <p className="text-muted text-sm mb-4">
                {secondWorkout
                  ? `${getWorkoutMeta(secondWorkout).exercises} exercicios • ${getWorkoutMeta(secondWorkout).minutes} min`
                  : '3 exercicios • 3 min'}
              </p>
              <div className="flex gap-2">
                <Link
                  to={secondWorkout ? `/workouts/${secondWorkout.id}/execute` : '/workouts'}
                  className="px-4 py-2 rounded-lg border border-accent/50 text-accent text-sm font-medium hover:bg-accent/10"
                >
                  Learn More
                </Link>
                <Link
                  to={secondWorkout ? `/workouts/${secondWorkout.id}/execute` : '/assessment'}
                  className="px-4 py-2 rounded-lg bg-accent text-on-accent text-sm font-medium hover:bg-accent/90"
                >
                  {secondWorkout ? 'Start' : 'Ver Plano'}
                </Link>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
