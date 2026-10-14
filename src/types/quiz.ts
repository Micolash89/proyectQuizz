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
  | "analisis"
  // Segundo parcial
  | "riesgos"
  | "costos_calidad"
  | "deming"
  | "accesibilidad"
  | "heuristica"
  | "testing";

export type Partial = "primer" | "segundo";

export type Difficulty = "easy" | "medium" | "hard";
export type QuestionType = "multiple_choice" | "true_false" | "calculation" | "analysis";
export type FeedbackMode = "immediate" | "end_only";

export const DIFFICULTIES = ["easy", "medium", "hard"] as const;

/**
 * Identificadores de las materias disponibles.
 * Agregar aquí (y en `src/data/subjects`) al sumar una nueva materia.
 */
export type SubjectId = "calidad-software";

/**
 * Clave del ícono a mostrar para una materia. El mapeo a un ícono concreto
 * vive en la capa de UI (`react-icons/lu`), manteniendo los datos serializables.
 */
export type SubjectIcon = "graduation-cap" | "book-open" | "brain" | "shield-check";

export interface Subject {
  id: SubjectId;
  /** Nombre completo de la materia. */
  name: string;
  /** Nombre corto para espacios reducidos. */
  shortName: string;
  /** Descripción breve mostrada en el selector de materias. */
  description: string;
  /** Institución (por ejemplo "UNLaM"). */
  institution: string;
  /** Ícono asociado a la materia. */
  icon: SubjectIcon;
  /** Temario por parcial, mostrado en la pantalla de configuración. */
  topics: {
    primer: string[];
    segundo: string[];
  };
}

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
  partial: Partial; // "primer" o "segundo"
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
