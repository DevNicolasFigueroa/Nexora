/**
 * Global test configuration (Vitest).
 * Runs before every test file.
 */

import { afterEach } from "vitest";
import { cleanup } from "@testing-library/react";

afterEach(() => {
  // Clears the DOM between component tests.
  cleanup();
});
