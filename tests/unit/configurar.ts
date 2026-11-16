/**
 * Configuración global de las pruebas unitarias (Vitest).
 * Se ejecuta antes de cada archivo de prueba.
 */

import { afterEach, beforeEach } from "vitest";
import { cleanup } from "@testing-library/react";

beforeEach(() => {
  // Punto de extensión para estado compartido futuro (base de datos en memoria, etc.).
});

afterEach(() => {
  // Limpia el DOM entre pruebas de componentes.
  cleanup();
});
