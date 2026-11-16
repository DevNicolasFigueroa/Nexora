import { describe, expect, it } from "vitest";

import { esquemaInicioSesion, esquemaRegistro } from "@/lib/validaciones/autenticacion";

describe("esquemaInicioSesion", () => {
  it("acepta credenciales con formato válido", () => {
    const resultado = esquemaInicioSesion.safeParse({
      correo: "ana@ejemplo.com",
      contrasena: "12345678",
    });

    expect(resultado.success).toBe(true);
  });

  it("rechaza un correo con formato inválido", () => {
    const resultado = esquemaInicioSesion.safeParse({
      correo: "correo-invalido",
      contrasena: "12345678",
    });

    expect(resultado.success).toBe(false);
  });

  it("rechaza una contraseña demasiado corta", () => {
    const resultado = esquemaInicioSesion.safeParse({
      correo: "ana@ejemplo.com",
      contrasena: "corta",
    });

    expect(resultado.success).toBe(false);
  });
});

describe("esquemaRegistro", () => {
  const datosValidos = {
    nombreCompleto: "Ana Torres",
    correo: "ana@ejemplo.com",
    contrasena: "12345678",
    confirmacionContrasena: "12345678",
  };

  it("acepta un registro válido", () => {
    expect(esquemaRegistro.safeParse(datosValidos).success).toBe(true);
  });

  it("rechaza cuando las contraseñas no coinciden", () => {
    const resultado = esquemaRegistro.safeParse({
      ...datosValidos,
      confirmacionContrasena: "distinta123",
    });

    expect(resultado.success).toBe(false);
  });
});
