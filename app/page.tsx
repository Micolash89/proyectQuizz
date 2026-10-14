import { subjects } from "@/data/subjects";
import { SubjectCard } from "@/components/SubjectCard";
import Image from "next/image";

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center px-4 py-10">
      <div className="w-full max-w-2xl">
        {/* Espacio reservado para el logo institucional (se agregará luego). */}
        <div className=" mb-8 " aria-hidden="true">
        <Image
          src="/images/logo_unlam.png"
          alt="Logo de la Universidad Nacional de La Plata"
          width={80}
          height={80}
          className=" mx-auto h-20 w-auto md:h-24"
          />
          </div>

        <header className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-secondary md:text-4xl">
            Simulador de Parciales
          </h1>
          <p className="mt-2 text-gray-3">
            Elegí la materia para empezar a practicar
          </p>
        </header>

        <ul className="flex flex-col gap-4">
          {subjects.map((subject) => (
            <li key={subject.id}>
              <SubjectCard subject={subject} />
            </li>
          ))}
        </ul>

        <p className="mt-10 text-center text-xs text-gray-3">
          Contenido basado en los apuntes de la cátedra
        </p>
      </div>
    </main>
  );
}
