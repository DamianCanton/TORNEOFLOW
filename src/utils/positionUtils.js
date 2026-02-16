export const isPositionCompatible = (playerPosition, slotRole, altPosition = null) => {
    if (playerPosition === 'POLI') return true;
    if (playerPosition === slotRole) return true;
    if (altPosition && altPosition === slotRole) return true;
    return false;
};

export const SLOT_FILL_PRIORITY = {
    ARQ: ['ARQ', 'POLI'],
    DEF: ['DEF', 'POLI'],
    MED: ['MED', 'POLI'],
    DEL: ['DEL', 'POLI'],
};
