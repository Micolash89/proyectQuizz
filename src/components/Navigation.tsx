"use client";

import {
  LuArrowRight,
  LuChevronLeft,
  LuFlag,
  LuSkipForward,
} from "react-icons/lu";

interface NavigationProps {
  onPrevious: () => void;
  onNext: () => void;
  onSkip: () => void;
  onFinish: () => void;
  hasPrevious: boolean;
  hasNext: boolean;
  isLastQuestion: boolean;
  hasAnswered: boolean;
}

const secondaryButton =
  "inline-flex items-center gap-1.5 rounded-lg border border-line bg-surface px-4 py-2 text-sm font-medium text-gray-1 transition hover:border-gray-2 hover:bg-surface-2 disabled:cursor-not-allowed disabled:opacity-40";

const primaryButton =
  "inline-flex items-center gap-1.5 rounded-lg bg-secondary px-6 py-2 text-sm font-semibold text-primary transition hover:bg-gray-1 disabled:cursor-not-allowed disabled:opacity-40";

export function Navigation({
  onPrevious,
  onNext,
  onSkip,
  onFinish,
  hasPrevious,
  hasNext,
  isLastQuestion,
  hasAnswered,
}: NavigationProps) {
  return (
    <div className="flex justify-between gap-3 border-t border-line pt-6">
      <button
        type="button"
        onClick={onPrevious}
        disabled={!hasPrevious}
        className={secondaryButton}
      >
        <LuChevronLeft aria-hidden="true" className="h-4 w-4" />
        Anterior
      </button>

      <div className="flex gap-2">
        <button
          type="button"
          onClick={onSkip}
          disabled={!hasNext || !hasAnswered}
          className={secondaryButton}
        >
          <LuSkipForward aria-hidden="true" className="h-4 w-4" />
          Saltar
        </button>

        {isLastQuestion ? (
          <button
            type="button"
            onClick={onFinish}
            disabled={!hasAnswered}
            className={primaryButton}
          >
            <LuFlag aria-hidden="true" className="h-4 w-4" />
            Terminar Quiz
          </button>
        ) : (
          <button
            type="button"
            onClick={onNext}
            disabled={!hasAnswered}
            className={primaryButton}
          >
            Siguiente
            <LuArrowRight aria-hidden="true" className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  );
}
