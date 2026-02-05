<div align="center">

# ⚽ TORNEOFLOW

### Sistema de Gestión de Torneos de Fútbol

*Genera equipos balanceados automáticamente, visualiza formaciones en cancha y exporta a PDF*

[![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react&logoColor=white)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-5-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![TailwindCSS](https://img.shields.io/badge/Tailwind-3-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)

</div>

---

## ✨ Características

🎯 **Generación Automática de Equipos**
> Algoritmo inteligente que balancea equipos por posición, edad y habilidad

🏟️ **Visualización en Cancha**
> Vista interactiva con formación 4-4-2 y jugadores arrastrables

📊 **Vista de Tabla**
> Todos los equipos en una vista horizontal con scroll

👑 **Gestión de Capitanes**
> Selecciona el capitán de cada equipo con un clic

✏️ **Edición en Tiempo Real**
> Modifica nombres de equipos, transfiere jugadores entre equipos

📄 **Exportación a PDF**
> Genera documentos listos para imprimir en formato horizontal

🔄 **Drag & Drop**
> Arrastra jugadores para reorganizar posiciones o transferirlos

---

## 🚀 Inicio Rápido

### Requisitos
- Node.js 18+
- npm o yarn

### Instalación

```bash
# Clonar el repositorio
git clone https://github.com/DamianCanton/TORNEOFLOW.git

# Entrar al directorio
cd TORNEOFLOW

# Instalar dependencias
npm install

# Iniciar servidor de desarrollo
npm run dev
```

La aplicación estará disponible en `http://localhost:5173`

---

## 🎮 Cómo Usar

### 1. Configurar el Torneo
- Ingresa el nombre del torneo y fechas
- Define la cantidad de equipos a generar

### 2. Agregar Jugadores
- Agrega jugadores con nombre, posición y edad
- Las posiciones disponibles son: ARQ, DEF, MED, DEL, POLI (comodín)

### 3. Generar Equipos
- El algoritmo distribuye los jugadores de forma balanceada
- Prioriza jugadores por posición antes de asignar comodines

### 4. Editar y Personalizar
- **Vista Cancha**: Visualiza la formación y arrastra jugadores
- **Vista Tabla**: Ve todos los equipos en formato horizontal
- **Modo Edición**: Cambia nombres, selecciona capitanes, transfiere jugadores

### 5. Exportar
- Genera un PDF horizontal listo para imprimir
- Incluye todos los equipos con sus jugadores y capitanes marcados

---

## 🛠️ Stack Tecnológico

| Tecnología | Uso |
|------------|-----|
| **React 18** | Framework UI |
| **Vite** | Build tool y dev server |
| **TailwindCSS** | Estilos utility-first |
| **Zustand** | State management |
| **@dnd-kit** | Drag and drop |
| **jsPDF** | Generación de PDF |
| **Lucide React** | Iconografía |

---

## 📁 Estructura del Proyecto

```
TORNEOFLOW/
├── src/
│   ├── pages/
│   │   ├── Home.jsx           # Configuración del torneo
│   │   ├── TournamentRoom.jsx # Vista de cancha
│   │   └── TeamsTable.jsx     # Vista de tabla
│   ├── utils/
│   │   ├── tournamentMaker.js # Lógica de generación
│   │   └── pdfGenerator.js    # Exportación PDF
│   ├── store/
│   │   └── index.js           # Estado global (Zustand)
│   └── App.jsx
├── docs/
│   └── STYLE_GUIDE.md         # Guía de estilos para desarrolladores
└── README.md
```

---

## 📖 Documentación

- [Guía de Estilos](./docs/STYLE_GUIDE.md) - Sistema de diseño y convenciones de código

<div align="center">

**Desarrollado con ❤️ para la comunidad futbolera**

</div>
