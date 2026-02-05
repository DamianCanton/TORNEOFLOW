/**
 * Genera partidos balanceados dividiendo jugadores en 2 equipos
 * Usa distribución serpentina por score para balance
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

    // Calcular score para ordenar
    const getScore = (p) => (p.quality || 5) * 0.7 + (p.responsibility || 3) * 0.3;

    // Ordenar por score descendente
    const sorted = [...fieldPlayers].sort((a, b) => getScore(b) - getScore(a));

    // Distribuir en 2 equipos usando serpentina
    const teamA = [];
    const teamB = [];

    sorted.forEach((player, idx) => {
        // Serpentina: 0→A, 1→B, 2→B, 3→A, 4→A, 5→B...
        const cycle = Math.floor(idx / 2);
        const pos = idx % 2;

        if (cycle % 2 === 0) {
            // Ciclo par: A, B
            if (pos === 0) teamA.push(player);
            else teamB.push(player);
        } else {
            // Ciclo impar: B, A
            if (pos === 0) teamB.push(player);
            else teamA.push(player);
        }
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
