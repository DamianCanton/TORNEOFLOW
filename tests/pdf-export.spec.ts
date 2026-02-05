import { test, expect, Page } from '@playwright/test';

/**
 * Tests E2E para la funcionalidad de exportación PDF
 */

async function loadDemoData(page: Page) {
    await page.goto('/');
    const demoButton = page.locator('button:has-text("Cargar Datos Demo")');
    await demoButton.click({ force: true });
    await page.waitForTimeout(500);
    await expect(page.locator('text=/torneo demo/i').first()).toBeVisible();
}

test.describe('Exportación PDF', () => {

    test('debe tener botón PDF visible en TournamentRoom', async ({ page }) => {
        await loadDemoData(page);

        await expect(page.getByText('PDF')).toBeVisible();
    });

    test('debe tener el nombre del torneo para el PDF', async ({ page }) => {
        await loadDemoData(page);

        // El PDF incluirá el nombre del torneo
        await expect(page.locator('text=/torneo demo/i').first()).toBeVisible();
    });

    test('debe poder hacer click en botón PDF', async ({ page }) => {
        await loadDemoData(page);

        // El botón PDF debería ser clickeable
        const pdfButton = page.getByText('PDF');
        await expect(pdfButton).toBeEnabled();

        // Intentar click (puede iniciar descarga)
        // No verificamos la descarga, solo que no hay error
        await pdfButton.click();
        await page.waitForTimeout(500);

        // La página debe seguir funcional
        await expect(page.locator('body')).toBeVisible();
    });
});

test.describe('Contenido para PDF', () => {

    test('debe tener fechas del torneo visibles', async ({ page }) => {
        await loadDemoData(page);

        // Las fechas se muestran en formato de rango
        // Verificar que hay contenido relacionado con fechas
        // Buscar contenido que incluya meses o fechas
        const body = await page.textContent('body');
        // Verificar que hay alguna referencia a fechas (FEB, MAR, etc)
        expect(body).toMatch(/FEB|MAR|ABR|ENE|JAN|FEV/i);
    });

    test('debe tener estadísticas del equipo', async ({ page }) => {
        await loadDemoData(page);

        // La sección de estadísticas debe estar visible
        await expect(page.getByText('ESTADÍSTICAS')).toBeVisible();
        await expect(page.getByText('VALORACIÓN')).toBeVisible();
    });

    test('debe tener información de jugadores', async ({ page }) => {
        await loadDemoData(page);

        // Debe mostrar titulares y suplentes
        await expect(page.getByText('Titulares')).toBeVisible();
        await expect(page.getByText('Suplentes', { exact: true })).toBeVisible();

        // Debe haber jugadores con posiciones
        const content = await page.textContent('body');
        expect(content).toMatch(/DEL|MED|CEN|LAT|ARQ|VOL/);
    });
});
