"use client";

interface NavigationProps {
  onPrevious: () => void;
  onNext: () => void;
  onSkip: () => void;
  onFinish: () => void;
  hasPrevious: boolean;
  hasNext: boolean;
  canAnswerNext: boolean;
  isLastQuestion: boolean;
  hasAnswered: boolean;
}

export function Navigation({
  onPrevious,
  onNext,
  onSkip,
  onFinish,
  hasPrevious,
  hasNext,
  canAnswerNext,
  isLastQuestion,
  hasAnswered,
}: NavigationProps) {
  return (
    <div className="flex gap-3 justify-between pt-6 border-t border-slate-700">
      <button
        onClick={onPrevious}
        disabled={!hasPrevious}
        className="px-4 py-2 rounded bg-slate-700 text-slate-300 hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed transition text-sm font-medium"
      >
        ← Anterior
      </button>

      <div className="flex gap-2">
        <button
          onClick={onSkip}
          disabled={!hasNext || !hasAnswered}
          className="px-4 py-2 rounded bg-slate-700 text-slate-300 hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed transition text-sm font-medium"
        >
          Saltar
        </button>

        {isLastQuestion ? (
          <button
            onClick={onFinish}
            disabled={!hasAnswered}
            className="px-6 py-2 rounded bg-green-600 text-white hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition text-sm font-medium"
          >
            Terminar Quiz
          </button>
        ) : (
          <button
            onClick={onNext}
            disabled={!hasAnswered}
            className="px-6 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition text-sm font-medium"
          >
            Siguiente →
          </button>
        )}
      </div>
    </div>
  );
}
