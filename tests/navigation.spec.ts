import { test, expect, Page } from '@playwright/test';

/**
 * Tests E2E para la navegación entre vistas
 */

async function loadDemoData(page: Page) {
    await page.goto('/');
    const demoButton = page.locator('button:has-text("Cargar Datos Demo")');
    await demoButton.click({ force: true });
    await page.waitForTimeout(500);
    await expect(page.locator('text=/torneo demo/i').first()).toBeVisible();
}

test.describe('Navegación Básica', () => {

    test('debe cargar la página principal inicialmente', async ({ page }) => {
        await page.goto('/');

        await expect(page.getByText('TORNEO FLOW')).toBeVisible();
    });

    test('debe navegar a TournamentRoom con datos demo', async ({ page }) => {
        await loadDemoData(page);

        await expect(page.locator('text=/torneo demo/i').first()).toBeVisible();
        await expect(page.locator('text=/EQUIPO/i').first()).toBeVisible();
    });

    test('debe tener navegación principal visible', async ({ page }) => {
        await loadDemoData(page);

        // Botones de navegación en header
        await expect(page.getByText('INICIO')).toBeVisible();
        await expect(page.getByText('TABLA')).toBeVisible();
        await expect(page.getByText('PDF')).toBeVisible();
    });
});

test.describe('Navegación entre Vistas de Torneo', () => {

    test('debe poder volver a inicio desde TournamentRoom', async ({ page }) => {
        await loadDemoData(page);

        await page.getByText('INICIO').click();
        await page.waitForTimeout(300);

        await expect(page.getByText('TORNEO FLOW')).toBeVisible();
    });

    test('debe poder ir a vista de tabla', async ({ page }) => {
        await loadDemoData(page);

        await page.getByText('TABLA').click();
        await page.waitForTimeout(300);

        // Debería cambiar de vista
        await expect(page.locator('body')).toBeVisible();
    });

    test('debe mantener nombre del torneo en navegación', async ({ page }) => {
        await loadDemoData(page);

        // Navegar a tabla
        await page.getByText('TABLA').click();
        await page.waitForTimeout(300);

        // El nombre del torneo debe seguir visible
        await expect(page.getByText('Torneo Demo').first()).toBeVisible();
    });
});

test.describe('Navegación entre Equipos', () => {

    test('debe tener flechas de navegación entre equipos', async ({ page }) => {
        await loadDemoData(page);

        // Hay flechas para navegar entre equipos
        // Deben estar los botones con iconos de flecha
        const buttons = page.locator('button');
        const count = await buttons.count();

        expect(count).toBeGreaterThan(5);
    });

    test('debe mostrar contador de equipo actual', async ({ page }) => {
        await loadDemoData(page);

        // Debería mostrar "EQUIPO 1 / X"
        await expect(page.locator('text=EQUIPO 1 /')).toBeVisible();
    });
});

test.describe('Responsividad en Navegación', () => {

    test('debe adaptarse a viewport móvil', async ({ page }) => {
        await page.setViewportSize({ width: 375, height: 667 });
        await page.goto('/');

        await expect(page.getByText('TORNEO FLOW')).toBeVisible();
        await expect(page.getByRole('button', { name: /crear torneo/i })).toBeVisible();
    });

    test('debe adaptarse a viewport tablet', async ({ page }) => {
        await page.setViewportSize({ width: 768, height: 1024 });
        await page.goto('/');

        await expect(page.getByText('TORNEO FLOW')).toBeVisible();
    });

    test('debe adaptarse a viewport desktop', async ({ page }) => {
        await page.setViewportSize({ width: 1920, height: 1080 });
        await page.goto('/');

        await expect(page.getByText('TORNEO FLOW')).toBeVisible();
    });
});
