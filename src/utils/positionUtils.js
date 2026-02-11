export const isPositionCompatible = (playerPosition, slotRole) => {
    if (playerPosition === 'POLI') return true;
    return playerPosition === slotRole;
};

export const SLOT_FILL_PRIORITY = {
    ARQ: ['ARQ', 'POLI'],
    DEF: ['DEF', 'POLI'],
    MED: ['MED', 'POLI'],
    DEL: ['DEL', 'POLI'],
};
