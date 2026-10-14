"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { Suspense, type ReactNode } from "react";
import { useEffect, useMemo } from "react";
import {
  LuArrowLeft,
  LuChartBar,
  LuCircleAlert,
  LuCircleCheck,
  LuClock,
  LuLightbulb,
  LuListChecks,
  LuPercent,
  LuRotateCcw,
  LuTrophy,
  LuTrendingUp,
  LuZap,
} from "react-icons/lu";
import type { IconType } from "react-icons/lib";
import type { Partial, QuizResult, SubjectId } from "@/types/quiz";
import {
  getQuestionsBySubject,
  getSubject,
  isValidSubjectId,
} from "@/data/subjects";
import { ResultsTable } from "@/components/ResultsTable";
import { useIsClient } from "@/hooks/useIsClient";

/** Niveles de desempeño, evaluados de mayor a menor umbral. */
const PERFORMANCE_TIERS = [
  {
    min: 80,
    label: "Excelente",
    Icon: LuTrophy,
    textClass: "text-success",
    barClass: "bg-success",
  },
  {
    min: 60,
    label: "Bien",
    Icon: LuTrendingUp,
    textClass: "text-warning",
    barClass: "bg-warning",
  },
  {
    min: 0,
    label: "A mejorar",
    Icon: LuCircleAlert,
    textClass: "text-danger",
    barClass: "bg-danger",
  },
] as const;

function getPerformanceTier(percentage: number) {
  return (
    PERFORMANCE_TIERS.find((tier) => percentage >= tier.min) ??
    PERFORMANCE_TIERS[PERFORMANCE_TIERS.length - 1]
  );
}

/** Color de barra según el porcentaje (semántico). */
function getBarClass(percentage: number) {
  return getPerformanceTier(percentage).barClass;
}

const DIFFICULTY_ROWS = [
  { key: "easy", label: "Fácil", barClass: "bg-success" },
  { key: "medium", label: "Medio", barClass: "bg-warning" },
  { key: "hard", label: "Difícil", barClass: "bg-danger" },
] as const;

function formatTime(seconds: number) {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}m ${secs}s`;
}

function formatCategory(category: string) {
  return category.replace(/_/g, " ");
}

function StatBlock({
  Icon,
  value,
  label,
  valueClass = "text-secondary",
}: {
  Icon: IconType;
  value: ReactNode;
  label: string;
  valueClass?: string;
}) {
  return (
    <div className="text-center">
      <Icon aria-hidden="true" className="mx-auto mb-2 h-5 w-5 text-gray-3" />
      <p className={`text-4xl font-bold mb-1 ${valueClass}`}>{value}</p>
      <p className="text-sm text-gray-3">{label}</p>
    </div>
  );
}

function LoadingScreen({ label }: { label: string }) {
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="text-center">
        <p className="mb-4 text-gray-3">{label}</p>
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-line border-t-secondary" />
      </div>
    </div>
  );
}

function ResultsPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const isClient = useIsClient();

  const feedback = searchParams.get("feedback") || "end_only";
  const count = searchParams.get("count") || "25";
  const partial = (searchParams.get("partial") as Partial) || "primer";
  const subjectParam = searchParams.get("subject");
  const subjectId: SubjectId =
    subjectParam && isValidSubjectId(subjectParam)
      ? subjectParam
      : "calidad-software";
  const subject = getSubject(subjectId);

  // Lectura pura de sessionStorage durante el render (solo cliente). Durante
  // SSR e hidratación `isClient` es `false`, así que no hay acceso al navegador.
  const results = useMemo<QuizResult | null>(() => {
    if (!isClient) return null;

    const data = sessionStorage.getItem("quizResults");
    if (!data) return null;

    try {
      return JSON.parse(data) as QuizResult;
    } catch (e) {
      console.error("Error decoding results:", e);
      return null;
    }
  }, [isClient]);

  // Efectos secundarios sobre el sistema externo (sessionStorage) y navegación:
  // ninguno llama a setState, por lo que no generan renders en cascada.
  useEffect(() => {
    if (isClient) sessionStorage.removeItem("quizResults");
  }, [isClient, results]);

  useEffect(() => {
    if (isClient && !results) router.push("/");
  }, [isClient, results, router]);

  // Categorías con menor desempeño, para recomendaciones accionables.
  const weakestCategories = useMemo(() => {
    if (!results) return [];
    return Object.entries(results.categoryBreakdown)
      .filter(([, data]) => data.percentage < 60)
      .sort((a, b) => a[1].percentage - b[1].percentage)
      .map(([category]) => formatCategory(category));
  }, [results]);

  if (!results) {
    return <LoadingScreen label="Cargando resultados..." />;
  }

  const tier = getPerformanceTier(results.percentage);
  const partialLabel = partial === "primer" ? "1° Parcial" : "2° Parcial";

  const recommendation =
    results.percentage >= 80
      ? `¡Excelente desempeño! Dominás muy bien los temas del ${partialLabel}. Seguí repasando los conceptos clave y practicando cálculos para mantener el nivel.`
      : results.percentage >= 60
        ? weakestCategories.length > 0
          ? `Buen trabajo en el ${partialLabel}. Tenés margen para mejorar en: ${weakestCategories.join(", ")}. Volvé a repasar esas categorías y reintentá el quiz.`
          : `Buen trabajo en el ${partialLabel}. Repasá las preguntas que fallaste para consolidar los temas más débiles.`
        : weakestCategories.length > 0
          ? `Necesitás reforzar el ${partialLabel}. Enfocate primero en: ${weakestCategories.join(", ")}. Repasá la teoría y practicá con más preguntas de esas categorías.`
          : `Necesitás reforzar el ${partialLabel}. Repasá el material de la materia y practicá con más preguntas antes de reintentar.`;

  return (
    <div className="min-h-screen px-4 py-8">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <header className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-secondary">Resultados</h1>
          <p className="mt-2 text-gray-3">
            {subject?.shortName ?? "Quiz"} · {partialLabel}
          </p>
        </header>

        {/* Main Score Card */}
        <div className="mb-8 overflow-hidden rounded-2xl border border-line bg-surface">
          <div className={`h-1.5 w-full ${tier.barClass}`} />
          <div className="grid grid-cols-2 gap-6 p-8 md:grid-cols-4">
            <StatBlock
              Icon={LuCircleCheck}
              value={`${results.score}/${results.totalQuestions}`}
              label="Respuestas Correctas"
            />
            <StatBlock
              Icon={LuPercent}
              value={`${results.percentage.toFixed(1)}%`}
              label="Porcentaje"
              valueClass={tier.textClass}
            />
            <StatBlock
              Icon={LuClock}
              value={formatTime(results.timeTotal)}
              label="Tiempo Total"
            />
            <div className="text-center">
              <tier.Icon
                aria-hidden="true"
                className={`mx-auto mb-2 h-6 w-6 ${tier.textClass}`}
              />
              <p className={`text-2xl font-bold mb-1 ${tier.textClass}`}>
                {tier.label}
              </p>
              <p className="text-sm text-gray-3">Rendimiento</p>
            </div>
          </div>
        </div>

        {/* Category Breakdown */}
        <section className="mb-8 rounded-2xl border border-line bg-surface p-6">
          <h2 className="mb-6 flex items-center gap-2 text-xl font-semibold text-secondary">
            <LuChartBar aria-hidden="true" className="h-5 w-5 text-gray-3" />
            Desempeño por Categoría
          </h2>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {Object.entries(results.categoryBreakdown).map(([category, data]) => (
              <div key={category} className="rounded-lg bg-surface-2 p-4">
                <p className="mb-2 text-sm font-semibold capitalize text-gray-1">
                  {formatCategory(category)}
                </p>
                <div className="flex items-center gap-3">
                  <div className="h-2 flex-1 overflow-hidden rounded-full bg-surface-3">
                    <div
                      className={`h-full transition-all ${getBarClass(data.percentage)}`}
                      style={{ width: `${data.percentage}%` }}
                    />
                  </div>
                  <span className="whitespace-nowrap text-sm font-semibold text-gray-1">
                    {data.correct}/{data.total}
                  </span>
                </div>
                <p className="mt-2 text-xs text-gray-3">
                  {data.percentage.toFixed(0)}%
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Difficulty Breakdown */}
        <section className="mb-8 rounded-2xl border border-line bg-surface p-6">
          <h2 className="mb-6 flex items-center gap-2 text-xl font-semibold text-secondary">
            <LuZap aria-hidden="true" className="h-5 w-5 text-gray-3" />
            Desempeño por Dificultad
          </h2>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {DIFFICULTY_ROWS.map(({ key, label, barClass }) => {
              const data = results.difficultyBreakdown[key];
              return (
                <div key={key} className="rounded-lg bg-surface-2 p-4">
                  <p className="mb-2 text-sm font-semibold text-gray-1">
                    {label}
                  </p>
                  <p className="mb-3 text-2xl font-bold text-secondary">
                    {data.correct}/{data.total}
                  </p>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-surface-3">
                    <div
                      className={`h-full transition-all ${barClass}`}
                      style={{ width: `${data.percentage}%` }}
                    />
                  </div>
                  <p className="mt-2 text-xs text-gray-3">
                    {data.percentage.toFixed(0)}%
                  </p>
                </div>
              );
            })}
          </div>
        </section>

        {/* Detailed Results Table */}
        <section className="mb-8 rounded-2xl border border-line bg-surface p-6">
          <h2 className="mb-6 flex items-center gap-2 text-xl font-semibold text-secondary">
            <LuListChecks aria-hidden="true" className="h-5 w-5 text-gray-3" />
            Detalle de Respuestas
          </h2>
          <ResultsTable
            results={results.answers}
            allQuestions={getQuestionsBySubject(subjectId)}
          />
        </section>

        {/* Action Buttons */}
        <div className="mb-4 flex flex-col justify-center gap-4 sm:flex-row">
          <button
            type="button"
            onClick={() =>
              router.push(
                `/quiz?subject=${subjectId}&feedback=${feedback}&count=${count}&partial=${partial}`
              )
            }
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-secondary px-6 py-3 font-semibold text-primary transition hover:bg-gray-1"
          >
            <LuRotateCcw aria-hidden="true" className="h-5 w-5" />
            Reintentar Quiz
          </button>
          <button
            type="button"
            onClick={() => router.push(`/materia/${subjectId}`)}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-line bg-surface px-6 py-3 font-semibold text-secondary transition hover:border-secondary hover:bg-surface-2"
          >
            <LuArrowLeft aria-hidden="true" className="h-5 w-5" />
            Volver a la materia
          </button>
        </div>

        <div className="mb-8 text-center">
          <button
            type="button"
            onClick={() => router.push("/")}
            className="text-sm text-gray-3 underline transition hover:text-secondary"
          >
            Volver al inicio
          </button>
        </div>

        {/* Feedback */}
        <section className="rounded-2xl border border-line bg-surface p-6">
          <h3 className="mb-3 flex items-center gap-2 text-lg font-semibold text-secondary">
            <LuLightbulb aria-hidden="true" className="h-5 w-5 text-gray-3" />
            Recomendaciones
          </h3>
          <p className="leading-relaxed text-gray-3">{recommendation}</p>
        </section>
      </div>
    </div>
  );
}

export default function ResultsPage() {
  return (
    <Suspense fallback={<LoadingScreen label="Cargando resultados..." />}>
      <ResultsPageContent />
    </Suspense>
  );
}
