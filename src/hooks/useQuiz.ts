"use client";

import { useState, useCallback, useRef } from "react";
import {
  Question,
  UserAnswer,
  QuizState,
  QuizResult,
  CategoryBreakdown,
  FeedbackMode,
} from "@/types/quiz";

/**
 * Orquesta el estado de un quiz sobre una lista de preguntas ya preparada
 * (filtrada, mezclada y recortada por quien la invoca).
 */
export const useQuiz = (questions: Question[], feedbackMode: FeedbackMode) => {
  const [quizState, setQuizState] = useState<QuizState>(() => ({
    currentQuestionIndex: 0,
    answers: [],
    startTime: Date.now(),
    showFeedback: false,
  }));

  // Marca de tiempo de la última respuesta para medir el tiempo por pregunta.
  const lastAnswerAt = useRef(quizState.startTime);

  const currentQuestion = questions[quizState.currentQuestionIndex];
  const isLastQuestion =
    quizState.currentQuestionIndex === questions.length - 1;

  const selectAnswer = useCallback(
    (answer: string | string[]) => {
      if (!currentQuestion) return;

      const compareAnswers = (
        selected: string | string[],
        correct: string | string[]
      ): boolean => {
        if (Array.isArray(selected) && Array.isArray(correct)) {
          const sortedSelected = [...selected].sort();
          const sortedCorrect = [...correct].sort();
          return (
            JSON.stringify(sortedSelected) === JSON.stringify(sortedCorrect)
          );
        }
        if (typeof selected === "string" && typeof correct === "string") {
          return selected === correct;
        }
        return false;
      };

      const now = Date.now();
      const isCorrect = compareAnswers(answer, currentQuestion.correctAnswer);

      const newAnswer: UserAnswer = {
        questionId: currentQuestion.id,
        selectedAnswer: answer,
        isCorrect,
        timeSpent: (now - lastAnswerAt.current) / 1000,
        questionText: currentQuestion.text,
        correctAnswer: currentQuestion.correctAnswer,
        category: currentQuestion.category,
        difficulty: currentQuestion.difficulty,
      };
      lastAnswerAt.current = now;

      setQuizState((prev) => ({
        ...prev,
        answers: [...prev.answers, newAnswer],
        showFeedback: feedbackMode === "immediate",
        feedbackAnswer: newAnswer,
      }));
    },
    [currentQuestion, feedbackMode]
  );

  const nextQuestion = useCallback(() => {
    setQuizState((prev) => ({
      ...prev,
      currentQuestionIndex: prev.currentQuestionIndex + 1,
      showFeedback: false,
    }));
  }, []);

  const previousQuestion = useCallback(() => {
    setQuizState((prev) =>
      prev.currentQuestionIndex > 0
        ? {
            ...prev,
            currentQuestionIndex: prev.currentQuestionIndex - 1,
            showFeedback: false,
          }
        : prev
    );
  }, []);

  const skipQuestion = useCallback(() => {
    if (!isLastQuestion) {
      nextQuestion();
    }
  }, [isLastQuestion, nextQuestion]);

  const calculateResults = useCallback((): QuizResult => {
    const totalQuestions = quizState.answers.length;
    const correctAnswers = quizState.answers.filter((a) => a.isCorrect).length;
    const score = correctAnswers;
    const percentage =
      totalQuestions > 0 ? (correctAnswers / totalQuestions) * 100 : 0;
    const timeTotal = (Date.now() - quizState.startTime) / 1000;

    const categoryBreakdown: CategoryBreakdown = {};
    quizState.answers.forEach((answer) => {
      if (!categoryBreakdown[answer.category]) {
        categoryBreakdown[answer.category] = {
          correct: 0,
          total: 0,
          percentage: 0,
        };
      }
      categoryBreakdown[answer.category].total += 1;
      if (answer.isCorrect) {
        categoryBreakdown[answer.category].correct += 1;
      }
      categoryBreakdown[answer.category].percentage =
        (categoryBreakdown[answer.category].correct /
          categoryBreakdown[answer.category].total) *
        100;
    });

    const difficultyBreakdown = {
      easy: { correct: 0, total: 0, percentage: 0 },
      medium: { correct: 0, total: 0, percentage: 0 },
      hard: { correct: 0, total: 0, percentage: 0 },
    };

    quizState.answers.forEach((answer) => {
      const difficulty = answer.difficulty;
      difficultyBreakdown[difficulty].total += 1;
      if (answer.isCorrect) {
        difficultyBreakdown[difficulty].correct += 1;
      }
    });

    Object.keys(difficultyBreakdown).forEach((key) => {
      const diff = difficultyBreakdown[key as keyof typeof difficultyBreakdown];
      if (diff.total > 0) {
        diff.percentage = (diff.correct / diff.total) * 100;
      }
    });

    return {
      score,
      totalQuestions,
      percentage,
      timeTotal,
      answers: quizState.answers,
      categoryBreakdown,
      difficultyBreakdown,
    };
  }, [quizState]);

  const hasAnsweredCurrent = quizState.answers.some(
    (a) => a.questionId === currentQuestion?.id
  );

  return {
    quizState,
    currentQuestion,
    isLastQuestion,
    selectAnswer,
    nextQuestion,
    previousQuestion,
    skipQuestion,
    calculateResults,
    hasAnsweredCurrent,
    totalQuestions: questions.length,
    progress: quizState.currentQuestionIndex,
  };
};
