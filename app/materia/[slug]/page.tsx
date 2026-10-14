"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  LuArrowLeft,
  LuArrowRight,
  LuCheck,
  LuFileText,
  LuHash,
  LuHourglass,
  LuInfinity,
  LuListChecks,
  LuZap,
} from "react-icons/lu";
import type { FeedbackMode, Partial } from "@/types/quiz";
import {
  getQuestionsBySubject,
  getSubject,
  isValidSubjectId,
} from "@/data/subjects";

const QUESTION_COUNTS = [15, 25, 50, 0] as const;

function optionClasses(selected: boolean) {
  return [
    "flex cursor-pointer items-center justify-center gap-2 rounded-xl border-2 px-4 py-3 font-semibold transition",
    selected
      ? "border-secondary bg-primary text-secondary"
      : "border-line bg-surface text-gray-3 hover:border-gray-2 hover:bg-surface-2 hover:text-secondary",
  ].join(" ");
}

export default function SubjectSetupPage() {
  const params = useParams();
  const router = useRouter();
  const slug = Array.isArray(params.slug) ? params.slug[0] : params.slug;

  const [partial, setPartial] = useState<Partial>("primer");
  const [feedbackMode, setFeedbackMode] = useState<FeedbackMode>("end_only");
  const [questionCount, setQuestionCount] = useState<number>(25);
  const [loading, setLoading] = useState(false);

  const subjectId =
    typeof slug === "string" && isValidSubjectId(slug) ? slug : null;
  const subject = subjectId ? getSubject(subjectId) : undefined;
  const questions = useMemo(
    () => (subjectId ? getQuestionsBySubject(subjectId) : []),
    [subjectId]
  );

  const partialQuestions = useMemo(
    () => questions.filter((q) => q.partial === partial),
    [questions, partial]
  );
  const totalAvailable = partialQuestions.length;
  const categoryCount = useMemo(
    () => new Set(partialQuestions.map((q) => q.category)).size,
    [partialQuestions]
  );
  const countByPartial = useMemo(
    () => ({
      primer: questions.filter((q) => q.partial === "primer").length,
      segundo: questions.filter((q) => q.partial === "segundo").length,
    }),
    [questions]
  );

  if (!subject || !subjectId) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center gap-4 px-4 text-center">
        <h1 className="text-2xl font-bold text-secondary">
          Materia no encontrada
        </h1>
        <p className="text-gray-3">
          La materia que buscás no está disponible.
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 rounded-lg border border-line bg-surface px-5 py-2.5 font-semibold text-secondary transition hover:border-secondary hover:bg-surface-2"
        >
          <LuArrowLeft aria-hidden="true" className="h-4 w-4" />
          Volver al inicio
        </Link>
      </main>
    );
  }

  const formatCountButton = (count: number) =>
    count === 0 ? `Todas (${totalAvailable})` : String(count);

  const displayQuestionCount =
    questionCount === 0 ? totalAvailable : questionCount;

  const handleStartQuiz = () => {
    setLoading(true);
    const countParam = questionCount === 0 ? "todas" : String(questionCount);
    router.push(
      `/quiz?subject=${subjectId}&feedback=${feedbackMode}&count=${countParam}&partial=${partial}`
    );
  };

  return (
    <main className="flex min-h-screen flex-col items-center px-4 py-10">
      <div className="w-full max-w-2xl">
        <Link
          href="/"
          className="mb-6 inline-flex items-center gap-2 text-sm text-gray-3 transition hover:text-secondary"
        >
          <LuArrowLeft aria-hidden="true" className="h-4 w-4" />
          Cambiar materia
        </Link>

        <header className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-secondary md:text-4xl">
            {subject.name}
          </h1>
          <p className="mt-2 text-gray-3">
            Preparación para el {partial === "primer" ? "1°" : "2°"} Parcial
            {" - "}
            {subject.institution}
          </p>
        </header>

        <div className="rounded-xl border border-line bg-surface p-6 md:p-8">
          {/* Selección de parcial */}
          <section className="mb-8 border-b border-line pb-8">
            <h2 className="mb-4 text-lg font-semibold text-secondary">
              Seleccioná el parcial
            </h2>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {(
                [
                  { value: "primer", label: "1° Parcial", Icon: LuFileText },
                  { value: "segundo", label: "2° Parcial", Icon: LuListChecks },
                ] as const
              ).map(({ value, label, Icon }) => {
                const selected = partial === value;
                return (
                  <button
                    key={value}
                    type="button"
                    aria-pressed={selected}
                    onClick={() => setPartial(value)}
                    className={`relative flex flex-col items-center gap-1 rounded-xl border-2 px-4 py-5 font-semibold transition ${
                      selected
                        ? "border-secondary bg-primary text-secondary"
                        : "border-line bg-surface text-gray-3 hover:border-gray-2 hover:bg-surface-2 hover:text-secondary"
                    }`}
                  >
                    {selected && (
                      <LuCheck
                        aria-hidden="true"
                        className="absolute right-3 top-3 h-4 w-4 text-secondary"
                      />
                    )}
                    <Icon aria-hidden="true" className="h-6 w-6" />
                    <span className="text-base">{label}</span>
                    <span className="text-xs font-normal text-gray-3">
                      {countByPartial[value]} preguntas
                    </span>
                  </button>
                );
              })}
            </div>
          </section>

          {/* Resumen */}
          <section className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="rounded-xl border border-line bg-surface-2 p-4 text-center">
              <div className="text-3xl font-bold text-secondary">
                {displayQuestionCount}
                <span className="text-sm font-normal text-gray-3">
                  {" / "}
                  {totalAvailable}
                </span>
              </div>
              <div className="mt-1 text-sm text-gray-3">Preguntas</div>
            </div>
            <div className="rounded-xl border border-line bg-surface-2 p-4 text-center">
              <div className="text-3xl font-bold text-secondary">
                ~{Math.ceil((displayQuestionCount / 100) * 45)}
              </div>
              <div className="mt-1 text-sm text-gray-3">Minutos</div>
            </div>
            <div className="rounded-xl border border-line bg-surface-2 p-4 text-center">
              <div className="text-3xl font-bold text-secondary">
                {categoryCount}
              </div>
              <div className="mt-1 text-sm text-gray-3">Categorías</div>
            </div>
          </section>

          {/* Contenido */}
          <section className="mb-8 border-b border-line pb-8">
            <h2 className="mb-4 text-lg font-semibold text-secondary">
              Contenido
            </h2>
            <ul className="grid grid-cols-1 gap-3 text-sm text-gray-3 md:grid-cols-2">
              {subject.topics[partial].map((topic) => (
                <li key={topic} className="flex items-start gap-2">
                  <LuCheck
                    aria-hidden="true"
                    className="mt-0.5 h-4 w-4 shrink-0 text-gray-2"
                  />
                  <span>{topic}</span>
                </li>
              ))}
            </ul>
          </section>

          {/* Cantidad de preguntas */}
          <section className="mb-8 border-b border-line pb-8">
            <h2 className="mb-4 text-lg font-semibold text-secondary">
              Cantidad de preguntas
            </h2>
            <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
              {QUESTION_COUNTS.map((count) => (
                <button
                  key={count}
                  type="button"
                  aria-pressed={questionCount === count}
                  onClick={() => setQuestionCount(count)}
                  className={optionClasses(questionCount === count)}
                >
                  {count === 0 ? (
                    <LuInfinity aria-hidden="true" className="h-4 w-4" />
                  ) : (
                    <LuHash aria-hidden="true" className="h-4 w-4" />
                  )}
                  <span>{formatCountButton(count)}</span>
                </button>
              ))}
            </div>
          </section>

          {/* Modo de retroalimentación */}
          <section className="mb-8">
            <h2 className="mb-4 text-lg font-semibold text-secondary">
              Modo de retroalimentación
            </h2>
            <div className="flex flex-col gap-3">
              {(
                [
                  {
                    value: "immediate",
                    Icon: LuZap,
                    title: "Retroalimentación inmediata",
                    description:
                      "Ver la respuesta correcta después de cada pregunta",
                  },
                  {
                    value: "end_only",
                    Icon: LuHourglass,
                    title: "Retroalimentación al final",
                    description: "Ver todas las respuestas al completar el quiz",
                  },
                ] as const
              ).map(({ value, Icon, title, description }) => {
                const selected = feedbackMode === value;
                return (
                  <label
                    key={value}
                    className={`flex cursor-pointer items-start gap-3 rounded-xl border-2 p-4 transition ${
                      selected
                        ? "border-secondary bg-primary"
                        : "border-line bg-surface hover:border-gray-2 hover:bg-surface-2"
                    }`}
                  >
                    <input
                      type="radio"
                      name="feedback"
                      value={value}
                      checked={selected}
                      onChange={() => setFeedbackMode(value)}
                      className="mt-0.5 h-4 w-4 shrink-0 cursor-pointer accent-secondary"
                    />
                    <Icon
                      aria-hidden="true"
                      className="mt-0.5 h-5 w-5 shrink-0 text-gray-3"
                    />
                    <span className="min-w-0">
                      <span
                        className={`block font-semibold ${
                          selected ? "text-secondary" : "text-gray-1"
                        }`}
                      >
                        {title}
                      </span>
                      <span className="mt-0.5 block text-sm text-gray-3">
                        {description}
                      </span>
                    </span>
                  </label>
                );
              })}
            </div>
          </section>

          {/* Botón comenzar */}
          <button
            type="button"
            onClick={handleStartQuiz}
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-secondary px-6 py-3 text-lg font-semibold text-primary transition hover:bg-gray-1 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? "Iniciando..." : "Comenzar Quiz"}
            {!loading && (
              <LuArrowRight aria-hidden="true" className="h-5 w-5" />
            )}
          </button>
        </div>

        <p className="mt-6 text-center text-xs text-gray-3">
          80% teoría + 20% cálculos • Preguntas aleatorias • Retroalimentación
          completa
        </p>
      </div>
    </main>
  );
}
