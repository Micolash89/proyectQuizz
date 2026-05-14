"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Question,
  UserAnswer,
  QuizState,
  QuizResult,
  CategoryBreakdown,
  FeedbackMode,
} from "@/types/quiz";
import { shuffle } from "@/utils/shuffle";

export const useQuiz = (questions: Question[], feedbackMode: FeedbackMode) => {
  const [quizState, setQuizState] = useState<QuizState>({
    currentQuestionIndex: 0,
    answers: [],
    startTime: Date.now(),
    showFeedback: false,
  });

  const [shuffledQuestions, setShuffledQuestions] = useState<Question[]>([]);

  useEffect(() => {
    setShuffledQuestions(shuffle(questions));
  }, [questions]);

  const currentQuestion = shuffledQuestions[quizState.currentQuestionIndex];
  const isLastQuestion = quizState.currentQuestionIndex === shuffledQuestions.length - 1;

  const selectAnswer = useCallback(
    (answer: string) => {
      if (!currentQuestion) return;

      const isCorrect = answer === currentQuestion.correctAnswer;

      const newAnswer: UserAnswer = {
        questionId: currentQuestion.id,
        selectedAnswer: answer,
        isCorrect,
        timeSpent: (Date.now() - quizState.startTime) / 1000,
        questionText: currentQuestion.text,
        correctAnswer: currentQuestion.correctAnswer,
        category: currentQuestion.category,
        difficulty: currentQuestion.difficulty,
      };

      setQuizState((prev) => ({
        ...prev,
        answers: [...prev.answers, newAnswer],
        showFeedback: feedbackMode === "immediate",
        feedbackAnswer: newAnswer,
      }));
    },
    [currentQuestion, quizState.startTime, feedbackMode]
  );

  const nextQuestion = useCallback(() => {
    setQuizState((prev) => ({
      ...prev,
      currentQuestionIndex: prev.currentQuestionIndex + 1,
      showFeedback: false,
    }));
  }, []);

  const previousQuestion = useCallback(() => {
    if (quizState.currentQuestionIndex > 0) {
      setQuizState((prev) => ({
        ...prev,
        currentQuestionIndex: prev.currentQuestionIndex - 1,
        showFeedback: false,
      }));
    }
  }, [quizState.currentQuestionIndex]);

  const skipQuestion = useCallback(() => {
    if (!isLastQuestion) {
      nextQuestion();
    }
  }, [isLastQuestion, nextQuestion]);

  const calculateResults = useCallback((): QuizResult => {
    const totalQuestions = quizState.answers.length;
    const correctAnswers = quizState.answers.filter((a) => a.isCorrect).length;
    const score = correctAnswers;
    const percentage = (correctAnswers / totalQuestions) * 100;
    const timeTotal = (Date.now() - quizState.startTime) / 1000;

    // Category breakdown
    const categoryBreakdown: CategoryBreakdown = {};
    quizState.answers.forEach((answer) => {
      if (!categoryBreakdown[answer.category]) {
        categoryBreakdown[answer.category] = { correct: 0, total: 0, percentage: 0 };
      }
      categoryBreakdown[answer.category].total += 1;
      if (answer.isCorrect) {
        categoryBreakdown[answer.category].correct += 1;
      }
      categoryBreakdown[answer.category].percentage =
        (categoryBreakdown[answer.category].correct / categoryBreakdown[answer.category].total) *
        100;
    });

    // Difficulty breakdown
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
    totalQuestions: shuffledQuestions.length,
    progress: quizState.currentQuestionIndex,
  };
};
