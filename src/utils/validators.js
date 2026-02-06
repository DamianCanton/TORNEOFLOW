/**
 * Módulo de validación centralizado para TORNEOFLOW
 */

export const VALID_POSITIONS = ['ARQ', 'DEF', 'MED', 'DEL', 'POLI', 'DT', 'CEN', 'LAT', 'VOL'];
export const MIN_PLAYERS = 22;

/**
 * Valida el nombre del torneo
 * @returns {string|null} Mensaje de error o null si es válido
 */
export const validateTournamentName = (name) => {
    if (!name?.trim()) return 'Por favor, ingresa el nombre del torneo';
    if (name.trim().length < 3) return 'El nombre debe tener al menos 3 caracteres';
    if (name.trim().length > 50) return 'El nombre no puede superar 50 caracteres';
    return null;
};

/**
 * Valida las fechas del torneo
 * @returns {string|null} Mensaje de error o null si es válido
 */
export const validateDates = (startDate, endDate) => {
    if (!startDate || !endDate) return 'Por favor, ingresa las fechas de inicio y fin';
    if (new Date(endDate) < new Date(startDate)) return 'La fecha de fin debe ser posterior a la de inicio';
    return null;
};

/**
 * Valida la lista de jugadores
 * @returns {string|null} Mensaje de error o null si es válido
 */
export const validatePlayers = (text) => {
    const trimmed = text?.trim();
    if (!trimmed) return 'Por favor, ingresa una lista de jugadores';

    const lines = trimmed.split(/\r?\n/).filter(l => l.trim());
    if (lines.length < MIN_PLAYERS) {
        return `Se necesitan al menos ${MIN_PLAYERS} jugadores (tenés ${lines.length})`;
    }

    // Detectar duplicados (ignorando mayúsculas/minúsculas)
    const names = lines.map(l => l.split(/[\t,]/)[0].trim().toLowerCase());
    const seen = new Set();
    const duplicates = [];

    names.forEach(name => {
        if (seen.has(name)) {
            if (!duplicates.includes(name)) duplicates.push(name);
        }
        seen.add(name);
    });

    if (duplicates.length > 0) {
        return `Jugadores duplicados: ${duplicates.join(', ')}`;
    }

    return null;
};
