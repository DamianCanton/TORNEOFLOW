# Documentación de Refactorización y Componentización

## Resumen
Se ha realizado una refactorización completa de la capa de presentación de la aplicación, migrando de una estructura de páginas monolíticas a una arquitectura basada en componentes reutilizables y modulares.

## Nueva Estructura de Directorios

La carpeta `src/components` se ha reorganizado para separar responsabilidades de manera clara:

### 1. `src/components/ui/` (UI Kit)
Contiene los "ladrillos" fundamentales de la interfaz. Estos componentes son agnósticos a la lógica de negocio y se utilizan para mantener la consistencia visual.

*   **`Layout.jsx`**: Contenedor principal de la aplicación. Maneja el fondo animado, los gradientes y el centrado del contenido.
*   **`GlassCard.jsx`**: Contenedor con efecto "glassmorphism" (vidrio esmerilado) estándar para tarjetas y formularios.
*   **`Button.jsx`**: Botón unificado con variantes (`primary`, `secondary`, `ghost`, `danger`) y soporte para iconos.
*   **`Input.jsx`**: Input de texto estilizado con soporte para etiquetas y mensajes de error.
*   **`Typography.jsx`**: Componentes de texto como `GradientTitle` para títulos impactantes.

### 2. `src/components/shared/`
Componentes que contienen lógica de negocio o UI compleja reutilizada en múltiples vistas.

*   **`SwapPlayerModal.jsx`**: Modal para intercambiar jugadores entre equipos o entre el campo y la banca. Extraído de `TeamsTable` y `TournamentRoom` para eliminar código duplicado.

### 3. `src/components/features/`
Componentes específicos que pertenecen a una funcionalidad o página concreta, pero que son demasiado complejos para vivir dentro del archivo de la página.

*   **`features/home/`**:
    *   `FileImporter.jsx`: Maneja la lógica de carga, validación y previsualización del archivo Excel de jugadores.
*   **`features/teams-table/`**:
    *   `DraggableRow.jsx`: Fila de jugador con capacidades de "arrastrar y soltar".
    *   `DroppableTeamCard.jsx`: Contenedor del equipo que acepta jugadores arrastrados.
*   **`features/tournament-room/`**:
    *   `DraggablePlayer.jsx`: Representación visual del jugador (camiseta) en la cancha.
    *   `BenchPlayer.jsx`: Tarjeta de jugador en la banca lateral.
    *   `DropZones.jsx`: Áreas definidas donde se pueden soltar los jugadores.

## Páginas Refactorizadas

Las páginas principales en `src/pages/` ahora actúan como **controladores**. Su responsabilidad es gestionar el estado (usando Zustand o useState) y orquestar los componentes, en lugar de definir toda la UI.

*   **`Home.jsx`**: Simplificado para usar el `Layout`, `GlassCard` y el `FileImporter`. Se mejoró el espaciado y la alineación.
*   **`TeamsTable.jsx`**: Reducido significativamente al extraer la lógica de renderizado de tablas y filas.
*   **`TournamentRoom.jsx`**: Ahora utiliza los componentes de `features/tournament-room` para dibujar la cancha y los jugadores, compartiendo la lógica del modal de intercambio.

## Beneficios
1.  **Mantenibilidad**: Es mucho más fácil localizar y corregir errores en componentes pequeños y aislados.
2.  **Consistencia Visual**: Al usar el UI Kit, cualquier cambio en el diseño (ej. cambiar el radio de los botones) se propaga automáticamente a toda la app.
3.  **Reducción de Duplicidad**: Lógica crítica como el intercambio de jugadores ahora vive en un solo lugar.
4.  **Legibilidad**: Los archivos de las páginas son mucho más cortos y fáciles de leer.
