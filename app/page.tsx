"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { FeedbackMode } from "@/types/quiz";
import { questionsBank } from "@/data/questions";

export default function Home() {
  const router = useRouter();
  const [partial, setPartial] = useState<"primer" | "segundo">("primer");
  const [feedbackMode, setFeedbackMode] = useState<FeedbackMode>("immediate");
  const [questionCount, setQuestionCount] = useState<number>(25);
  const [loading, setLoading] = useState(false);

  const totalAvailable = useMemo(() => {
    return questionsBank.filter((q) => q.partial === partial).length;
  }, [partial]);

  const categoryCount = useMemo(() => {
    const cats = new Set(
      questionsBank.filter((q) => q.partial === partial).map((q) => q.category)
    );
    return cats.size;
  }, [partial]);

  const handleStartQuiz = () => {
    setLoading(true);
    const countParam = questionCount === 0 ? "todas" : String(questionCount);
    router.push(`/quiz?feedback=${feedbackMode}&count=${countParam}&partial=${partial}`);
  };

  const formatCountButton = (count: number) => {
    if (count === 0) return `Todas (${totalAvailable})`;
    return String(count);
  };

  const displayQuestionCount = questionCount === 0 ? totalAvailable : questionCount;

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center px-4">
      <div className="max-w-2xl w-full">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-slate-100 mb-2">
            Quiz Calidad de Software
          </h1>
          <p className="text-slate-400">
            {partial === "primer" 
              ? "Preparación para el Primer Parcial - UNLaM"
              : "Preparación para el Segundo Parcial - UNLaM"}
          </p>
        </div>

        {/* Main Card */}
        <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-8 mb-8">
          {/* Partial Selection */}
          <div className="mb-8 pb-8 border-b border-slate-700">
            <h2 className="text-xl font-semibold text-slate-100 mb-4">Selecciona Parcial</h2>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setPartial("primer")}
                className={`py-3 px-4 rounded-lg font-semibold transition-all ${
                  partial === "primer"
                    ? "bg-blue-600 text-white border-2 border-blue-400"
                    : "bg-slate-700/50 text-slate-300 hover:bg-slate-700 border-2 border-slate-700"
                }`}
              >
                Primer Parcial ({questionsBank.filter((q) => q.partial === "primer").length} preguntas)
              </button>
              <button
                onClick={() => setPartial("segundo")}
                className={`py-3 px-4 rounded-lg font-semibold transition-all ${
                  partial === "segundo"
                    ? "bg-purple-600 text-white border-2 border-purple-400"
                    : "bg-slate-700/50 text-slate-300 hover:bg-slate-700 border-2 border-slate-700"
                }`}
              >
                Segundo Parcial ({questionsBank.filter((q) => q.partial === "segundo").length} preguntas)
              </button>
            </div>
          </div>
          {/* Quiz Info */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="bg-slate-700/50 rounded-lg p-4 text-center">
              <div className="text-3xl font-bold text-blue-400 mb-1">
                {displayQuestionCount}
                <span className="text-sm font-normal text-slate-400"> / {totalAvailable}</span>
              </div>
              <div className="text-slate-300 text-sm">Preguntas</div>
            </div>
            <div className="bg-slate-700/50 rounded-lg p-4 text-center">
              <div className="text-3xl font-bold text-green-400 mb-1">~{Math.ceil((displayQuestionCount / 100) * 45)}</div>
              <div className="text-slate-300 text-sm">Minutos</div>
            </div>
            <div className="bg-slate-700/50 rounded-lg p-4 text-center">
              <div className="text-3xl font-bold text-purple-400 mb-1">{categoryCount}</div>
              <div className="text-slate-300 text-sm">Categorías</div>
            </div>
          </div>

          {/* Content Overview */}
          <div className="mb-8 pb-8 border-b border-slate-700">
            <h2 className="text-xl font-semibold text-slate-100 mb-4">Contenido</h2>
            {partial === "primer" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-slate-300">
                <div className="flex items-start gap-2">
                  <span className="text-blue-400 font-bold">•</span>
                  <span>Historia y evolución de la calidad</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-blue-400 font-bold">•</span>
                  <span>Definiciones y conceptos fundamentales</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-blue-400 font-bold">•</span>
                  <span>Ciclo PDCA (Deming)</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-blue-400 font-bold">•</span>
                  <span>Principios y herramientas de calidad</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-blue-400 font-bold">•</span>
                  <span>ISO 9126 y métricas de software</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-blue-400 font-bold">•</span>
                  <span>Puntos de función y análisis de casos</span>
                </div>
              </div>
            )}
            {partial === "segundo" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-slate-300">
                <div className="flex items-start gap-2">
                  <span className="text-purple-400 font-bold">•</span>
                  <span>Riesgos en proyectos de software</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-purple-400 font-bold">•</span>
                  <span>Costos asociados a la calidad</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-purple-400 font-bold">•</span>
                  <span>Ciclo de Deming y mejora continua</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-purple-400 font-bold">•</span>
                  <span>Accesibilidad en software</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-purple-400 font-bold">•</span>
                  <span>Evaluación heurística</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-purple-400 font-bold">•</span>
                  <span>Testing y aseguramiento de calidad</span>
                </div>
              </div>
            )}
          </div>

           {/* Question Count Selection */}
           <div className="mb-8">
             <h2 className="text-xl font-semibold text-slate-100 mb-4">Cantidad de Preguntas</h2>
             <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
               {[15, 25, 50, 0].map((count) => (
                <button
                  key={count}
                  onClick={() => setQuestionCount(count)}
                  className={`py-3 px-4 rounded-lg font-semibold transition-all ${
                    questionCount === count
                      ? "bg-blue-600 text-white border-2 border-blue-400"
                      : "bg-slate-700/50 text-slate-300 hover:bg-slate-700 border-2 border-slate-700"
                  }`}
                >
                  {formatCountButton(count)}
                </button>
              ))}
            </div>
          </div>

          {/* Feedback Mode Selection */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-slate-100 mb-4">Modo de Retroalimentación</h2>
            <div className="space-y-3">
              <label className="flex items-center gap-3 p-4 bg-slate-700/50 rounded-lg cursor-pointer hover:bg-slate-700 transition border-2 border-slate-700"
                style={{ borderColor: feedbackMode === "immediate" ? "#3b82f6" : undefined }}>
                <input
                  type="radio"
                  name="feedback"
                  value="immediate"
                  checked={feedbackMode === "immediate"}
                  onChange={(e) => setFeedbackMode(e.target.value as FeedbackMode)}
                  className="w-4 h-4 cursor-pointer"
                />
                <div>
                  <div className="font-semibold text-slate-100">Retroalimentación Inmediata</div>
                  <div className="text-sm text-slate-400">Ver la respuesta correcta después de cada pregunta</div>
                </div>
              </label>

              <label className="flex items-center gap-3 p-4 bg-slate-700/50 rounded-lg cursor-pointer hover:bg-slate-700 transition border-2 border-slate-700"
                style={{ borderColor: feedbackMode === "end_only" ? "#3b82f6" : undefined }}>
                <input
                  type="radio"
                  name="feedback"
                  value="end_only"
                  checked={feedbackMode === "end_only"}
                  onChange={(e) => setFeedbackMode(e.target.value as FeedbackMode)}
                  className="w-4 h-4 cursor-pointer"
                />
                <div>
                  <div className="font-semibold text-slate-100">Retroalimentación al Final (Recomendado)</div>
                  <div className="text-sm text-slate-400">Ver todas las respuestas al completar el quiz</div>
                </div>
              </label>
            </div>
          </div>

          {/* Start Button */}
          <button
            onClick={handleStartQuiz}
            disabled={loading}
            className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:from-slate-600 disabled:to-slate-700 text-white font-semibold py-3 px-6 rounded-lg transition-all transform hover:scale-105 active:scale-95 text-lg"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="inline-block animate-spin">⏳</span>
                Iniciando...
              </span>
            ) : (
              "Comenzar Quiz"
            )}
          </button>
        </div>

        {/* Footer Info */}
        <div className="text-center text-sm text-slate-500">
          <p className="mb-2">
            ✓ 80% teoría + 20% cálculos
            {" • "}
            ✓ Preguntas aleatorias
            {" • "}
            ✓ Retroalimentación completa
          </p>
          <p>
            {partial === "primer"
              ? "Basado en los apuntes de la cátedra - Primer Parcial Calidad de Software"
              : "Basado en los apuntes de la cátedra - Segundo Parcial Calidad de Software"}
          </p>
        </div>
      </div>
    </div>
  );
}
