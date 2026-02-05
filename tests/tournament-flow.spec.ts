import { test, expect, Page } from '@playwright/test';

/**
 * Tests E2E para el flujo completo del torneo
 * Los datos demo tienen >22 jugadores, por lo que al cargarlos
 * la app navega directamente a TournamentRoom
 */

// Helper para cargar datos demo (navega automáticamente a TournamentRoom)
async function loadDemoData(page: Page) {
    await page.goto('/');

    // El botón de demo tiene opacity-50, usar force para click
    const demoButton = page.locator('button:has-text("Cargar Datos Demo")');
    await demoButton.click({ force: true });

    // Esperar a que cargue TournamentRoom
    await page.waitForTimeout(500);

    // Verificar que estamos en TournamentRoom
    await expect(page.locator('text=/torneo demo/i').first()).toBeVisible();
}

test.describe('Flujo de Torneo Completo', () => {

    test('debe navegar a TournamentRoom después de cargar datos demo', async ({ page }) => {
        await loadDemoData(page);

        // Verificar que estamos en la vista de torneo
        await expect(page.locator('text=/torneo demo/i').first()).toBeVisible();
        await expect(page.locator('text=/EQUIPO/i').first()).toBeVisible();
    });

    test('debe mostrar equipos generados en TournamentRoom', async ({ page }) => {
        await loadDemoData(page);

        // Verificar que muestra información de equipos
        await expect(page.locator('text=/EQUIPO/i').first()).toBeVisible();

        // Verificar que hay estadísticas
        await expect(page.getByText('ESTADÍSTICAS')).toBeVisible();
    });

    test('debe mostrar navegación entre equipos', async ({ page }) => {
        await loadDemoData(page);

        // Debería haber botón para navegar al siguiente equipo
        // Hay flechas de navegación (ChevronLeft/ChevronRight)
        const navButtons = page.locator('button');
        const count = await navButtons.count();

        expect(count).toBeGreaterThan(3);
    });

    test('debe mostrar botones de acción principales', async ({ page }) => {
        await loadDemoData(page);

        // Debería haber botones: INICIO, TABLA, PDF
        await expect(page.getByText('INICIO')).toBeVisible();
        await expect(page.getByText('TABLA')).toBeVisible();
        await expect(page.getByText('PDF')).toBeVisible();
    });

    test('debe mostrar información de titulares y suplentes', async ({ page }) => {
        await loadDemoData(page);

        // Verificar sección de suplentes
        await expect(page.getByText('Titulares')).toBeVisible();
        await expect(page.getByText('Suplentes', { exact: true })).toBeVisible();
    });

    test('debe poder navegar a inicio', async ({ page }) => {
        await loadDemoData(page);

        // Click en INICIO para volver
        await page.getByText('INICIO').click();

        // Esperar navegación
        await page.waitForTimeout(300);

        // Debería estar de vuelta en Home
        await expect(page.getByText('TORNEO FLOW')).toBeVisible();
    });
});

test.describe('Vista de Tabla', () => {

    test('debe poder navegar a vista de tabla', async ({ page }) => {
        await loadDemoData(page);

        // Click en TABLA
        await page.getByText('TABLA').click();

        // Esperar navegación
        await page.waitForTimeout(300);

        // Debería mostrar vista de tabla
        // El header debería seguir mostrando el nombre del torneo
        await expect(page.getByText('Torneo Demo').first()).toBeVisible();
    });
});

test.describe('Generación de Equipos', () => {

    test('debe mostrar jugadores en formación', async ({ page }) => {
        await loadDemoData(page);

        // Buscar jugadores en la formación
        // Los jugadores se muestran con sus nombres y posiciones
        const bodyContent = await page.textContent('body');

        // Debería haber contenido
        expect(bodyContent?.length).toBeGreaterThan(500);

        // Debería incluir posiciones de jugadores
        expect(bodyContent).toMatch(/DEL|MED|CEN|LAT|ARQ|VOL/);
    });
});
