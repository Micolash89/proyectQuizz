import type { Question, Subject, SubjectId } from "@/types/quiz";
import { questionsBank } from "@/data/questions";
import { subjects } from "./list";

export { subjects };

/**
 * Banco de preguntas por materia.
 * Cada `SubjectId` debe tener su banco correspondiente.
 */
export const questionsBySubject: Record<SubjectId, Question[]> = {
  "calidad-software": questionsBank,
};

export function isValidSubjectId(id: string): id is SubjectId {
  return id in questionsBySubject;
}

/** Devuelve la materia por id (o por slug, que hoy coincide con el id). */
export function getSubject(id: string): Subject | undefined {
  return subjects.find((subject) => subject.id === id);
}

/** Devuelve el banco de preguntas de una materia (vacío si no existe). */
export function getQuestionsBySubject(id: SubjectId): Question[] {
  return questionsBySubject[id] ?? [];
}
