import { test, expect } from '@playwright/test';

/**
 * Tests E2E para la página Home de TORNEOFLOW
 * Verifica la carga inicial, interacciones básicas y validaciones de formulario
 */

test.describe('Página Home', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/');
    });

    test('debe cargar correctamente la página principal', async ({ page }) => {
        // Verificar título y elementos principales
        await expect(page.getByText('TORNEO FLOW')).toBeVisible();
        await expect(page.getByText('Gestor de torneos inteligente')).toBeVisible();

        // Verificar que el formulario está presente
        await expect(page.getByPlaceholder('Ej: Copa de Verano 2024')).toBeVisible();
        await expect(page.getByRole('button', { name: /comenzar torneo/i })).toBeVisible();
    });

    test('debe mostrar error si no se ingresa nombre de torneo', async ({ page }) => {
        // Hacer clic en comenzar sin datos
        page.on('dialog', async dialog => {
            expect(dialog.message()).toContain('nombre del torneo');
            await dialog.dismiss();
        });

        await page.getByRole('button', { name: /comenzar torneo/i }).click();
    });

    test('debe mostrar error si no se ingresan fechas', async ({ page }) => {
        // Ingresar solo el nombre
        await page.getByPlaceholder('Ej: Copa de Verano 2024').fill('Mi Torneo');

        page.on('dialog', async dialog => {
            expect(dialog.message()).toContain('fechas');
            await dialog.dismiss();
        });

        await page.getByRole('button', { name: /comenzar torneo/i }).click();
    });

    test('debe mostrar error si no se ingresan jugadores', async ({ page }) => {
        // Ingresar nombre y fechas
        await page.getByPlaceholder('Ej: Copa de Verano 2024').fill('Mi Torneo');

        // Llenar fechas
        const dateInputs = page.locator('input[type="date"]');
        await dateInputs.first().fill('2024-01-01');
        await dateInputs.last().fill('2024-12-31');

        page.on('dialog', async dialog => {
            expect(dialog.message()).toContain('jugadores');
            await dialog.dismiss();
        });

        await page.getByRole('button', { name: /comenzar torneo/i }).click();
    });

    test('debe cargar datos demo y navegar a TournamentRoom automáticamente', async ({ page }) => {
        // El botón de demo tiene opacity-50, usar force para click
        const demoButton = page.locator('button:has-text("Cargar Datos Demo")');
        await demoButton.click({ force: true });

        // Como hay >22 jugadores en demo, navega directamente a TournamentRoom
        // Esperar a que cargue la nueva vista
        await page.waitForTimeout(500);

        // Verificar que estamos en TournamentRoom (ya no en home)
        // Nota: el texto puede ser "Torneo Demo" o "TORNEO DEMO" dependiendo del estilo
        await expect(page.locator('text=/torneo demo/i').first()).toBeVisible();
        await expect(page.locator('text=/EQUIPO/i').first()).toBeVisible();
    });

    test('debe tener botón de descargar modelo visible', async ({ page }) => {
        const downloadBtn = page.getByRole('button', { name: /descargar modelo/i });
        await expect(downloadBtn).toBeVisible();
    });

    test('debe tener botón de importar excel visible', async ({ page }) => {
        const importBtn = page.getByRole('button', { name: /importar excel/i });
        await expect(importBtn).toBeVisible();
    });
});
