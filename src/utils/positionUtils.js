export const isPositionCompatible = (playerPosition, slotRole, altPosition = null) => {
    if (playerPosition === 'POLI') return true;
    if (playerPosition === slotRole) return true;
    if (altPosition && altPosition === slotRole) return true;
    return false;
};

export const SLOT_FILL_PRIORITY = {
    ARQ: ['ARQ', 'POLI'],
    CEN: ['CEN', 'LAT', 'POLI'],
    LAT: ['LAT', 'CEN', 'POLI'],
    MED: ['MED', 'VOL', 'POLI'],
    VOL: ['VOL', 'MED', 'POLI'],
    DEL: ['DEL', 'VOL', 'POLI'],
};
