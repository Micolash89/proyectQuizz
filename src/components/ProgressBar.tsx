"use client";

import { LuClock } from "react-icons/lu";

interface ProgressBarProps {
  current: number;
  total: number;
  timeElapsed?: number;
}

export function ProgressBar({ current, total, timeElapsed }: ProgressBarProps) {
  const percentage = total > 0 ? (current / total) * 100 : 0;

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}m ${secs}s`;
  };

  return (
    <div className="mb-6 w-full">
      <div className="mb-2 flex items-center justify-between">
        <span className="text-sm font-semibold text-gray-3">
          Pregunta {current} de {total}
        </span>
        {timeElapsed !== undefined && (
          <span className="inline-flex items-center gap-1 text-xs text-gray-3">
            <LuClock aria-hidden="true" className="h-3.5 w-3.5" />
            {formatTime(timeElapsed)}
          </span>
        )}
      </div>
      <div
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={total}
        aria-valuenow={current}
        aria-label="Progreso del quiz"
        className="h-2 w-full overflow-hidden rounded-full bg-surface-3"
      >
        <div
          className="h-full bg-secondary transition-all duration-300"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
