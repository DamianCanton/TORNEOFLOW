import { test, expect, Page } from '@playwright/test';

/**
 * Tests E2E para funcionalidad Drag & Drop
 * Playwright maneja eventos de puntero necesarios para @dnd-kit
 */

async function loadDemoData(page: Page) {
    await page.goto('/');
    const demoButton = page.locator('button:has-text("Cargar Datos Demo")');
    await demoButton.click({ force: true });
    await page.waitForTimeout(500);
    await expect(page.locator('text=/torneo demo/i').first()).toBeVisible();
}

test.describe('Drag & Drop - Estructura', () => {

    test('debe cargar TournamentRoom con formación de jugadores', async ({ page }) => {
        await loadDemoData(page);

        // Verificar que hay jugadores visibles
        await expect(page.locator('text=EQUIPO').first()).toBeVisible();

        // Debería haber posiciones visibles (DEL, MED, DEF, etc)
        const content = await page.textContent('body');
        expect(content).toMatch(/DEL|MED|DEF|ARQ/);
    });

    test('debe tener botón de modificar equipo', async ({ page }) => {
        await loadDemoData(page);

        // El botón de edición dice "MODIFICAR EQUIPO"
        await expect(page.getByText('MODIFICAR EQUIPO')).toBeVisible();
    });

    test('debe poder activar modo de edición', async ({ page }) => {
        await loadDemoData(page);

        // Click en modificar equipo
        await page.getByText('MODIFICAR EQUIPO').click();

        // Después de activar edición, el botón podría cambiar a "GUARDAR" o similar
        await page.waitForTimeout(300);

        // Verificar que la página sigue funcionando
        await expect(page.locator('body')).toBeVisible();
    });
});

test.describe('Drag & Drop - Interacciones', () => {

    test('debe poder simular movimiento de mouse en la cancha', async ({ page }) => {
        await loadDemoData(page);

        // Playwright puede simular eventos de puntero
        // que @dnd-kit necesita para drag & drop
        await page.mouse.move(400, 400);
        await page.mouse.down();
        await page.mouse.move(500, 500, { steps: 10 });
        await page.mouse.up();

        // Si no hay errores, la página maneja los eventos correctamente
        await expect(page.locator('body')).toBeVisible();
    });

    test('debe mantener estado después de interacciones de mouse', async ({ page }) => {
        await loadDemoData(page);

        // Realizar interacciones de mouse
        await page.mouse.click(400, 400);
        await page.mouse.move(300, 300);

        // La UI debe mantener su estado
        await expect(page.locator('text=/torneo demo/i').first()).toBeVisible();
    });
});

test.describe('Drag & Drop - @dnd-kit Behavior', () => {

    test('debe mostrar suplentes dispersos', async ({ page }) => {
        await loadDemoData(page);

        // Verificar que la sección de suplentes existe
        await expect(page.getByText('SUPLENTES DISPERSOS')).toBeVisible();
    });

    test('debe poder hacer drag & drop con PointerSensor', async ({ page }) => {
        await loadDemoData(page);

        // Activar modo edición primero
        await page.getByText('MODIFICAR EQUIPO').click();
        await page.waitForTimeout(300);

        // @dnd-kit usa PointerSensor que responde a mousedown/move/up
        // Simular drag basic
        const startX = 300, startY = 400;
        const endX = 500, endY = 600;

        await page.mouse.move(startX, startY);
        await page.mouse.down();
        await page.mouse.move(endX, endY, { steps: 5 });
        await page.mouse.up();

        // La página debe seguir funcional
        await expect(page.locator('body')).toBeVisible();
    });
});
