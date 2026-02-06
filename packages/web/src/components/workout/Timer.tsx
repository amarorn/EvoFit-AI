import { useEffect, useState } from 'react';

interface TimerProps {
  seconds: number;
  onComplete: () => void;
  running: boolean;
}

export function Timer({ seconds, onComplete, running }: TimerProps) {
  const [remaining, setRemaining] = useState(seconds);

  useEffect(() => {
    if (!running) return;
    setRemaining(seconds);
  }, [seconds, running]);

  useEffect(() => {
    if (!running || remaining <= 0) return;
    const t = setInterval(() => {
      setRemaining((r) => {
        if (r <= 1) {
          clearInterval(t);
          onComplete();
          return 0;
        }
        return r - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [running, remaining, onComplete]);

  const m = Math.floor(remaining / 60);
  const s = remaining % 60;
  const display = `${m}:${s.toString().padStart(2, '0')}`;

  return (
    <div className="text-center">
      <div className="font-heading font-bold text-5xl text-accent tabular-nums">{display}</div>
      <p className="text-muted text-sm mt-1">Descanso</p>
    </div>
  );
}
