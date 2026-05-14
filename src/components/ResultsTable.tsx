"use client";

import { UserAnswer, Question } from "@/types/quiz";
import { useState } from "react";

interface ResultsTableProps {
  results: UserAnswer[];
  allQuestions: Question[];
}

export function ResultsTable({ results, allQuestions }: ResultsTableProps) {
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const getQuestionText = (id: number) => {
    return allQuestions.find((q) => q.id === id)?.text || "Pregunta no encontrada";
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "easy":
        return "text-green-400";
      case "medium":
        return "text-yellow-400";
      case "hard":
        return "text-red-400";
      default:
        return "text-slate-300";
    }
  };

  return (
    <div className="w-full overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-slate-600">
            <th className="text-left px-4 py-3 font-semibold text-slate-300">#</th>
            <th className="text-left px-4 py-3 font-semibold text-slate-300">Tu Respuesta</th>
            <th className="text-left px-4 py-3 font-semibold text-slate-300">Correcta</th>
            <th className="text-left px-4 py-3 font-semibold text-slate-300">Resultado</th>
            <th className="text-left px-4 py-3 font-semibold text-slate-300">Dificultad</th>
            <th className="text-left px-4 py-3 font-semibold text-slate-300">Categoría</th>
          </tr>
        </thead>
        <tbody>
          {results.map((result, index) => (
            <tr key={result.questionId} className="border-b border-slate-700 hover:bg-slate-800/30">
              <td className="px-4 py-3 text-slate-400">{index + 1}</td>
              <td className="px-4 py-3 text-slate-300">{result.selectedAnswer}</td>
              <td className="px-4 py-3 text-slate-300">{result.correctAnswer}</td>
              <td className="px-4 py-3">
                <span
                  className={`${result.isCorrect ? "text-green-400" : "text-red-400"} font-semibold`}
                >
                  {result.isCorrect ? "✓" : "✗"}
                </span>
              </td>
              <td className={`px-4 py-3 font-medium ${getDifficultyColor(result.difficulty)}`}>
                {result.difficulty === "easy"
                  ? "Fácil"
                  : result.difficulty === "medium"
                    ? "Medio"
                    : "Difícil"}
              </td>
              <td className="px-4 py-3 text-slate-400 text-xs">
                {result.category.replace(/_/g, " ")}
              </td>
              <td className="px-4 py-3">
                <button
                  onClick={() => setExpandedId(expandedId === result.questionId ? null : result.questionId)}
                  className="text-blue-400 hover:text-blue-300 text-xs underline"
                >
                  {expandedId === result.questionId ? "Ocultar" : "Ver"}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Expanded row for justification */}
      {expandedId !== null && (
        <div className="mt-4 p-4 bg-slate-800/50 rounded border border-slate-700">
          {results
            .filter((r) => r.questionId === expandedId)
            .map((result) => {
              const question = allQuestions.find((q) => q.id === result.questionId);
              return (
                <div key={result.questionId}>
                  <h4 className="font-semibold text-slate-200 mb-2">Pregunta:</h4>
                  <p className="text-slate-300 mb-4">{result.questionText}</p>

                  <h4 className="font-semibold text-slate-200 mb-2">Justificación:</h4>
                  <p className="text-slate-400 leading-relaxed mb-3">
                    {question?.justification}
                  </p>

                  <p className="text-slate-500 text-xs">Fuente: {question?.source}</p>
                  {question?.relatedConcepts && question.relatedConcepts.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-slate-700">
                      <p className="text-xs text-slate-400">
                        <strong>Conceptos relacionados:</strong> {question.relatedConcepts.join(", ")}
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
        </div>
      )}
    </div>
  );
}
