# TORNEOFLOW - Documentación Técnica de Lógica de Negocio

## Índice
1. [Modelo de Datos](#1-modelo-de-datos)
2. [Algoritmo de Distribución de Equipos](#2-algoritmo-de-distribución-de-equipos)
3. [Sistema de Puntuación](#3-sistema-de-puntuación)
4. [Gestión de Formaciones](#4-gestión-de-formaciones)
5. [Flujo de Estados](#5-flujo-de-estados)
6. [Análisis de Casos Límite](#6-análisis-de-casos-límite)

---

## 1. Modelo de Datos

### 1.1 Entidad: Player

```typescript
interface Player {
    id: string;              // UUID único
    name: string;            // Nombre del jugador
    position: Position;      // Posición natural
    quality: number;         // Calidad [1-10]
    responsibility: number;  // Responsabilidad [1-5]
    age: number;             // Edad
    injured?: boolean;       // Estado de lesión

    // Propiedades asignadas en formación:
    role?: Position;         // Rol asignado en el equipo
    top?: string;            // Coordenada Y en campo (CSS %)
    left?: string;           // Coordenada X en campo (CSS %)
    isOutOfPosition?: boolean; // Fuera de posición natural
    vacante?: boolean;       // Slot vacío
}

type Position = 'ARQ' | 'CEN' | 'LAT' | 'MED' | 'VOL' | 'DEL' | 'POLI' | 'DT';
```

### 1.2 Entidad: Team

```typescript
interface Team {
    id: number;
    name: string;
    players: Player[];       // Todos los jugadores asignados
    starters: Player[];      // 11 titulares + 1 DT (12 elementos)
    bench: Player[];         // Suplentes
    stats: TeamStats;
}

interface TeamStats {
    score: string;           // Puntuación total (decimal)
    avgAge: string;          // Edad promedio (decimal)
}
```

### 1.3 Diagrama de Relaciones

```
┌─────────────────────────────────────────────────────────────┐
│                          TEAM                                │
├─────────────────────────────────────────────────────────────┤
│  id: 1                                                       │
│  name: "Equipo 1"                                           │
│                                                              │
│  ┌─────────────────────────────────────────────────────┐    │
│  │ players[] (referencia completa)                      │    │
│  │ ├── Player 1                                         │    │
│  │ ├── Player 2                                         │    │
│  │ └── ... (N jugadores)                                │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                              │
│  ┌─────────────────────┐    ┌─────────────────────┐         │
│  │ starters[12]        │    │ bench[]             │         │
│  │ ├── ARQ (1)         │    │ ├── Suplente 1      │         │
│  │ ├── DEF (4)         │    │ ├── Suplente 2      │         │
│  │ ├── MED (4)         │    │ └── ...             │         │
│  │ ├── DEL (2)         │    └─────────────────────┘         │
│  │ └── DT  (1)         │                                    │
│  └─────────────────────┘                                    │
│                                                              │
│  stats: { score: "85.5", avgAge: "28.3" }                   │
└─────────────────────────────────────────────────────────────┘
```

---

## 2. Algoritmo de Distribución de Equipos

### 2.1 Parámetros de Configuración

| Constante | Valor | Descripción |
|-----------|-------|-------------|
| `MIN_PER_TEAM` | 11 | Mínimo jugadores por equipo (solo titulares) |
| `IDEAL_PER_TEAM` | 15 | Ideal: 11 titulares + 4 suplentes |
| `MAX_PER_TEAM` | 18 | Máximo: 11 titulares + 7 suplentes |
| `UMBRAL_TORNEO` | 22 | Mínimo jugadores para generar torneo |

### 2.2 Fórmula de Cálculo de Equipos

Dado `N` jugadores (excluyendo DTs):

```
minTeams = ⌈N / MAX_PER_TEAM⌉ = ⌈N / 18⌉
maxTeams = ⌊N / MIN_PER_TEAM⌋ = ⌊N / 11⌋

TEAMS_COUNT = argmin(|N/t - IDEAL_PER_TEAM|) para t ∈ [minTeams, maxTeams]
            = argmin(|N/t - 15|)
```

**Función de optimización:**

```javascript
f(t) = |N/t - 15|  // Minimizar distancia al ideal

// Buscar t* tal que f(t*) sea mínimo
for (t = minTeams; t <= maxTeams; t++) {
    if (f(t) < f(t*)) then t* = t
}
```

### 2.3 Tabla de Distribución por Cantidad de Jugadores

| N (Jugadores) | minTeams | maxTeams | t* (Óptimo) | N/t* | Titulares | Banco |
|---------------|----------|----------|-------------|------|-----------|-------|
| 22 | 2 | 2 | 2 | 11.0 | 11 | 0 |
| 25 | 2 | 2 | 2 | 12.5 | 11 | 1-2 |
| 26 | 2 | 2 | 2 | 13.0 | 11 | 2 |
| 30 | 2 | 2 | 2 | 15.0 | 11 | 4 |
| 33 | 2 | 3 | 2 | 16.5 | 11 | 5-6 |
| 36 | 2 | 3 | 2 | 18.0 | 11 | 7 |
| 37 | 3 | 3 | 3 | 12.3 | 11 | 1 |
| 45 | 3 | 4 | 3 | 15.0 | 11 | 4 |
| 50 | 3 | 4 | 3 | 16.7 | 11 | 5-6 |
| 55 | 4 | 5 | 4 | 13.75 | 11 | 2-3 |
| 60 | 4 | 5 | 4 | 15.0 | 11 | 4 |
| 75 | 5 | 6 | 5 | 15.0 | 11 | 4 |
| 100 | 6 | 9 | 7 | 14.3 | 11 | 3 |
| 150 | 9 | 13 | 10 | 15.0 | 11 | 4 |
| 175 | 10 | 15 | 12 | 14.6 | 11 | 3-4 |

### 2.4 Visualización de la Función de Optimización

```
f(t) = |N/t - 15|

Para N = 45:
┌────────────────────────────────────────┐
│ t=3: |45/3 - 15| = |15 - 15| = 0   ← ÓPTIMO
│ t=4: |45/4 - 15| = |11.25 - 15| = 3.75
└────────────────────────────────────────┘

Para N = 50:
┌────────────────────────────────────────┐
│ t=3: |50/3 - 15| = |16.67 - 15| = 1.67 ← ÓPTIMO
│ t=4: |50/4 - 15| = |12.5 - 15| = 2.5
└────────────────────────────────────────┘

Para N = 37:
┌────────────────────────────────────────┐
│ t=2: |37/2 - 15| = |18.5 - 15| = 3.5   (excede MAX=18)
│ t=3: |37/3 - 15| = |12.33 - 15| = 2.67 ← ÓPTIMO
└────────────────────────────────────────┘
```

---

## 3. Sistema de Puntuación

### 3.1 Fórmula de Score Individual

```
Score(p) = Quality(p) × 0.7 + Responsibility(p) × 0.3
```

**Ponderación:**
- **Calidad (70%):** Habilidad técnica del jugador
- **Responsabilidad (30%):** Compromiso y liderazgo

### 3.2 Tabla de Scores Posibles

| Quality | Responsibility | Score | Interpretación |
|---------|----------------|-------|----------------|
| 1 | 1 | 1.0 | Muy bajo |
| 5 | 3 | 4.4 | Promedio |
| 7 | 4 | 6.1 | Bueno |
| 10 | 5 | 8.5 | Excelente |
| 10 | 10 | 10.0 | Máximo teórico* |

*Nota: Responsibility tiene rango [1-5], por lo que el máximo real es 8.5

### 3.3 Score de Equipo

```
TeamScore = Σ Score(p) para todo p ∈ team.players
```

### 3.4 Distribución Serpentina para Balance

El algoritmo distribuye jugadores en orden serpentina para balancear equipos:

```
Orden de asignación (4 equipos, 8 jugadores ordenados por score):

Jugador:  J1   J2   J3   J4   J5   J6   J7   J8
Score:    8.5  8.2  7.8  7.5  7.2  6.9  6.5  6.2
          ↓    ↓    ↓    ↓    ↓    ↓    ↓    ↓
Equipo:   E1   E2   E3   E4   E4   E3   E2   E1
          →    →    →    →    ←    ←    ←    ←

Resultado:
E1: J1(8.5) + J8(6.2) = 14.7
E2: J2(8.2) + J7(6.5) = 14.7
E3: J3(7.8) + J6(6.9) = 14.7
E4: J4(7.5) + J5(7.2) = 14.7
```

**Propiedad matemática:**
```
∀ Ei, Ej : |Score(Ei) - Score(Ej)| → mínimo
```

---

## 4. Gestión de Formaciones

### 4.1 Formación Base (4-4-2)

```
                    ┌─────────────────────────────────────┐
                    │           ÁREA RIVAL                │
                    ├─────────────────────────────────────┤
     15%            │      DEL(35%)    DEL(65%)          │
                    │         ●           ●               │
                    │                                     │
     45%            │  VOL(15%)              VOL(85%)    │
                    │     ●                    ●          │
     50%            │        MED(38%)  MED(62%)          │
                    │           ●        ●                │
                    │                                     │
     70%            │  LAT(15%)              LAT(85%)    │
                    │     ●                    ●          │
     75%            │        CEN(38%)  CEN(62%)          │
                    │           ●        ●                │
                    │                                     │
     88%            │            ARQ(50%)                 │
                    │               ●                     │
                    ├─────────────────────────────────────┤
     85%            │  DT(8%)                             │
                    │    ■                                │
                    └─────────────────────────────────────┘
                         15%  35%  50%  65%  85%
```

### 4.2 Matriz de Posiciones

| Índice | Rol | Top | Left | Prioridad de Asignación |
|--------|-----|-----|------|-------------------------|
| 0 | ARQ | 88% | 50% | 1. ARQ → 2. POLI → 3. Cualquiera |
| 1 | LAT | 70% | 15% | 1. LAT → 2. POLI → 3. No-ARQ |
| 2 | CEN | 75% | 38% | 1. CEN → 2. POLI → 3. No-ARQ |
| 3 | CEN | 75% | 62% | 1. CEN → 2. POLI → 3. No-ARQ |
| 4 | LAT | 70% | 85% | 1. LAT → 2. POLI → 3. No-ARQ |
| 5 | VOL | 45% | 15% | 1. VOL → 2. POLI → 3. No-ARQ |
| 6 | MED | 50% | 38% | 1. MED → 2. POLI → 3. No-ARQ |
| 7 | MED | 50% | 62% | 1. MED → 2. POLI → 3. No-ARQ |
| 8 | VOL | 45% | 85% | 1. VOL → 2. POLI → 3. No-ARQ |
| 9 | DEL | 15% | 35% | 1. DEL → 2. POLI → 3. No-ARQ |
| 10 | DEL | 15% | 65% | 1. DEL → 2. POLI → 3. No-ARQ |
| 11 | DT | 85% | 8% | 1. DT → 2. Vacante |

### 4.3 Algoritmo de Asignación de Posiciones

```
Para cada slot S en FORMACIÓN:
    1. Buscar jugador P donde:
       - P.role == S.role AND
       - P.injured == false AND
       - P ∉ asignados

    2. Si no encontrado, buscar:
       - P.role == 'POLI' AND
       - P.injured == false AND
       - P ∉ asignados

    3. Si no encontrado, buscar:
       - P.role != 'ARQ' AND  (evitar ARQ fuera de arco)
       - P.injured == false AND
       - P ∉ asignados

    4. Si no encontrado:
       - Marcar slot como VACANTE
       - S = { name: 'FALTA UNO', vacante: true }
```

### 4.4 Indicadores Visuales

| Estado | Color | Descripción |
|--------|-------|-------------|
| Normal | `bg-slate-900` | Jugador en posición correcta |
| ARQ | `bg-yellow-500` | Arquero (siempre destacado) |
| DT | `bg-indigo-950` | Director técnico |
| Fuera de posición | `bg-orange-600` | Jugador en rol diferente a su posición |
| Vacante | `bg-red-500/20` + borde punteado | Slot sin jugador asignado |

---

## 5. Flujo de Estados

### 5.1 Diagrama de Estados de la Aplicación

```
                         ┌──────────────┐
                         │     HOME     │
                         │  (entrada)   │
                         └──────┬───────┘
                                │
                         parsePlayersⱽ
                                │
                    ┌───────────┴───────────┐
                    │                       │
              N < 22                    N ≥ 22
                    │                       │
                    ▼                       ▼
           ┌──────────────┐       ┌──────────────────┐
           │   EDITOR     │       │ generateTournament│
           │ (edición     │       │                  │
           │  manual)     │       └────────┬─────────┘
           └──────────────┘                │
                                           ▼
                                  ┌──────────────────┐
                                  │  TOURNAMENT_ROOM │
                                  │  (vista campo)   │
                                  └────────┬─────────┘
                                           │
                                    navigate('teamsTable')
                                           │
                                           ▼
                                  ┌──────────────────┐
                                  │   TEAMS_TABLE    │
                                  │  (vista tabla)   │
                                  └──────────────────┘
```

### 5.2 Flujo de Datos en Edición

```
┌─────────────────────────────────────────────────────────────────┐
│                    FLUJO DE EDICIÓN (Drag & Drop)               │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  1. Usuario arrastra jugador                                    │
│         │                                                        │
│         ▼                                                        │
│  2. Deep Clone del estado                                       │
│     newTeams = JSON.parse(JSON.stringify(tournamentTeams))      │
│         │                                                        │
│         ▼                                                        │
│  3. Modificar copia                                             │
│     - Actualizar posiciones                                     │
│     - Limpiar props de campo (top, left, role)                  │
│     - Marcar vacantes si corresponde                            │
│         │                                                        │
│         ▼                                                        │
│  4. Recalcular estadísticas                                     │
│     recalculateTeamStats(team)                                  │
│         │                                                        │
│         ▼                                                        │
│  5. Actualizar estado global                                    │
│     setTournamentTeams(newTeams)                                │
│         │                                                        │
│         ▼                                                        │
│  6. React re-renderiza UI                                       │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 6. Análisis de Casos Límite

### 6.1 Caso: N = 22 (Mínimo para Torneo)

```
Input:  22 jugadores
Cálculo:
  minTeams = ⌈22/18⌉ = 2
  maxTeams = ⌊22/11⌋ = 2

Output: 2 equipos × 11 jugadores
        0 suplentes por equipo

Estado:
  ┌─────────────┐  ┌─────────────┐
  │  Equipo 1   │  │  Equipo 2   │
  │  11 titular │  │  11 titular │
  │   0 banco   │  │   0 banco   │
  └─────────────┘  └─────────────┘
```

### 6.2 Caso: N = 21 (Bajo Umbral)

```
Input:  21 jugadores
Decisión: 21 < 22 → NO genera torneo
Output: Redirige a EDITOR (edición manual)
```

### 6.3 Caso: N = 36 (Límite Superior de 2 Equipos)

```
Input:  36 jugadores
Cálculo:
  minTeams = ⌈36/18⌉ = 2
  maxTeams = ⌊36/11⌋ = 3

  f(2) = |36/2 - 15| = |18 - 15| = 3
  f(3) = |36/3 - 15| = |12 - 15| = 3

  Empate → Selecciona t=2 (primero encontrado)

Output: 2 equipos × 18 jugadores
        7 suplentes por equipo (máximo)
```

### 6.4 Caso: N = 37 (Transición a 3 Equipos)

```
Input:  37 jugadores
Cálculo:
  minTeams = ⌈37/18⌉ = 3  (2 equipos excederían MAX)
  maxTeams = ⌊37/11⌋ = 3

  Solo opción: t = 3

Output: 3 equipos × ~12.3 jugadores
        Distribución: 13 + 12 + 12
        1-2 suplentes por equipo
```

### 6.5 Tabla de Transiciones

| N | Equipos | Evento |
|---|---------|--------|
| 21→22 | 0→2 | Umbral mínimo para torneo |
| 36→37 | 2→3 | MAX_PER_TEAM alcanzado |
| 54→55 | 3→4 | Siguiente transición |
| 72→73 | 4→5 | ... |

**Fórmula de transición:**
```
N_transición(k) = MAX_PER_TEAM × k + 1 = 18k + 1

k=2: N=37 (2→3 equipos)
k=3: N=55 (3→4 equipos)
k=4: N=73 (4→5 equipos)
```

---

## Apéndice A: Constantes del Sistema

```javascript
// Configuración de equipos
const MIN_PER_TEAM = 11;
const IDEAL_PER_TEAM = 15;
const MAX_PER_TEAM = 18;
const UMBRAL_TORNEO = 22;

// Ponderación de score
const WEIGHT_QUALITY = 0.7;
const WEIGHT_RESPONSIBILITY = 0.3;

// Formación (4-4-2)
const STARTERS_COUNT = 11;
const FORMATION_SLOTS = 12; // 11 + DT
```

## Apéndice B: Orden de Distribución por Posición

```javascript
const DISTRIBUTION_ORDER = [
    'ARQ',   // 1. Arqueros (críticos, pocos disponibles)
    'CEN',   // 2. Centrales (columna vertebral)
    'DEL',   // 3. Delanteros (definidores)
    'MED',   // 4. Mediocampistas (volumen)
    'VOL',   // 5. Volantes (cobertura)
    'LAT',   // 6. Laterales (versatilidad)
    'POLI'   // 7. Polivalentes (comodines, al final)
];
```

---

*Documento generado para TORNEOFLOW v1.0*
*Última actualización: 2026-02-04*
