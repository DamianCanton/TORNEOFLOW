# TORNEOFLOW ⚽

Sistema de gestión de torneos de fútbol con generación automática de equipos balanceados, visualización en cancha y exportación a PDF.

---

## 🎨 Guía de Estilo y Diseño

Esta sección documenta el sistema de diseño para mantener consistencia visual en futuras modificaciones.

### Filosofía de Diseño

- **Dark Glassmorphism**: Fondos oscuros con elementos translúcidos y blur
- **Minimalismo Elegante**: Interfaces limpias sin elementos innecesarios
- **Microinteracciones**: Transiciones suaves y feedback visual en hover/click
- **Diseño Premium**: Gradientes sutiles, sombras profundas, tipografía bold

---

## 🎨 Paleta de Colores

### Colores Base (Slate)
```css
--bg-primary: slate-950      /* #020617 - Fondo principal */
--bg-secondary: slate-900    /* #0f172a - Cards, contenedores */
--bg-tertiary: #0B0F15       /* Cancha/pitch */
--text-primary: white
--text-secondary: slate-300
--text-muted: slate-400
--text-subtle: slate-500
```

### Colores de Acción
```css
--accent-primary: emerald-500    /* #10b981 - Acción principal, éxito */
--accent-secondary: emerald-400  /* #34d399 - Hover states */
--danger: rose-500/red-500       /* Eliminar, cancelar */
--warning: amber-500             /* Capitán, alertas */
--info: indigo-500               /* DT, información especial */
```

### Colores por Posición de Jugador
```css
--arq: yellow-500     /* Arquero */
--def: blue-400       /* Defensor */
--med: emerald-400    /* Mediocampista */
--del: rose-400       /* Delantero */
--dt: indigo-500      /* Director Técnico */
--captain: amber-400  /* Capitán */
--vacante: red-400    /* Posición vacante */
--out-of-position: orange-500  /* Jugador fuera de posición */
```

---

## 🧱 Componentes UI

### Cards / Contenedores
```jsx
// Glass Card Standard
className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 
           hover:bg-white/10 hover:border-white/20 transition-all duration-300"

// Glass Card con Glow
className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 
           shadow-xl overflow-hidden"
```

### Botones
```jsx
// Botón Primario (Activo/Guardar)
className="bg-emerald-500 hover:bg-emerald-400 text-slate-900 
           rounded-xl px-4 py-2 font-bold uppercase tracking-wider
           shadow-[0_0_20px_rgba(16,185,129,0.4)]"

// Botón Secundario
className="bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white 
           border border-white/5 hover:border-white/20 rounded-xl"

// Botón Danger
className="bg-rose-500/10 text-rose-400 hover:bg-rose-500 hover:text-white 
           border border-rose-500/20 hover:border-rose-500 rounded-xl"
```

### Badges / Pills
```jsx
// Badge de Posición
className="inline-flex items-center justify-center h-6 px-2 
           rounded-md text-[10px] font-bold tracking-wider
           bg-slate-500/20 text-slate-300"

// Badge de Capitán
className="bg-amber-500/20 text-amber-300"

// Badge Contador
className="bg-black/30 border border-white/5 px-2 py-0.5 rounded"
```

### Inputs
```jsx
// Input en modo edición
className="bg-white/10 border border-white/20 rounded-lg px-2 py-1
           text-white font-black uppercase tracking-tight
           focus:outline-none focus:border-emerald-500/50 
           focus:ring-1 focus:ring-emerald-500/30"
```

---

## 🎭 Efectos y Transiciones

### Transiciones Standard
```css
transition-all duration-300     /* Default para la mayoría */
transition-colors              /* Solo cambios de color */
transition-transform           /* Solo transformaciones */
```

### Hover Effects
```jsx
// Escala con glow
className="hover:scale-110 hover:drop-shadow-[0_0_15px_rgba(255,255,255,0.15)]"

// Card hover
className="hover:bg-white/10 hover:border-white/20"

// Button hover con glow esmeralda
className="hover:shadow-[0_0_20px_rgba(16,185,129,0.4)]"
```

### Animaciones
```jsx
// Pulse para indicadores activos
className="animate-pulse"

// Transición de navegación
className="group-hover:-translate-x-1 transition-transform"  // Izquierda
className="group-hover:translate-x-1 transition-transform"   // Derecha
```

---

## 📐 Layout Patterns

### Fondos con Gradiente
```jsx
// Fondo principal de la app
className="bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] 
           from-slate-900 via-[#0a0a0a] to-black"

// Glow decorativo
className="absolute top-0 left-1/2 -translate-x-1/2 w-[80%] h-32 
           bg-emerald-500/10 blur-[100px] pointer-events-none"
```

### Headers
```jsx
// Header con glassmorphism
className="px-6 py-4 border-b border-white/5 bg-slate-950/50 
           backdrop-blur-xl z-30 shadow-lg"
```

### Scrollbars
```css
/* En index.css */
.custom-scrollbar::-webkit-scrollbar {
    width: 6px;
    height: 6px;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.1);
    border-radius: 3px;
}
.custom-scrollbar::-webkit-scrollbar-thumb:hover {
    background: rgba(255, 255, 255, 0.2);
}
```

---

## 🏗️ Estructura de Componentes

### Páginas Principales
```
src/pages/
├── Home.jsx           # Pantalla inicial, configuración de torneo
├── TournamentRoom.jsx # Vista de cancha con jugadores arrastrables
└── TeamsTable.jsx     # Vista de tabla con todos los equipos
```

### Utilidades
```
src/utils/
├── tournamentMaker.js # Lógica de generación de equipos
└── pdfGenerator.js    # Exportación a PDF
```

### Store (Zustand)
```
src/store/
└── index.js           # Estado global: jugadores, equipos, navegación
```

---

## 🎯 Patrones de Código

### Drag & Drop (dnd-kit)
```jsx
import { DndContext, useDraggable, useDroppable } from '@dnd-kit/core';

// Componente Draggable
function DraggableItem({ id, data, disabled }) {
    const { attributes, listeners, setNodeRef, transform } = useDraggable({
        id,
        data,
        disabled
    });
    // ...
}

// Componente Droppable
function DroppableZone({ id }) {
    const { setNodeRef, isOver } = useDroppable({ id });
    // Resaltar cuando está sobre el área
    className={isOver ? 'bg-emerald-500/10 border-emerald-500/50' : ''}
}
```

### Actualización de Estado Inmutable
```jsx
// Siempre clonar antes de modificar
const newTeams = JSON.parse(JSON.stringify(tournamentTeams));
// Modificar el clon
newTeams[index].property = value;
// Actualizar estado
setTournamentTeams(newTeams);
```

### Manejo de Capitán
```jsx
// Solo un capitán por equipo
team.starters.forEach(p => p.isCaptain = false);
team.bench.forEach(p => p.isCaptain = false);
playerList[idx].isCaptain = true;
```

---

## 📄 Generación de PDF

### Configuración
```javascript
const doc = new jsPDF({
    orientation: 'landscape',  // Horizontal
    unit: 'mm',
    format: 'a4'
});
```

### División de Equipos
- Si hay **≤ 8 equipos**: Una sola fila de tabla
- Si hay **> 8 equipos**: Dos filas de tablas apiladas

### Formato de Celda
```javascript
`${rowIdx + 1} ${player.name.toUpperCase()}${player.isCaptain ? ' (C)' : ''}`
```

---

## 🚀 Comandos

```bash
# Desarrollo
npm run dev

# Build
npm run build

# Preview
npm run preview
```

---

## 📦 Dependencias Principales

- **React 18** - Framework UI
- **Vite** - Build tool
- **TailwindCSS** - Estilos utility-first
- **Zustand** - State management
- **@dnd-kit** - Drag and drop
- **jsPDF + jspdf-autotable** - Generación de PDF
- **Lucide React** - Iconos

---

## 🔧 Convenciones de Código

### Nombres de Clases
- Usar Tailwind utility classes
- Ordenar: layout → spacing → sizing → colors → effects
- Usar template literals para clases condicionales

### Iconos (Lucide)
```jsx
import { Crown, Shirt, ArrowRightLeft, FileText } from 'lucide-react';
// Tamaños comunes: 10, 12, 14, 16, 18, 24
<Icon size={16} className="text-emerald-500" strokeWidth={2} />
```

### Tipografía
```css
font-black      /* Títulos principales */
font-bold       /* Subtítulos y labels */
font-semibold   /* Texto destacado */
font-medium     /* Texto regular */

text-xs         /* 12px - Badges, labels pequeños */
text-sm         /* 14px - Texto general */
text-base       /* 16px - Texto principal */
text-xl/2xl     /* Títulos de sección */
text-4xl/6xl    /* Títulos hero */

uppercase tracking-tight/wider  /* Headers y labels */
```

---

## 💡 Tips para Futuras Modificaciones

1. **Mantener consistencia visual**: Usar siempre los colores y componentes definidos
2. **Glassmorphism**: `bg-white/5` + `backdrop-blur-xl` + `border border-white/10`
3. **Estados hover**: Siempre agregar feedback visual en elementos interactivos
4. **Modo edición**: Indicar claramente cuándo está activo (botones resaltados, inputs visibles)
5. **Responsive**: Usar clases `sm:`, `md:`, `lg:` para adaptar layouts
6. **Transiciones**: `transition-all duration-300` como default

---

*Última actualización: Febrero 2026*
