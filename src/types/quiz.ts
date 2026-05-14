export type QuestionCategory =
  | "historia"
  | "definiciones"
  | "pdca"
  | "principios"
  | "herramientas"
  | "iso9126"
  | "metricas"
  | "pf_teoria"
  | "pf_calculo"
  | "equipo"
  | "costos"
  | "clientes"
  | "decisiones"
  | "casos_practicos"
  | "vf_justificado"
  | "analisis";

export type Difficulty = "easy" | "medium" | "hard";
export type QuestionType = "multiple_choice" | "true_false" | "calculation" | "analysis";
export type FeedbackMode = "immediate" | "end_only";

export interface Option {
  letter: string;
  text: string;
}

export interface Question {
  id: number;
  text: string;
  type: QuestionType;
  options: Option[];
  correctAnswer: string | string[]; // string para MC, array para múltiples respuestas
  justification: string;
  category: QuestionCategory;
  difficulty: Difficulty;
  source: string; // "Apunte 1", "Evans Cap 1", "Fichas Miel", etc
  relatedConcepts?: string[]; // Conceptos relacionados
}

export interface UserAnswer {
  questionId: number;
  selectedAnswer: string | string[];
  isCorrect: boolean;
  timeSpent: number; // en segundos
  questionText: string;
  correctAnswer: string | string[];
  category: QuestionCategory;
  difficulty: Difficulty;
}

export interface QuizSettings {
  feedbackMode: FeedbackMode;
  totalQuestions: number;
}

export interface QuizState {
  currentQuestionIndex: number;
  answers: UserAnswer[];
  startTime: number;
  showFeedback: boolean;
  feedbackAnswer?: UserAnswer;
}

export interface CategoryBreakdown {
  [key: string]: {
    correct: number;
    total: number;
    percentage: number;
  };
}

export interface QuizResult {
  score: number;
  totalQuestions: number;
  percentage: number;
  timeTotal: number; // en segundos
  answers: UserAnswer[];
  categoryBreakdown: CategoryBreakdown;
  difficultyBreakdown: {
    easy: { correct: number; total: number; percentage: number };
    medium: { correct: number; total: number; percentage: number };
    hard: { correct: number; total: number; percentage: number };
  };
}
