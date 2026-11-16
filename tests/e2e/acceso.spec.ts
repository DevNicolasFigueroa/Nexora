import { expect, test } from "@playwright/test";

test.describe("Acceso a la aplicación", () => {
  test("la página de inicio muestra la marca y los enlaces principales", async ({ page }) => {
    await page.goto("/");

    await expect(page.getByRole("heading", { level: 1 })).toContainText("Nexora");
    await expect(page.getByRole("link", { name: "Iniciar sesión" })).toBeVisible();
  });

  test("la página de inicio de sesión se muestra en español", async ({ page }) => {
    await page.goto("/login");

    await expect(page.getByRole("heading", { name: "Iniciar sesión" })).toBeVisible();
    await expect(page.getByLabel("Correo electrónico")).toBeVisible();
    await expect(page.getByLabel("Contraseña")).toBeVisible();
  });
});
