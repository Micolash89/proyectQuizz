"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { Suspense } from "react";
import { useEffect, useState } from "react";
import { questionsBank } from "@/data/questions";
import { FeedbackMode, Partial } from "@/types/quiz";
import { useQuiz } from "@/hooks/useQuiz";
import { QuestionCard } from "@/components/QuestionCard";
import { ProgressBar } from "@/components/ProgressBar";
import { Navigation } from "@/components/Navigation";
import { shuffle } from "@/utils/shuffle";

function QuizPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const feedbackMode = (searchParams.get("feedback") as FeedbackMode) || "end_only";
  const partialParam = (searchParams.get("partial") as Partial) || "primer";
  
  // Get and validate question count - "todas" means all questions
  const countParam = searchParams.get("count");
  const isTodas = countParam === "todas" || countParam === "0";
  const parsedCount = countParam ? parseInt(countParam, 10) : 25;
  const questionCount = isTodas ? 0 : ([15, 25, 50].includes(parsedCount) ? parsedCount : 25);

  const [questions, setQuestions] = useState<typeof questionsBank>([]);
  const [startTime, setStartTime] = useState<number>(0);
  const [elapsedTime, setElapsedTime] = useState(0);

  // Initialize with shuffled questions on mount, filtered by partial
  useEffect(() => {
    const filteredQuestions = questionsBank.filter((q) => q.partial === partialParam);
    const shuffled = shuffle(filteredQuestions);
    // questionCount === 0 means "todas" (all questions)
    setQuestions(questionCount === 0 ? shuffled : shuffled.slice(0, questionCount));
  }, [questionCount, partialParam]);

  const {
    quizState,
    currentQuestion,
    selectAnswer,
    nextQuestion,
    previousQuestion,
    skipQuestion,
    calculateResults,
    hasAnsweredCurrent,
    totalQuestions,
    progress,
  } = useQuiz(questions, feedbackMode);

  useEffect(() => {
    if (startTime === 0) {
      setStartTime(Date.now());
    }
  }, [startTime]);

  useEffect(() => {
    if (startTime === 0) return;
    
    const timer = setInterval(() => {
      setElapsedTime(Math.floor((Date.now() - startTime) / 1000));
    }, 1000);

    return () => clearInterval(timer);
  }, [startTime]);

  const isLastQuestion = progress === totalQuestions - 1;

  const handleFinish = () => {
    const results = calculateResults();
    sessionStorage.setItem("quizResults", JSON.stringify(results));
    router.push(`/results?feedback=${feedbackMode}&count=${questionCount}&partial=${partialParam}`);
  };

  if (!currentQuestion) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-slate-400 mb-4">Cargando preguntas...</p>
          <div className="inline-block animate-spin">
            <div className="h-8 w-8 border-4 border-slate-700 border-t-blue-500 rounded-full" />
          </div>
        </div>
      </div>
    );
  }

  const selectedAnswerValue = quizState.answers.find(
    (a) => a.questionId === currentQuestion.id
  )?.selectedAnswer;

  const feedbackAnswer = quizState.feedbackAnswer;

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header with close button */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-slate-100">
            Quiz - Calidad de Software ({partialParam === "primer" ? "Primer Parcial" : "Segundo Parcial"})
          </h1>
          <button
            onClick={() => {
              if (confirm("¿Deseas abandonar el quiz?")) {
                router.push("/");
              }
            }}
            className="text-slate-400 hover:text-slate-200 transition"
          >
            ✕
          </button>
        </div>

        {/* Progress Bar */}
        <ProgressBar
          current={progress + 1}
          total={totalQuestions}
          timeElapsed={elapsedTime}
        />

        {/* Main Content */}
        <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-8 mb-6">
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
            hasNext={progress < totalQuestions - 1}
            canAnswerNext={hasAnsweredCurrent}
            isLastQuestion={isLastQuestion}
            hasAnswered={hasAnsweredCurrent}
          />
        </div>

        {/* Footer info */}
        <div className="text-center text-xs text-slate-500">
          <p>
            {feedbackMode === "immediate"
              ? "📌 Feedback inmediato activado"
              : "📌 Feedback al final del quiz"}
          </p>
        </div>
      </div>
    </div>
  );
}

export default function QuizPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
          <div className="text-center">
            <p className="text-slate-400 mb-4">Inicializando quiz...</p>
            <div className="inline-block animate-spin">
              <div className="h-8 w-8 border-4 border-slate-700 border-t-blue-500 rounded-full" />
            </div>
          </div>
        </div>
      }
    >
      <QuizPageContent />
    </Suspense>
  );
}
