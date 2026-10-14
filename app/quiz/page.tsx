"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { Suspense } from "react";
import { useEffect, useMemo, useState } from "react";
import { LuX } from "react-icons/lu";
import type { FeedbackMode, Partial } from "@/types/quiz";
import {
  getQuestionsBySubject,
  getSubject,
  isValidSubjectId,
} from "@/data/subjects";
import { useQuiz } from "@/hooks/useQuiz";
import { useIsClient } from "@/hooks/useIsClient";
import { QuestionCard } from "@/components/QuestionCard";
import { ProgressBar } from "@/components/ProgressBar";
import { Navigation } from "@/components/Navigation";
import { shuffle } from "@/utils/shuffle";

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

function QuizPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const feedbackMode =
    (searchParams.get("feedback") as FeedbackMode) || "end_only";
  const partialParam = (searchParams.get("partial") as Partial) || "primer";

  // Get and validate question count - "todas" means all questions
  const countParam = searchParams.get("count");
  const isTodas = countParam === "todas" || countParam === "0";
  const parsedCount = countParam ? parseInt(countParam, 10) : 25;
  const questionCount = isTodas
    ? 0
    : [15, 25, 50].includes(parsedCount)
      ? parsedCount
      : 25;

  const subjectParam = searchParams.get("subject");
  const subjectId =
    subjectParam && isValidSubjectId(subjectParam)
      ? subjectParam
      : "calidad-software";
  const subject = getSubject(subjectId);

  const [elapsedTime, setElapsedTime] = useState(0);
  const isClient = useIsClient();

  // El banco se mezcla y recorta una sola vez en el cliente. Se calcula durante
  // el render (no en un efecto) para evitar renders en cascada; durante SSR e
  // hidratación `isClient` es `false` y se muestra la pantalla de carga.
  const questions = useMemo(() => {
    if (!isClient) return [];

    const bank = getQuestionsBySubject(subjectId);
    const filtered = bank.filter((q) => q.partial === partialParam);
    const shuffled = shuffle(filtered);
    // questionCount === 0 means "todas" (all questions)
    return questionCount === 0 ? shuffled : shuffled.slice(0, questionCount);
  }, [isClient, questionCount, partialParam, subjectId]);

  const {
    quizState,
    currentQuestion,
    isLastQuestion,
    selectAnswer,
    nextQuestion,
    previousQuestion,
    skipQuestion,
    calculateResults,
    hasAnsweredCurrent,
    totalQuestions,
    progress,
  } = useQuiz(questions, feedbackMode);

  // Timer de tiempo transcurrido (solo cliente). El setState ocurre dentro del
  // callback del intervalo, nunca de forma síncrona en el cuerpo del efecto.
  useEffect(() => {
    if (questions.length === 0) return;

    const start = Date.now();
    const timer = setInterval(() => {
      setElapsedTime(Math.floor((Date.now() - start) / 1000));
    }, 1000);

    return () => clearInterval(timer);
  }, [questions]);

  const handleFinish = () => {
    const results = calculateResults();
    sessionStorage.setItem("quizResults", JSON.stringify(results));
    const countValue = questionCount === 0 ? "todas" : String(questionCount);
    router.push(
      `/results?subject=${subjectId}&feedback=${feedbackMode}&count=${countValue}&partial=${partialParam}`
    );
  };

  const handleAbandon = () => {
    if (confirm("¿Deseas abandonar el quiz?")) {
      router.push(`/materia/${subjectId}`);
    }
  };

  if (!currentQuestion) {
    return <LoadingScreen label="Cargando preguntas..." />;
  }

  const selectedAnswerValue = quizState.answers.find(
    (a) => a.questionId === currentQuestion.id
  )?.selectedAnswer;

  const feedbackAnswer = quizState.feedbackAnswer;

  return (
    <div className="min-h-screen px-4 py-8">
      <div className="mx-auto max-w-4xl">
        {/* Header with close button */}
        <div className="mb-6 flex items-center justify-between gap-4">
          <h1 className="text-xl font-bold text-secondary md:text-2xl">
            Quiz - {subject?.shortName ?? "Parcial"}{" "}
            <span className="text-sm font-medium text-gray-3 md:text-base">
              ({partialParam === "primer" ? "1° Parcial" : "2° Parcial"})
            </span>
          </h1>
          <button
            type="button"
            onClick={handleAbandon}
            aria-label="Abandonar el quiz"
            className="rounded-lg border border-line bg-surface p-2 text-gray-3 transition hover:border-secondary hover:text-secondary"
          >
            <LuX aria-hidden="true" className="h-5 w-5" />
          </button>
        </div>

        {/* Progress Bar */}
        <ProgressBar
          current={progress + 1}
          total={totalQuestions}
          timeElapsed={elapsedTime}
        />

        {/* Main Content */}
        <div className="mb-6 rounded-lg border border-line bg-surface p-6 md:p-8">
          <QuestionCard
            question={currentQuestion}
            currentNumber={progress + 1}
            totalQuestions={totalQuestions}
            onSelect={selectAnswer}
            hasAnswered={hasAnsweredCurrent}
            selectedAnswer={selectedAnswerValue}
            showFeedback={quizState.showFeedback}
            feedbackAnswer={
              feedbackAnswer
                ? {
                    isCorrect: feedbackAnswer.isCorrect,
                    justification: currentQuestion.justification,
                  }
                : undefined
            }
          />

          {/* Navigation */}
          <Navigation
            onPrevious={previousQuestion}
            onNext={nextQuestion}
            onSkip={skipQuestion}
            onFinish={handleFinish}
            hasPrevious={progress > 0}
            hasNext={!isLastQuestion}
            isLastQuestion={isLastQuestion}
            hasAnswered={hasAnsweredCurrent}
          />
        </div>

        {/* Footer info */}
        <p className="text-center text-xs text-gray-3">
          {feedbackMode === "immediate"
            ? "Feedback inmediato activado"
            : "Feedback al final del quiz"}
        </p>
      </div>
    </div>
  );
}

export default function QuizPage() {
  return (
    <Suspense fallback={<LoadingScreen label="Inicializando quiz..." />}>
      <QuizPageContent />
    </Suspense>
  );
}
