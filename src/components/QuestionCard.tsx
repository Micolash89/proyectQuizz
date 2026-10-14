"use client";

import { useState, type ReactNode } from "react";
import {
  LuChevronDown,
  LuCircleCheck,
  LuCircleX,
} from "react-icons/lu";
import type { Question } from "@/types/quiz";

interface QuestionCardProps {
  question: Question;
  currentNumber: number;
  totalQuestions: number;
  onSelect: (answer: string | string[]) => void;
  hasAnswered: boolean;
  selectedAnswer?: string | string[];
  showFeedback: boolean;
  feedbackAnswer?: {
    isCorrect: boolean;
    justification: string;
  };
}

/** Estados visuales posibles de una opción. */
type OptionState = "idle" | "selected" | "correct" | "wrong" | "muted";

const OPTION_STATE_CLASSES: Record<OptionState, string> = {
  idle: "border-line bg-surface-2 text-gray-1 hover:border-gray-2 hover:bg-surface-3",
  selected: "border-secondary bg-primary text-secondary",
  correct: "border-success bg-success/10 text-success",
  wrong: "border-danger bg-danger/10 text-danger",
  muted: "border-line bg-surface-2 text-gray-3 opacity-60",
};

function optionClasses(state: OptionState, disabled: boolean) {
  return [
    "flex w-full items-start gap-3 rounded-lg border-2 p-4 text-left transition",
    OPTION_STATE_CLASSES[state],
    disabled ? "cursor-not-allowed" : "cursor-pointer",
  ].join(" ");
}

function OptionMarker({ state }: { state: OptionState }) {
  if (state === "correct") {
    return (
      <LuCircleCheck aria-hidden="true" className="mt-0.5 h-5 w-5 shrink-0" />
    );
  }
  if (state === "wrong") {
    return (
      <LuCircleX aria-hidden="true" className="mt-0.5 h-5 w-5 shrink-0" />
    );
  }
  return null;
}

function DifficultyBadge({ difficulty }: { difficulty: Question["difficulty"] }) {
  const map = {
    easy: {
      label: "Fácil",
      className: "border-success/40 bg-success/10 text-success",
    },
    medium: {
      label: "Medio",
      className: "border-warning/40 bg-warning/10 text-warning",
    },
    hard: {
      label: "Difícil",
      className: "border-danger/40 bg-danger/10 text-danger",
    },
  } as const;
  const { label, className } = map[difficulty];
  return (
    <span className={`rounded border px-3 py-1 text-xs font-medium ${className}`}>
      {label}
    </span>
  );
}

function Badge({ children }: { children: ReactNode }) {
  return (
    <span className="rounded border border-line bg-surface-2 px-3 py-1 text-xs font-medium text-gray-2">
      {children}
    </span>
  );
}

interface MultiAnswerGroupProps {
  question: Question;
  selectedAnswer?: string | string[];
  hasAnswered: boolean;
  showFeedback: boolean;
  onSelect: (answer: string | string[]) => void;
  getOptionState: (letter: string) => OptionState;
}

/**
 * Grupo de checkboxes para preguntas de respuesta múltiple.
 *
 * El componente padre lo renderiza con `key={question.id}`, de modo que al
 * cambiar de pregunta se remonta y el estado local se reinicializa a partir de
 * `selectedAnswer`. Así evitamos un efecto que sincronice estado.
 */
function MultiAnswerGroup({
  question,
  selectedAnswer,
  hasAnswered,
  showFeedback,
  onSelect,
  getOptionState,
}: MultiAnswerGroupProps) {
  const [selected, setSelected] = useState<Set<string>>(() =>
    Array.isArray(selectedAnswer) ? new Set(selectedAnswer) : new Set()
  );

  const toggle = (letter: string) => {
    if (hasAnswered) return;
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(letter)) {
        next.delete(letter);
      } else {
        next.add(letter);
      }
      return next;
    });
  };

  const submit = () => {
    if (selected.size > 0 && !hasAnswered) {
      onSelect(Array.from(selected));
    }
  };

  return (
    <div>
      <div className="mb-4 space-y-2">
        {question.options.map((option) => (
          <label
            key={option.letter}
            className={optionClasses(getOptionState(option.letter), hasAnswered)}
          >
            <OptionMarker state={getOptionState(option.letter)} />
            {!showFeedback && (
              <input
                type="checkbox"
                checked={selected.has(option.letter)}
                onChange={() => toggle(option.letter)}
                disabled={hasAnswered}
                className="mt-1 h-4 w-4 cursor-pointer accent-secondary"
              />
            )}
            <span>
              <span className="font-semibold">{option.letter})</span>{" "}
              {option.text}
            </span>
          </label>
        ))}
      </div>

      {!hasAnswered && selected.size > 0 && (
        <button
          type="button"
          onClick={submit}
          className="w-full rounded-lg bg-secondary px-4 py-2 font-semibold text-primary transition hover:bg-gray-1"
        >
          Confirmar respuestas ({selected.size})
        </button>
      )}
    </div>
  );
}

export function QuestionCard({
  question,
  currentNumber,
  totalQuestions,
  onSelect,
  hasAnswered,
  selectedAnswer,
  showFeedback,
  feedbackAnswer,
}: QuestionCardProps) {
  const [expanded, setExpanded] = useState(true);
  const isMultiAnswer = Array.isArray(question.correctAnswer);

  const isCorrectOption = (letter: string): boolean =>
    Array.isArray(question.correctAnswer)
      ? question.correctAnswer.includes(letter)
      : question.correctAnswer === letter;

  const isSelected = (letter: string): boolean =>
    Array.isArray(selectedAnswer)
      ? selectedAnswer.includes(letter)
      : selectedAnswer === letter;

  const isUserWrongSelection = (letter: string): boolean =>
    showFeedback &&
    !feedbackAnswer?.isCorrect &&
    isSelected(letter) &&
    !isCorrectOption(letter);

  const getOptionState = (letter: string): OptionState => {
    if (!showFeedback) {
      return isSelected(letter) ? "selected" : "idle";
    }
    if (isCorrectOption(letter)) return "correct";
    if (isUserWrongSelection(letter)) return "wrong";
    return "muted";
  };

  return (
    <div className="mx-auto w-full max-w-4xl">
      {/* Header */}
      <div className="mb-6 border-b border-line pb-4">
        <div className="mb-3 flex items-start justify-between gap-4">
          <div>
            <h2 className="text-sm font-semibold text-gray-3">
              Pregunta {currentNumber} de {totalQuestions}
            </h2>
            <p className="mt-1 text-xs text-gray-3">
              {totalQuestions > 0
                ? ((currentNumber / totalQuestions) * 100).toFixed(0)
                : 0}
              % completado
            </p>
          </div>
          <div className="flex flex-wrap justify-end gap-2">
            <DifficultyBadge difficulty={question.difficulty} />
            <Badge>{question.category.replace(/_/g, " ")}</Badge>
            {isMultiAnswer && <Badge>Múltiples respuestas</Badge>}
          </div>
        </div>
      </div>

      {/* Question */}
      <div className="mb-8">
        <h3 className="mb-6 text-lg font-semibold leading-relaxed text-gray-1">
          {question.text}
        </h3>

        {!isMultiAnswer && (
          <div className="space-y-2">
            {question.options.map((option) => {
              const state = getOptionState(option.letter);
              return (
                <button
                  key={option.letter}
                  type="button"
                  onClick={() => !hasAnswered && onSelect(option.letter)}
                  disabled={hasAnswered}
                  className={optionClasses(state, hasAnswered)}
                >
                  <OptionMarker state={state} />
                  <span>
                    <span className="font-semibold">{option.letter})</span>{" "}
                    {option.text}
                  </span>
                </button>
              );
            })}
          </div>
        )}

        {isMultiAnswer && (
          <MultiAnswerGroup
            key={question.id}
            question={question}
            selectedAnswer={selectedAnswer}
            hasAnswered={hasAnswered}
            showFeedback={showFeedback}
            onSelect={onSelect}
            getOptionState={getOptionState}
          />
        )}
      </div>

      {/* Feedback */}
      {showFeedback && feedbackAnswer && (
        <div
          className={`mb-8 rounded-lg border-l-4 p-4 ${
            feedbackAnswer.isCorrect
              ? "border-success bg-success/10"
              : "border-danger bg-danger/10"
          }`}
        >
          <div className="mb-3 flex items-center gap-2">
            {feedbackAnswer.isCorrect ? (
              <LuCircleCheck aria-hidden="true" className="h-5 w-5 text-success" />
            ) : (
              <LuCircleX aria-hidden="true" className="h-5 w-5 text-danger" />
            )}
            <span
              className={`text-lg font-bold ${
                feedbackAnswer.isCorrect ? "text-success" : "text-danger"
              }`}
            >
              {feedbackAnswer.isCorrect ? "CORRECTO" : "INCORRECTO"}
            </span>
          </div>

          <button
            type="button"
            onClick={() => setExpanded((prev) => !prev)}
            aria-expanded={expanded}
            className="inline-flex items-center gap-1 text-sm font-semibold text-gray-1 transition hover:text-secondary"
          >
            <LuChevronDown
              aria-hidden="true"
              className={`h-4 w-4 transition-transform ${expanded ? "" : "-rotate-90"}`}
            />
            Justificación
          </button>

          {expanded && (
            <div className="mt-3 rounded bg-surface-2 p-3 text-sm leading-relaxed text-gray-1">
              <p>{feedbackAnswer.justification}</p>
              <p className="mt-3 text-xs text-gray-3">Fuente: {question.source}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
