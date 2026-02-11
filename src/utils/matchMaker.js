/**
 * Genera partidos balanceados dividiendo jugadores en 2 equipos
 * Usa distribución serpentina por posición y score para balance
 *
 * @param {Array} players - Lista de jugadores con quality y responsibility
 * @returns {{ matches: Array, reserves: Array }}
 */
export const generateMatches = (players) => {
    if (!players || players.length < 2) {
        return { matches: [], reserves: players || [] };
    }

    // Separar DTs de jugadores
    const coaches = players.filter(p => p.position === 'DT');
    const fieldPlayers = players.filter(p => p.position !== 'DT');

    // Calcular score de toda la lista para ordenar
    const getScore = (p) => (p.quality || 5) * 0.7 + (p.responsibility || 3) * 0.3;

    // Crear pools por posición
    const pools = { ARQ: [], DEF: [], MED: [], DEL: [], POLI: [] };
    fieldPlayers.forEach(p => {
        const pos = pools[p.position] ? p.position : 'POLI';
        pools[pos].push(p);
    });

    const teamA = [];
    const teamB = [];

    // Distribuir por pools con serpentina individual
    const order = ['ARQ', 'DEL', 'DEF', 'MED', 'POLI'];

    order.forEach((role, poolIndex) => {
        const sortedPool = pools[role].sort((a, b) => getScore(b) - getScore(a));
        // Alternar: pools pares A primero, pools impares B primero
        const firstTeam = poolIndex % 2 === 0 ? teamA : teamB;
        const secondTeam = poolIndex % 2 === 0 ? teamB : teamA;

        sortedPool.forEach((player, idx) => {
            const cycle = Math.floor(idx / 2);
            const pos = idx % 2;
            if (cycle % 2 === 0) {
                if (pos === 0) firstTeam.push(player);
                else secondTeam.push(player);
            } else {
                if (pos === 0) secondTeam.push(player);
                else firstTeam.push(player);
            }
        });
    });

    // Asignar DTs si hay
    const dtA = coaches[0] || null;
    const dtB = coaches[1] || null;

    // Calcular stats de cada equipo
    const calcStats = (team) => {
        const totalScore = team.reduce((acc, p) => acc + getScore(p), 0);
        const totalAge = team.reduce((acc, p) => acc + (p.age || 25), 0);
        return {
            score: totalScore.toFixed(1),
            avgAge: team.length ? (totalAge / team.length).toFixed(1) : '0',
            count: team.length
        };
    };

    const match = {
        id: 1,
        teamA: {
            name: 'Equipo A',
            players: teamA,
            coach: dtA,
            stats: calcStats(teamA)
        },
        teamB: {
            name: 'Equipo B',
            players: teamB,
            coach: dtB,
            stats: calcStats(teamB)
        }
    };

    // Reservas: DTs sobrantes (si hay más de 2)
    const reserves = coaches.slice(2);

    return {
        matches: [match],
        reserves
    };
};
