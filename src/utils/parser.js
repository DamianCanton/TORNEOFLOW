export const parsePlayers = (text) => {
    if (!text) return [];

    const lines = text.split(/\r?\n/).filter(line => line.trim().length > 0);

    return lines.map(line => {
        const separator = line.includes('\t') ? '\t' : ',';
        const parts = line.split(separator).map(p => p.trim());

        if (parts.length === 1) {
            return {
                name: parts[0],
                position: 'POLI',
                quality: 5,
                responsibility: 3,
                age: 25
            };
        }

        return {
            name: parts[0],
            position: normalizePosition(parts[1]),
            quality: parseInt(parts[2]) || 5,
            responsibility: parseInt(parts[3]) || 3,
            age: parseInt(parts[4]) || 25,
            injured: isInjured(parts[5])
        };
    });
};

const normalizePosition = (rawPos) => {
    if (!rawPos) return 'POLI';
    const clean = rawPos.toUpperCase().trim();
    // Allow POLI explicitly or fallback to it
    if (clean.startsWith('POL')) return 'POLI';

    // DT is now a valid position
    if (clean === 'DT' || clean.startsWith('DIR')) return 'DT';

    const valid = ['ARQ', 'CEN', 'LAT', 'MED', 'VOL', 'DEL'];
    return valid.includes(clean.substring(0, 3)) ? clean.substring(0, 3) : 'POLI';
};

const isInjured = (val) => {
    if (!val) return false;
    return /^[sy1x]/i.test(val.trim()); // Starts with s, y, 1, or x (si, yes, x)
};
