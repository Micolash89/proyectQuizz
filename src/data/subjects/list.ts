import type { Subject } from "@/types/quiz";

/**
 * Catálogo de materias disponibles.
 * Para sumar una materia: agregar su `SubjectId` en `src/types/quiz.ts`,
 * añadir la entrada aquí y mapear su banco en `./index.ts`.
 */
export const subjects: Subject[] = [
  {
    id: "calidad-software",
    name: "Calidad de Software",
    shortName: "Calidad de Software",
    description:
      "Prepárate para los parciales con preguntas de teoría, cálculos y casos prácticos.",
    institution: "UNLaM",
    icon: "shield-check",
    topics: {
      primer: [
        "Historia y evolución de la calidad",
        "Definiciones y conceptos fundamentales",
        "Ciclo PDCA (Deming)",
        "Principios y herramientas de calidad",
        "ISO 9126 y métricas de software",
        "Puntos de función y análisis de casos",
      ],
      segundo: [
        "Riesgos en proyectos de software",
        "Costos asociados a la calidad",
        "Ciclo de Deming y mejora continua",
        "Accesibilidad en software",
        "Evaluación heurística",
        "Testing y aseguramiento de calidad",
      ],
    },
  },
];
