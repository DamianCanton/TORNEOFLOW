// Mapeo de posición numérica (1-11) a posición del sistema
export const NUMERIC_POSITION_MAP = {
    1: 'ARQ',
    2: 'DEF', 3: 'DEF', 4: 'DEF', 5: 'DEF',
    6: 'MED', 7: 'MED', 8: 'MED', 9: 'MED',
    10: 'DEL', 11: 'DEL'
};

export const numericToPosition = (val) => {
    if (val === null || val === undefined || val === '') return null;
    const num = parseInt(val);
    if (isNaN(num)) return null;
    return NUMERIC_POSITION_MAP[num] || null;
};

export const parsePlayers = (text) => {
    if (!text) return [];

    const lines = text.split(/\r?\n/).filter(line => line.trim().length > 0);

    return lines.map((line, index) => {
        const separator = line.includes('\t') ? '\t' : ',';
        const parts = line.split(separator).map(p => p.trim());

        if (parts.length === 1) {
            return {
                name: parts[0],
                position: 'POLI',
                altPosition: null,
                quality: 5,
                responsibility: 3,
                age: 25,
                number: index + 1
            };
        }

        return {
            name: parts[0],
            position: normalizePosition(parts[1]),
            quality: parseInt(parts[2]) || 5,
            responsibility: parseInt(parts[3]) || 3,
            age: parseInt(parts[4]) || 25,
            number: index + 1,
            altPosition: parts[5] ? normalizePosition(parts[5]) : null
        };
    });
};

// Exportadas para reusar en fileParser.js
export const normalizePosition = (rawPos) => {
    if (rawPos === null || rawPos === undefined || rawPos === '') return 'POLI';

    // Intentar mapeo numérico primero (1-11)
    const numResult = numericToPosition(rawPos);
    if (numResult) return numResult;

    const clean = String(rawPos).toUpperCase().trim()
        .normalize('NFD').replace(/[\u0300-\u036f]/g, ''); // quita acentos

    // Mapeo de alias completos (palabras en español e inglés)
    const aliases = {
        'ARQUERO': 'ARQ', 'PORTERO': 'ARQ', 'GOALKEEPER': 'ARQ', 'GK': 'ARQ',
        'DEFENSOR': 'DEF', 'DEFENSA': 'DEF', 'CENTRAL': 'DEF', 'LATERAL': 'DEF', 'ZAGUERO': 'DEF',
        'MEDIOCAMPISTA': 'MED', 'MEDIO': 'MED', 'VOLANTE': 'MED', 'CENTROCAMPISTA': 'MED',
        'DELANTERO': 'DEL', 'ATACANTE': 'DEL', 'PUNTA': 'DEL', 'FORWARD': 'DEL',
        'POLIVALENTE': 'POLI', 'POLIFUNCIONAL': 'POLI', 'COMODIN': 'POLI',
        'SUPLENTE': 'SUPL', 'SUPL': 'SUPL', 'SUPL.': 'SUPL', 'SUB': 'SUPL'
    };
    if (aliases[clean]) return aliases[clean];

    // SUPL explícito
    if (clean.startsWith('SUPL') || clean.startsWith('SUB')) return 'SUPL';

    // POLI fallback
    if (clean.startsWith('POL')) return 'POLI';

    // DT
    if (clean === 'DT' || clean.startsWith('DIR')) return 'DT';

    const valid = ['ARQ', 'MED', 'DEL', 'DEF'];
    if (clean.substring(0, 3) === 'LAT') return 'DEF';
    if (clean.substring(0, 3) === 'VOL') return 'MED';
    return valid.includes(clean.substring(0, 3)) ? clean.substring(0, 3) : 'POLI';
};
