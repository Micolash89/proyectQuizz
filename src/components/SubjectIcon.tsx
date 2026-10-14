"use client";

import {
  LuBookOpen,
  LuBrain,
  LuGraduationCap,
  LuShieldCheck,
} from "react-icons/lu";
import type { IconType } from "react-icons/lib";
import type { SubjectIcon as SubjectIconName } from "@/types/quiz";

const ICONS: Record<SubjectIconName, IconType> = {
  "graduation-cap": LuGraduationCap,
  "book-open": LuBookOpen,
  brain: LuBrain,
  "shield-check": LuShieldCheck,
};

interface SubjectIconProps {
  name: SubjectIconName;
  className?: string;
  /** Decorativo por defecto; el nombre de la materia lo describe como texto. */
  "aria-hidden"?: boolean;
}

export function SubjectIcon({ name, className, ...rest }: SubjectIconProps) {
  const Icon = ICONS[name];
  return <Icon aria-hidden="true" className={className} {...rest} />;
}
