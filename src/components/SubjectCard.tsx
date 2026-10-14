"use client";

import Link from "next/link";
import { LuChevronRight } from "react-icons/lu";
import type { Subject } from "@/types/quiz";
import { SubjectIcon } from "./SubjectIcon";

interface SubjectCardProps {
  subject: Subject;
}

/**
 * Tarjeta seleccionable de una materia. Al hacer click navega al menú de
 * configuración del cuestionario de esa materia (`/materia/[slug]`).
 */
export function SubjectCard({ subject }: SubjectCardProps) {
  return (
    <Link
      href={`/materia/${subject.id}`}
      className="group flex w-full items-center gap-4 rounded-xl border border-line bg-surface p-5 transition hover:border-secondary hover:bg-surface-2"
    >
      <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg border border-line bg-surface-2 text-secondary transition group-hover:border-secondary">
        <SubjectIcon name={subject.icon} className="h-6 w-6" />
      </span>

      <span className="min-w-0 flex-1">
        <span className="block text-base font-semibold text-secondary">
          {subject.name}
        </span>
      </span>

      <LuChevronRight
        aria-hidden="true"
        className="h-5 w-5 shrink-0 text-gray-3 transition group-hover:translate-x-0.5 group-hover:text-secondary"
      />
    </Link>
  );
}
