import { describe, expect, it } from "vitest";

import {
  registrationSchema,
  signInSchema,
} from "@/lib/validations/auth";
import { organizationSchema } from "@/lib/validations/organization";

describe("signInSchema", () => {
  it("accepts valid credentials", () => {
    const result = signInSchema.safeParse({
      email: "ana@ejemplo.com",
      password: "12345678",
    });

    expect(result.success).toBe(true);
  });

  it("rejects an invalid email format", () => {
    const result = signInSchema.safeParse({
      email: "correo-invalido",
      password: "12345678",
    });

    expect(result.success).toBe(false);
  });

  it("rejects a too short password", () => {
    const result = signInSchema.safeParse({
      email: "ana@ejemplo.com",
      password: "corta",
    });

    expect(result.success).toBe(false);
  });
});

describe("registrationSchema", () => {
  const validData = {
    fullName: "Ana Torres",
    email: "ana@ejemplo.com",
    password: "12345678",
    passwordConfirmation: "12345678",
    organizationName: "Consultora Delta",
  };

  it("accepts a valid registration without organization slug", () => {
    expect(registrationSchema.safeParse(validData).success).toBe(true);
  });

  it("accepts a valid registration with an explicit organization slug", () => {
    const result = registrationSchema.safeParse({
      ...validData,
      organizationSlug: "consultora-delta",
    });

    expect(result.success).toBe(true);
  });

  it("rejects mismatched passwords", () => {
    const result = registrationSchema.safeParse({
      ...validData,
      passwordConfirmation: "distinta123",
    });

    expect(result.success).toBe(false);
  });

  it("rejects a slug with spaces or uppercase letters", () => {
    const result = registrationSchema.safeParse({
      ...validData,
      organizationSlug: "Mi Consultora",
    });

    expect(result.success).toBe(false);
  });
});

describe("organizationSchema", () => {
  it("accepts a name without slug (identifier is optional)", () => {
    const result = organizationSchema.safeParse({ name: "Estudio Rojas" });

    expect(result.success).toBe(true);
  });

  it("accepts a normalized slug", () => {
    const result = organizationSchema.safeParse({
      name: "Estudio Rojas",
      slug: "estudio-rojas",
    });

    expect(result.success).toBe(true);
  });

  it("rejects an invalid slug", () => {
    const result = organizationSchema.safeParse({
      name: "Estudio Rojas",
      slug: "Slug Invalido",
    });

    expect(result.success).toBe(false);
  });
});
