"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { Suspense } from "react";
import { useEffect, useState } from "react";
import { questionsBank } from "@/data/questions";
import { FeedbackMode } from "@/types/quiz";
import { useQuiz } from "@/hooks/useQuiz";
import { QuestionCard } from "@/components/QuestionCard";
import { ProgressBar } from "@/components/ProgressBar";
import { Navigation } from "@/components/Navigation";
import { shuffle } from "@/utils/shuffle";

function QuizPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const feedbackMode = (searchParams.get("feedback") as FeedbackMode) || "end_only";
  
  // Get and validate question count
  const countParam = searchParams.get("count");
  const validCounts = [15, 25, 50];
  const parsedCount = countParam ? parseInt(countParam, 10) : 25;
  const questionCount = validCounts.includes(parsedCount) ? parsedCount : 25;

  const [questions, setQuestions] = useState<typeof questionsBank>([]);
  const [startTime, setStartTime] = useState<number>(0);
  const [elapsedTime, setElapsedTime] = useState(0);

  // Initialize with shuffled questions on mount
  useEffect(() => {
    const shuffled = shuffle(questionsBank);
    setQuestions(shuffled.slice(0, questionCount));
  }, [questionCount]);

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
    router.push(`/results?data=${btoa(JSON.stringify(results))}&feedback=${feedbackMode}&count=${questionCount}`);
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
  
  // Convert array to string if needed (for multiple choice, we expect single answer)
  const selectedAnswer = typeof selectedAnswerValue === 'string' ? selectedAnswerValue : undefined;

  const feedbackAnswer = quizState.feedbackAnswer;

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header with close button */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-slate-100">Quiz - Calidad de Software</h1>
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
            selectedAnswer={selectedAnswer}
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
