"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { Suspense } from "react";
import { useEffect, useState } from "react";
import { QuizResult, Partial } from "@/types/quiz";
import { questionsBank } from "@/data/questions";
import { ResultsTable } from "@/components/ResultsTable";

function ResultsPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [results, setResults] = useState<QuizResult | null>(null);

  // Get feedback, count and partial from query params with fallbacks
  const feedback = searchParams.get("feedback") || "end_only";
  const count = searchParams.get("count") || "25";
  const partial = (searchParams.get("partial") as Partial) || "primer";

  useEffect(() => {
    const data = searchParams.get("data");
    if (data) {
      try {
        const decoded = JSON.parse(atob(data));
        setResults(decoded);
      } catch (e) {
        console.error("Error decoding results:", e);
        router.push("/");
      }
    }
  }, [searchParams, router]);

  if (!results) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-slate-400 mb-4">Cargando resultados...</p>
          <div className="inline-block animate-spin">
            <div className="h-8 w-8 border-4 border-slate-700 border-t-blue-500 rounded-full" />
          </div>
        </div>
      </div>
    );
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}m ${secs}s`;
  };

  const getScoreColor = (percentage: number) => {
    if (percentage >= 80) return "text-green-400";
    if (percentage >= 60) return "text-yellow-400";
    return "text-red-400";
  };

  const getScoreBg = (percentage: number) => {
    if (percentage >= 80) return "from-green-900/20 to-green-800/10";
    if (percentage >= 60) return "from-yellow-900/20 to-yellow-800/10";
    return "from-red-900/20 to-red-800/10";
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <h1 className="text-3xl font-bold text-slate-100 mb-8 text-center">
          📊 Resultados del Quiz - {partial === "primer" ? "Primer Parcial" : "Segundo Parcial"}
        </h1>

        {/* Main Score Card */}
        <div
          className={`bg-gradient-to-br ${getScoreBg(results.percentage)} border border-slate-700 rounded-lg p-8 mb-8`}
        >
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {/* Score */}
            <div className="text-center">
              <p className="text-4xl font-bold text-slate-100 mb-2">
                {results.score}/{results.totalQuestions}
              </p>
              <p className="text-sm text-slate-400">Respuestas Correctas</p>
            </div>

            {/* Percentage */}
            <div className="text-center">
              <p className={`text-4xl font-bold mb-2 ${getScoreColor(results.percentage)}`}>
                {results.percentage.toFixed(1)}%
              </p>
              <p className="text-sm text-slate-400">Porcentaje</p>
            </div>

            {/* Time */}
            <div className="text-center">
              <p className="text-4xl font-bold text-slate-100 mb-2">
                {formatTime(results.timeTotal)}
              </p>
              <p className="text-sm text-slate-400">Tiempo Total</p>
            </div>

            {/* Performance */}
            <div className="text-center">
              <p className="text-2xl font-bold text-slate-100 mb-2">
                {results.percentage >= 80
                  ? "⭐⭐⭐"
                  : results.percentage >= 60
                    ? "⭐⭐"
                    : "⭐"}
              </p>
              <p className="text-sm text-slate-400">
                {results.percentage >= 80
                  ? "Excelente"
                  : results.percentage >= 60
                    ? "Bien"
                    : "Necesita mejora"}
              </p>
            </div>
          </div>
        </div>

        {/* Category Breakdown */}
        <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6 mb-8">
          <h2 className="text-xl font-semibold text-slate-100 mb-6">
            📈 Desempeño por Categoría
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(results.categoryBreakdown).map(([category, data]) => (
              <div key={category} className="bg-slate-900/50 rounded p-4">
                <p className="text-sm font-semibold text-slate-300 mb-2 capitalize">
                  {category.replace(/_/g, " ")}
                </p>
                <div className="flex items-center gap-3">
                  <div className="flex-1">
                    <div className="w-full h-2 bg-slate-700 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all ${
                          data.percentage >= 80
                            ? "bg-green-500"
                            : data.percentage >= 60
                              ? "bg-yellow-500"
                              : "bg-red-500"
                        }`}
                        style={{ width: `${data.percentage}%` }}
                      />
                    </div>
                  </div>
                  <span className="text-sm font-semibold text-slate-300 whitespace-nowrap">
                    {data.correct}/{data.total}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-2">
                  {data.percentage.toFixed(0)}%
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Difficulty Breakdown */}
        <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6 mb-8">
          <h2 className="text-xl font-semibold text-slate-100 mb-6">
            ⚡ Desempeño por Dificultad
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { key: "easy", label: "Fácil", color: "green" },
              { key: "medium", label: "Medio", color: "yellow" },
              { key: "hard", label: "Difícil", color: "red" },
            ].map(({ key, label, color }) => {
              const data = results.difficultyBreakdown[key as keyof typeof results.difficultyBreakdown];
              return (
                <div key={key} className="bg-slate-900/50 rounded p-4">
                  <p className="text-sm font-semibold text-slate-300 mb-2">{label}</p>
                  <p className="text-2xl font-bold mb-3">
                    {data.correct}/{data.total}
                  </p>
                  <div className="w-full h-2 bg-slate-700 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all bg-${color}-500`}
                      style={{ width: `${data.percentage}%` }}
                    />
                  </div>
                  <p className="text-xs text-slate-500 mt-2">
                    {data.percentage.toFixed(0)}%
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Detailed Results Table */}
        <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6 mb-8">
          <h2 className="text-xl font-semibold text-slate-100 mb-6">
            📋 Detalle de Respuestas
          </h2>
          <div className="overflow-x-auto">
            <ResultsTable results={results.answers} allQuestions={questionsBank} />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4 justify-center mb-8">
          <button
            onClick={() => router.push("/")}
            className="px-6 py-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold transition"
          >
            ← Volver al Inicio
          </button>
          <button
            onClick={() => router.push(`/quiz?feedback=${feedback}&count=${count}&partial=${partial}`)}
            className="px-6 py-3 rounded-lg bg-green-600 hover:bg-green-700 text-white font-semibold transition"
          >
            🔄 Reintentar Quiz
          </button>
        </div>

        {/* Feedback */}
        <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-slate-100 mb-4">💡 Recomendaciones</h3>
          <p className="text-slate-300 leading-relaxed">
            {results.percentage >= 80
              ? partial === "primer"
                ? "¡Excelente desempeño! Dominas muy bien los temas del primer parcial. Estás listo para el examen. Continúa repasando los conceptos claves."
                : "¡Excelente desempeño! Dominas muy bien los temas del segundo parcial. Estás bien preparado para el examen final. Sigue reforzando tus conocimientos."
              : results.percentage >= 60
                ? partial === "primer"
                  ? "Buen trabajo en el primer parcial, pero hay áreas que necesitas reforzar. Revisa las preguntas que fallaste, especialmente en categorías con menor porcentaje."
                  : "Buen trabajo en el segundo parcial, pero hay temas que necesitas profundizar. Revisa especialmente Riesgos, Costos de Calidad y Testing."
                : partial === "primer"
                  ? "Necesitas más estudio del primer parcial. Revisa cuidadosamente: Historia de Calidad, Definiciones fundamentales, ISO 9126. Practica más cálculos de Puntos de Función."
                  : "Necesitas reforzar el segundo parcial. Enfócate en: Gestión de Riesgos, Costos asociados a Calidad, Ciclo de Deming, Evaluación Heurística y Estrategias de Testing."}
          </p>
        </div>
      </div>
    </div>
  );
}

export default function ResultsPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
          <div className="text-center">
            <p className="text-slate-400 mb-4">Cargando resultados...</p>
            <div className="inline-block animate-spin">
              <div className="h-8 w-8 border-4 border-slate-700 border-t-blue-500 rounded-full" />
            </div>
          </div>
        </div>
      }
    >
      <ResultsPageContent />
    </Suspense>
  );
}
