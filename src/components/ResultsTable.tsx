"use client";

import { useState } from "react";
import { LuCircleCheck, LuCircleX, LuEye, LuEyeOff } from "react-icons/lu";
import type { Question, UserAnswer } from "@/types/quiz";

interface ResultsTableProps {
  results: UserAnswer[];
  allQuestions: Question[];
}

const DIFFICULTY_LABELS: Record<string, { label: string; className: string }> = {
  easy: { label: "Fácil", className: "text-success" },
  medium: { label: "Medio", className: "text-warning" },
  hard: { label: "Difícil", className: "text-danger" },
};

function formatAnswer(answer: string | string[]): string {
  return Array.isArray(answer) ? answer.join(", ") : answer;
}

function formatCategory(category: string): string {
  return category.replace(/_/g, " ");
}

export function ResultsTable({ results, allQuestions }: ResultsTableProps) {
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const questionById = new Map(allQuestions.map((q) => [q.id, q]));

  return (
    <div className="w-full overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-line">
            <th className="px-4 py-3 text-left font-semibold text-gray-3">#</th>
            <th className="px-4 py-3 text-left font-semibold text-gray-3">
              Tu Respuesta
            </th>
            <th className="px-4 py-3 text-left font-semibold text-gray-3">
              Correcta
            </th>
            <th className="px-4 py-3 text-left font-semibold text-gray-3">
              Resultado
            </th>
            <th className="px-4 py-3 text-left font-semibold text-gray-3">
              Dificultad
            </th>
            <th className="px-4 py-3 text-left font-semibold text-gray-3">
              Categoría
            </th>
            <th className="px-4 py-3 text-left font-semibold text-gray-3">
              Detalle
            </th>
          </tr>
        </thead>
        <tbody>
          {results.map((result, index) => {
            const question = questionById.get(result.questionId);
            const difficulty =
              DIFFICULTY_LABELS[result.difficulty] ?? DIFFICULTY_LABELS.easy;
            const isExpanded = expandedId === result.questionId;

            return (
              <FragmentRow
                key={result.questionId}
                index={index}
                result={result}
                question={question}
                difficultyClass={difficulty.className}
                difficultyLabel={difficulty.label}
                isExpanded={isExpanded}
                onToggle={() =>
                  setExpandedId(isExpanded ? null : result.questionId)
                }
              />
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

interface FragmentRowProps {
  index: number;
  result: UserAnswer;
  question?: Question;
  difficultyClass: string;
  difficultyLabel: string;
  isExpanded: boolean;
  onToggle: () => void;
}

function FragmentRow({
  index,
  result,
  question,
  difficultyClass,
  difficultyLabel,
  isExpanded,
  onToggle,
}: FragmentRowProps) {
  return (
    <>
      <tr className="border-b border-line transition hover:bg-surface-2">
        <td className="px-4 py-3 text-gray-3">{index + 1}</td>
        <td className="px-4 py-3 text-gray-1">
          {formatAnswer(result.selectedAnswer)}
        </td>
        <td className="px-4 py-3 text-gray-1">
          {formatAnswer(result.correctAnswer)}
        </td>
        <td className="px-4 py-3">
          {result.isCorrect ? (
            <LuCircleCheck
              aria-label="Correcto"
              className="h-4 w-4 text-success"
            />
          ) : (
            <LuCircleX
              aria-label="Incorrecto"
              className="h-4 w-4 text-danger"
            />
          )}
        </td>
        <td className={`px-4 py-3 font-medium ${difficultyClass}`}>
          {difficultyLabel}
        </td>
        <td className="px-4 py-3 text-xs text-gray-3">
          {formatCategory(result.category)}
        </td>
        <td className="px-4 py-3">
          <button
            type="button"
            onClick={onToggle}
            aria-expanded={isExpanded}
            className="inline-flex items-center gap-1 text-xs font-medium text-gray-1 underline transition hover:text-secondary"
          >
            {isExpanded ? (
              <>
                <LuEyeOff aria-hidden="true" className="h-3.5 w-3.5" />
                Ocultar
              </>
            ) : (
              <>
                <LuEye aria-hidden="true" className="h-3.5 w-3.5" />
                Ver
              </>
            )}
          </button>
        </td>
      </tr>

      {isExpanded && (
        <tr className="border-b border-line bg-surface-2/50">
          <td colSpan={7} className="px-4 py-4">
            <h4 className="mb-2 font-semibold text-gray-1">Pregunta:</h4>
            <p className="mb-4 text-gray-1">{result.questionText}</p>

            <h4 className="mb-2 font-semibold text-gray-1">Justificación:</h4>
            <p className="mb-3 leading-relaxed text-gray-3">
              {question?.justification}
            </p>

            <p className="text-xs text-gray-3">Fuente: {question?.source}</p>
            {question?.relatedConcepts && question.relatedConcepts.length > 0 && (
              <div className="mt-3 border-t border-line pt-3">
                <p className="text-xs text-gray-3">
                  <strong className="text-gray-1">Conceptos relacionados:</strong>{" "}
                  {question.relatedConcepts.join(", ")}
                </p>
              </div>
            )}
          </td>
        </tr>
      )}
    </>
  );
}
