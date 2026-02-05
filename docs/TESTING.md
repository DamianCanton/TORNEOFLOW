# Testing de TORNEOFLOW

Suite de tests E2E con **Playwright** para verificar la funcionalidad de la aplicación.

**Resultado: 39 tests pasando ✅**

---

## Resumen de Tests

### `home.spec.ts` - Página Home (7 tests)

| Test | Qué probó |
|------|-----------|
| `debe cargar correctamente la página principal` | Verifica que aparece "TORNEO FLOW", el subtítulo y el formulario |
| `debe mostrar error si no se ingresa nombre de torneo` | Alert cuando se hace clic en "Comenzar Torneo" sin nombre |
| `debe mostrar error si no se ingresan fechas` | Alert cuando faltan las fechas de inicio/fin |
| `debe mostrar error si no se ingresan jugadores` | Alert cuando el textarea de jugadores está vacío |
| `debe cargar datos demo y navegar a TournamentRoom automáticamente` | Click en "Cargar Datos Demo" → navega a vista de torneo |
| `debe tener botón de descargar modelo visible` | Botón "Descargar Modelo" está visible |
| `debe tener botón de importar excel visible` | Botón "Importar Excel" está visible |

---

### `tournament-flow.spec.ts` - Flujo de Torneo (9 tests)

| Test | Qué probó |
|------|-----------|
| `debe navegar a TournamentRoom después de cargar datos demo` | Con >22 jugadores navega automáticamente a TournamentRoom |
| `debe mostrar equipos generados en TournamentRoom` | Aparece "EQUIPO" y la sección de "ESTADÍSTICAS" |
| `debe mostrar navegación entre equipos` | Hay más de 5 botones disponibles para interactuar |
| `debe mostrar botones de acción principales` | Botones "INICIO", "TABLA", "PDF" visibles |
| `debe mostrar información de titulares y suplentes` | Secciones "Titulares" y "Suplentes" visibles |
| `debe poder navegar a inicio` | Click en "INICIO" → vuelve a la página Home |
| `debe poder navegar a vista de tabla` | Click en "TABLA" → cambia a vista TeamsTable |
| `debe mostrar jugadores en formación` | Contenido incluye posiciones (DEL, MED, CEN, LAT, ARQ, VOL) |

---

### `drag-drop.spec.ts` - Drag & Drop (7 tests)

| Test | Qué probó |
|------|-----------|
| `debe cargar TournamentRoom con formación de jugadores` | Jugadores visibles con posiciones en la cancha |
| `debe tener botón de modificar equipo` | Botón "MODIFICAR EQUIPO" visible |
| `debe poder activar modo de edición` | Click en "MODIFICAR EQUIPO" activa el modo edición |
| `debe poder simular movimiento de mouse en la cancha` | Eventos mousedown → mousemove → mouseup funcionan |
| `debe mantener estado después de interacciones de mouse` | La UI no se rompe después de clicks y movimientos |
| `debe mostrar suplentes dispersos` | Sección "SUPLENTES DISPERSOS" visible |
| `debe poder hacer drag & drop con PointerSensor` | Simula drag completo después de activar modo edición |

---

### `navigation.spec.ts` - Navegación (11 tests)

| Test | Qué probó |
|------|-----------|
| `debe cargar la página principal inicialmente` | "TORNEO FLOW" aparece al cargar |
| `debe navegar a TournamentRoom con datos demo` | Datos demo → TournamentRoom con "EQUIPO" visible |
| `debe tener navegación principal visible` | Botones INICIO, TABLA, PDF en el header |
| `debe poder volver a inicio desde TournamentRoom` | INICIO → Home con "TORNEO FLOW" visible |
| `debe poder ir a vista de tabla` | TABLA → cambia de vista sin errores |
| `debe mantener nombre del torneo en navegación` | "Torneo Demo" sigue visible después de navegar |
| `debe tener flechas de navegación entre equipos` | Más de 5 botones para navegar entre equipos |
| `debe mostrar contador de equipo actual` | Texto "EQUIPO 1 /" visible |
| `debe adaptarse a viewport móvil` | 375x667 → formulario visible y funcional |
| `debe adaptarse a viewport tablet` | 768x1024 → página carga correctamente |
| `debe adaptarse a viewport desktop` | 1920x1080 → página carga correctamente |

---

### `pdf-export.spec.ts` - Exportación PDF (6 tests)

| Test | Qué probó |
|------|-----------|
| `debe tener botón PDF visible en TournamentRoom` | Botón "PDF" visible |
| `debe tener el nombre del torneo para el PDF` | "Torneo Demo" visible para incluir en el PDF |
| `debe poder hacer click en botón PDF` | Click en PDF no causa errores |
| `debe tener fechas del torneo visibles` | Contenido incluye meses (FEB, MAR, etc.) |
| `debe tener estadísticas del equipo` | "ESTADÍSTICAS" y "VALORACIÓN" visibles |
| `debe tener información de jugadores` | Titulares, Suplentes, y posiciones (DEL, MED, etc.) |

---

## Comandos

```bash
npm test          # Ejecutar tests
npm run test:ui   # UI interactiva
npm run test:debug # Modo debug
```
