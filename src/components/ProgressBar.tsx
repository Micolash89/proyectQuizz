"use client";

interface ProgressBarProps {
  current: number;
  total: number;
  timeElapsed?: number;
}

export function ProgressBar({ current, total, timeElapsed }: ProgressBarProps) {
  const percentage = (current / total) * 100;

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}m ${secs}s`;
  };

  return (
    <div className="w-full mb-6">
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm font-semibold text-slate-400">
          Pregunta {current} de {total}
        </span>
        {timeElapsed !== undefined && (
          <span className="text-xs text-slate-500">{formatTime(timeElapsed)}</span>
        )}
      </div>
      <div className="w-full h-2 bg-slate-700 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-blue-500 to-blue-600 transition-all duration-300"
          style={{ width: `${percentage}%` }}
        />
      </div>
      <p className="text-xs text-slate-500 mt-2">
        {percentage.toFixed(0)}% completado
      </p>
    </div>
  );
}
