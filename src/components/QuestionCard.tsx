"use client";

import { Question } from "@/types/quiz";
import { useState, useEffect } from "react";

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
  
  // Determine if this is a multi-answer question
  const isMultiAnswer = Array.isArray(question.correctAnswer);
  
  // Local state for multi-select checkboxes
  const [selectedCheckboxes, setSelectedCheckboxes] = useState<Set<string>>(
    isMultiAnswer && Array.isArray(selectedAnswer)
      ? new Set(selectedAnswer)
      : new Set()
  );

  // Reset checkboxes when question changes
  useEffect(() => {
    setSelectedCheckboxes(new Set());
  }, [question.id]);

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
      riesgos: "bg-red-900/30 text-red-300",
      costos_calidad: "bg-amber-900/30 text-amber-300",
      deming: "bg-cyan-900/30 text-cyan-300",
      accesibilidad: "bg-green-900/30 text-green-300",
      heuristica: "bg-purple-900/30 text-purple-300",
      testing: "bg-blue-900/30 text-blue-300",
    };
    return colors[question.category] || "bg-slate-700 text-slate-300";
  };

  const handleCheckboxChange = (letter: string) => {
    if (hasAnswered) return;
    
    const newSelected = new Set(selectedCheckboxes);
    if (newSelected.has(letter)) {
      newSelected.delete(letter);
    } else {
      newSelected.add(letter);
    }
    setSelectedCheckboxes(newSelected);
  };

  const handleSubmitMultiAnswer = () => {
    if (selectedCheckboxes.size > 0 && !hasAnswered) {
      onSelect(Array.from(selectedCheckboxes));
    }
  };

  const isCorrectOption = (letter: string): boolean => {
    if (Array.isArray(question.correctAnswer)) {
      return question.correctAnswer.includes(letter);
    }
    return question.correctAnswer === letter;
  };

  const isUserWrongSelection = (letter: string): boolean => {
    if (!showFeedback || feedbackAnswer?.isCorrect) return false;
    if (Array.isArray(selectedAnswer)) {
      return selectedAnswer.includes(letter) && !isCorrectOption(letter);
    }
    return selectedAnswer === letter && !isCorrectOption(letter);
  };

  const getOptionStyle = (letter: string) => {
    if (!showFeedback) {
      const isSelected = Array.isArray(selectedAnswer)
        ? selectedAnswer.includes(letter)
        : selectedAnswer === letter;
      return isSelected
        ? "border-blue-500 bg-blue-900/20 text-slate-100"
        : "border-slate-600 bg-slate-800/50 text-slate-300 hover:border-slate-500";
    }
    if (isCorrectOption(letter)) {
      return "border-green-500 bg-green-900/30 text-green-300";
    }
    if (isUserWrongSelection(letter)) {
      return "border-red-500 bg-red-900/30 text-red-300";
    }
    return "border-slate-600 bg-slate-800/50 text-slate-300 opacity-60";
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
            {isMultiAnswer && (
              <span className="px-3 py-1 rounded text-xs font-medium border bg-purple-900/30 text-purple-300 border-purple-700">
                Múltiples respuestas
              </span>
            )}
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
                className={`w-full text-left p-4 rounded border-2 transition ${getOptionStyle(option.letter)} ${hasAnswered ? "cursor-not-allowed" : "hover:bg-slate-700/50 cursor-pointer"}`}
              >
                {showFeedback && isCorrectOption(option.letter) && (
                  <span className="mr-2 text-green-400 font-bold">✓</span>
                )}
                {showFeedback && isUserWrongSelection(option.letter) && (
                  <span className="mr-2 text-red-400 font-bold">✗</span>
                )}
                <span className="font-semibold">{option.letter})</span> {option.text}
              </button>
            ))}
          </div>
        )}

        {question.type === "multiple_choice" && !isMultiAnswer && (
          <div className="space-y-2">
            {question.options.map((option) => (
              <button
                key={option.letter}
                onClick={() => !hasAnswered && onSelect(option.letter)}
                disabled={hasAnswered}
                className={`w-full text-left p-4 rounded border-2 transition ${getOptionStyle(option.letter)} ${hasAnswered ? "cursor-not-allowed" : "hover:bg-slate-700/50 cursor-pointer"}`}
              >
                {showFeedback && isCorrectOption(option.letter) && (
                  <span className="mr-2 text-green-400 font-bold">✓</span>
                )}
                {showFeedback && isUserWrongSelection(option.letter) && (
                  <span className="mr-2 text-red-400 font-bold">✗</span>
                )}
                <span className="font-semibold">{option.letter})</span> {option.text}
              </button>
            ))}
          </div>
        )}

        {question.type === "multiple_choice" && isMultiAnswer && (
          <div>
            <div className="space-y-2 mb-4">
              {question.options.map((option) => (
                <label
                  key={option.letter}
                  className={`flex items-start p-4 rounded border-2 cursor-pointer transition ${getOptionStyle(option.letter)} ${hasAnswered ? "cursor-not-allowed" : "hover:bg-slate-700/50"}`}
                >
                  {showFeedback && isCorrectOption(option.letter) && (
                    <span className="mr-2 mt-0.5 text-green-400 font-bold">✓</span>
                  )}
                  {showFeedback && isUserWrongSelection(option.letter) && (
                    <span className="mr-2 mt-0.5 text-red-400 font-bold">✗</span>
                  )}
                  {!showFeedback && (
                    <input
                      type="checkbox"
                      checked={selectedCheckboxes.has(option.letter)}
                      onChange={() => handleCheckboxChange(option.letter)}
                      disabled={hasAnswered}
                      className="mt-1 mr-3 cursor-pointer"
                    />
                  )}
                  <span>
                    <span className="font-semibold">{option.letter})</span> {option.text}
                  </span>
                </label>
              ))}
            </div>
            {!hasAnswered && selectedCheckboxes.size > 0 && (
              <button
                onClick={handleSubmitMultiAnswer}
                className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded transition"
              >
                Confirmar respuestas ({selectedCheckboxes.size})
              </button>
            )}
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
