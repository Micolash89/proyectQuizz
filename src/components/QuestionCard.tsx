"use client";

import { Question } from "@/types/quiz";
import { useState } from "react";

interface QuestionCardProps {
  question: Question;
  currentNumber: number;
  totalQuestions: number;
  onSelect: (answer: string) => void;
  hasAnswered: boolean;
  selectedAnswer?: string;
  showFeedback: boolean;
  feedbackAnswer?: {
    isCorrect: boolean;
    justification: string;
  };
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
  const [expanded, setExpanded] = useState(false);

  const getDifficultyColor = () => {
    switch (question.difficulty) {
      case "easy":
        return "bg-green-900/30 text-green-400 border-green-700";
      case "medium":
        return "bg-yellow-900/30 text-yellow-400 border-yellow-700";
      case "hard":
        return "bg-red-900/30 text-red-400 border-red-700";
      default:
        return "bg-slate-700 text-slate-300";
    }
  };

  const getCategoryColor = () => {
    const colors: { [key: string]: string } = {
      historia: "bg-blue-900/30 text-blue-300",
      definiciones: "bg-purple-900/30 text-purple-300",
      pdca: "bg-cyan-900/30 text-cyan-300",
      principios: "bg-indigo-900/30 text-indigo-300",
      herramientas: "bg-green-900/30 text-green-300",
      iso9126: "bg-pink-900/30 text-pink-300",
      metricas: "bg-orange-900/30 text-orange-300",
      pf_teoria: "bg-yellow-900/30 text-yellow-300",
      pf_calculo: "bg-red-900/30 text-red-300",
      equipo: "bg-teal-900/30 text-teal-300",
      costos: "bg-rose-900/30 text-rose-300",
      clientes: "bg-fuchsia-900/30 text-fuchsia-300",
      decisiones: "bg-amber-900/30 text-amber-300",
      casos_practicos: "bg-violet-900/30 text-violet-300",
      vf_justificado: "bg-lime-900/30 text-lime-300",
      analisis: "bg-sky-900/30 text-sky-300",
    };
    return colors[question.category] || "bg-slate-700 text-slate-300";
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-4">
      {/* Header */}
      <div className="mb-6 pb-4 border-b border-slate-700">
        <div className="flex justify-between items-start mb-3">
          <div>
            <h2 className="text-sm font-semibold text-slate-400">
              Pregunta {currentNumber} de {totalQuestions}
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              {((currentNumber / totalQuestions) * 100).toFixed(0)}% completado
            </p>
          </div>
          <div className="flex gap-2">
            <span
              className={`px-3 py-1 rounded text-xs font-medium border ${getDifficultyColor()}`}
            >
              {question.difficulty === "easy"
                ? "Fácil"
                : question.difficulty === "medium"
                  ? "Medio"
                  : "Difícil"}
            </span>
            <span className={`px-3 py-1 rounded text-xs font-medium border ${getCategoryColor()}`}>
              {question.category.replace(/_/g, " ")}
            </span>
          </div>
        </div>
      </div>

      {/* Question */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold text-slate-100 leading-relaxed mb-6">
          {question.text}
        </h3>

        {question.type === "true_false" && (
          <div className="space-y-2">
            {question.options.map((option) => (
              <button
                key={option.letter}
                onClick={() => !hasAnswered && onSelect(option.letter)}
                disabled={hasAnswered}
                className={`w-full text-left p-4 rounded border-2 transition ${
                  selectedAnswer === option.letter
                    ? "border-blue-500 bg-blue-900/20 text-slate-100"
                    : "border-slate-600 bg-slate-800/50 text-slate-300 hover:border-slate-500"
                } ${hasAnswered ? "opacity-60 cursor-not-allowed" : "hover:bg-slate-700/50 cursor-pointer"}`}
              >
                <span className="font-semibold">{option.letter})</span> {option.text}
              </button>
            ))}
          </div>
        )}

        {question.type === "multiple_choice" && (
          <div className="space-y-2">
            {question.options.map((option) => (
              <button
                key={option.letter}
                onClick={() => !hasAnswered && onSelect(option.letter)}
                disabled={hasAnswered}
                className={`w-full text-left p-4 rounded border-2 transition ${
                  selectedAnswer === option.letter
                    ? "border-blue-500 bg-blue-900/20 text-slate-100"
                    : "border-slate-600 bg-slate-800/50 text-slate-300 hover:border-slate-500"
                } ${hasAnswered ? "opacity-60 cursor-not-allowed" : "hover:bg-slate-700/50 cursor-pointer"}`}
              >
                <span className="font-semibold">{option.letter})</span> {option.text}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Feedback */}
      {showFeedback && feedbackAnswer && (
        <div
          className={`mb-8 p-4 rounded border-l-4 ${
            feedbackAnswer.isCorrect
              ? "bg-green-900/20 border-green-500"
              : "bg-red-900/20 border-red-500"
          }`}
        >
          <div className="flex items-start gap-3 mb-3">
            <span className={`text-xl font-bold ${feedbackAnswer.isCorrect ? "text-green-400" : "text-red-400"}`}>
              {feedbackAnswer.isCorrect ? "✓ CORRECTO" : "✗ INCORRECTO"}
            </span>
          </div>

          <div className="space-y-2">
            <button
              onClick={() => setExpanded(!expanded)}
              className="text-slate-300 hover:text-slate-100 text-sm font-semibold underline"
            >
              {expanded ? "▼" : "▶"} Justificación
            </button>

            {expanded && (
              <div className="mt-3 p-3 bg-slate-800/50 rounded text-slate-300 text-sm leading-relaxed">
                <p>{feedbackAnswer.justification}</p>
                <p className="text-slate-500 text-xs mt-3">
                  Fuente: {question.source}
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
