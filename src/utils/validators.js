/**
 * Módulo de validación centralizado para TORNEOFLOW
 */

export const VALID_POSITIONS = ['ARQ', 'DEF', 'MED', 'DEL', 'POLI', 'DT'];
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

/**
 * Valida un array de jugadores importados desde Excel
 * @returns {{ valid: boolean, errors: string[] }}
 */
export const validateExcelPlayers = (players) => {
    const errors = [];

    if (!Array.isArray(players) || players.length === 0) {
        return { valid: false, errors: ['El archivo no contiene jugadores.'] };
    }

    if (players.length < MIN_PLAYERS) {
        errors.push(`Se necesitan al menos ${MIN_PLAYERS} jugadores (hay ${players.length}).`);
    }

    const names = [];
    const duplicates = new Set();
    const rowErrors = [];

    players.forEach((player, index) => {
        const rowNum = index + 2;

        if (!player.name || String(player.name).trim() === '') {
            rowErrors.push(`Fila ${rowNum}: falta el nombre del jugador.`);
        } else {
            const normalized = String(player.name).trim().toLowerCase();
            if (names.includes(normalized)) {
                duplicates.add(player.name);
            }
            names.push(normalized);
        }

        if (player.position && !VALID_POSITIONS.includes(player.position)) {
            rowErrors.push(`Fila ${rowNum} (${player.name || '?'}): posición "${player.position}" no válida.`);
        }

        if (player.altPosition && !VALID_POSITIONS.includes(player.altPosition)) {
            rowErrors.push(`Fila ${rowNum} (${player.name || '?'}): posición alternativa "${player.altPosition}" no válida.`);
        }

        if (player.number !== null && player.number !== undefined) {
            const n = Number(player.number);
            if (!Number.isInteger(n) || n < 1) {
                rowErrors.push(`Fila ${rowNum} (${player.name || '?'}): Nº debe ser un número entero positivo.`);
            }
        }

    });

    if (duplicates.size > 0) {
        errors.push(`Jugadores duplicados: ${[...duplicates].join(', ')}`);
    }

    if (rowErrors.length > 10) {
        errors.push(...rowErrors.slice(0, 10));
        errors.push(`...y ${rowErrors.length - 10} errores más.`);
    } else {
        errors.push(...rowErrors);
    }

    return { valid: errors.length === 0, errors };
};
