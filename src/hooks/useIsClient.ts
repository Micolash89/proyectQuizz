"use client";

import { useSyncExternalStore } from "react";

// `subscribe` estable: el valor nunca cambia una vez montado, así que no hay
// nada a lo que suscribirse.
const subscribe = () => () => {};

/**
 * Devuelve `false` durante el render en servidor y en el primer render de
 * hidratación, y `true` una vez montado en el cliente.
 *
 * Sirve para trabajar con APIs exclusivas del navegador (sessionStorage,
 * Math.random, etc.) sin provocar errores de hidratación y sin recurrir a
 * `setState` dentro de un efecto.
 */
export function useIsClient(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => true,
    () => false
  );
}
