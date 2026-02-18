import { SLOT_FILL_PRIORITY, isPositionCompatible } from './positionUtils';

const FORMATION = [
    { role: 'ARQ', top: '88%', left: '50%' },
    { role: 'DEF', top: '70%', left: '15%' }, { role: 'DEF', top: '75%', left: '38%' },
    { role: 'DEF', top: '75%', left: '62%' }, { role: 'DEF', top: '70%', left: '85%' },
    { role: 'MED', top: '45%', left: '15%' }, { role: 'MED', top: '50%', left: '38%' },
    { role: 'MED', top: '50%', left: '62%' }, { role: 'MED', top: '45%', left: '85%' },
    { role: 'DEL', top: '15%', left: '35%' }, { role: 'DEL', top: '15%', left: '65%' }
];

export const generateTournament = (allPlayers, options = {}) => {
    // Separate DTs, SUPLs y jugadores de campo
    const coaches = allPlayers.filter(p => p.position === 'DT');
    const forcedBench = allPlayers.filter(p => p.position === 'SUPL');
    const players = allPlayers.filter(p => p.position !== 'DT' && p.position !== 'SUPL');

    // Constantes de configuración
    const MIN_PER_TEAM = 11;   // Mínimo: solo titulares (formación completa)
    const IDEAL_PER_TEAM = 15; // Ideal: 11 titulares + 4 suplentes
    const MAX_PER_TEAM = 18;   // Máximo: 11 titulares + 7 suplentes

    // Calcular número óptimo de equipos usando rango flexible
    let TEAMS_COUNT;

    if (options.forcedTeamCount) {
        TEAMS_COUNT = options.forcedTeamCount;
    } else if (players.length < MIN_PER_TEAM * 2) {
        // Menos de 22 jugadores: forzar 2 equipos (caso límite)
        TEAMS_COUNT = 2;
    } else {
        // Buscar número de equipos que mantenga entre MIN y MAX por equipo
        // Preferir el que más se acerque a IDEAL_PER_TEAM
        const minTeams = Math.ceil(players.length / MAX_PER_TEAM);
        const maxTeams = Math.floor(players.length / MIN_PER_TEAM);

        let bestTeams = minTeams;
        let bestDiff = Infinity;

        for (let t = minTeams; t <= maxTeams; t++) {
            const perTeam = players.length / t;
            const diff = Math.abs(perTeam - IDEAL_PER_TEAM);
            if (diff < bestDiff) {
                bestDiff = diff;
                bestTeams = t;
            }
        }

        TEAMS_COUNT = Math.max(2, bestTeams);
    }

    const teams = Array.from({ length: TEAMS_COUNT }, (_, i) => ({
        id: i + 1,
        name: `Equipo ${i + 1}`,
        players: [],
        starters: [],
        bench: [],
        stats: { score: 0, avgAge: 0 }
    }));

    const getScore = (p) => (p.quality || 5) * 0.7 + (p.responsibility || 3) * 0.3;

    const pools = { ARQ: [], DEF: [], MED: [], DEL: [], POLI: [] };
    players.forEach(p => {
        const pos = pools[p.position] ? p.position : 'POLI';
        pools[pos].push(p);
    });

    // ============ FASE 1: DISTRIBUCIÓN BASADA EN NECESIDADES ============
    const FORMATION_NEEDS = { ARQ: 1, DEF: 4, MED: 4, DEL: 2 };
    const positionOrder = ['ARQ', 'DEF', 'MED', 'DEL'];

    // Necesidades pendientes por equipo por posición
    const teamNeeds = teams.map(() => ({ ...FORMATION_NEEDS }));

    // Para cada posición, distribuir garantizando cobertura mínima
    positionOrder.forEach((pos) => {
        const sortedPool = pools[pos].sort((a, b) => getScore(b) - getScore(a));
        const need = FORMATION_NEEDS[pos];
        const guaranteedPerTeam = Math.min(need, Math.floor(sortedPool.length / TEAMS_COUNT));

        let cursor = 0;

        // Ronda garantizada: dar a cada equipo la misma cantidad con serpentina
        for (let round = 0; round < guaranteedPerTeam; round++) {
            const indices = round % 2 === 0
                ? Array.from({ length: TEAMS_COUNT }, (_, i) => i)
                : Array.from({ length: TEAMS_COUNT }, (_, i) => TEAMS_COUNT - 1 - i);

            for (const teamIdx of indices) {
                if (cursor < sortedPool.length) {
                    teams[teamIdx].players.push({ ...sortedPool[cursor], role: pos });
                    teamNeeds[teamIdx][pos]--;
                    cursor++;
                }
            }
        }

        // Remanentes: al equipo con más necesidad en esta posición
        while (cursor < sortedPool.length) {
            let bestIdx = -1;
            let bestNeed = 0;
            let bestScore = Infinity;

            for (let t = 0; t < TEAMS_COUNT; t++) {
                const n = teamNeeds[t][pos];
                const s = teams[t].players.reduce((acc, p) => acc + getScore(p), 0);
                if (n > bestNeed || (n === bestNeed && s < bestScore)) {
                    bestNeed = n;
                    bestScore = s;
                    bestIdx = t;
                }
            }

            // Si ningún equipo necesita más, distribuir surplus con serpentina
            if (bestIdx === -1 || bestNeed <= 0) {
                const remaining = sortedPool.slice(cursor);
                let dir = 1, idx = 0;
                remaining.forEach(player => {
                    teams[idx].players.push({ ...player, role: pos });
                    idx += dir;
                    if (idx >= TEAMS_COUNT) { dir = -1; idx = TEAMS_COUNT - 2; }
                    else if (idx < 0) { dir = 1; idx = 1; }
                });
                break;
            }

            teams[bestIdx].players.push({ ...sortedPool[cursor], role: pos });
            teamNeeds[bestIdx][pos]--;
            cursor++;
        }

        // ARQ surplus: cada equipo solo necesita 1. Los extra se reasignan como POLI
        if (pos === 'ARQ') {
            teams.forEach(team => {
                let arqSeen = 0;
                team.players.forEach(p => {
                    if (p.role === 'ARQ') {
                        arqSeen++;
                        if (arqSeen > 1) p.role = 'POLI';
                    }
                });
            });
        }
    });

    // ============ POLI: LLENAR HUECOS RESTANTES ============
    const poliPool = pools['POLI'].sort((a, b) => getScore(b) - getScore(a));

    poliPool.forEach(player => {
        let bestIdx = 0;
        let bestUnfilled = -1;
        let bestScore = Infinity;

        for (let t = 0; t < TEAMS_COUNT; t++) {
            const unfilled = Object.values(teamNeeds[t]).reduce((a, b) => a + Math.max(0, b), 0);
            const s = teams[t].players.reduce((acc, p) => acc + getScore(p), 0);
            if (unfilled > bestUnfilled || (unfilled === bestUnfilled && s < bestScore)) {
                bestUnfilled = unfilled;
                bestScore = s;
                bestIdx = t;
            }
        }

        teams[bestIdx].players.push({ ...player, role: 'POLI' });

        // Reducir la mayor necesidad pendiente de ese equipo
        const needs = teamNeeds[bestIdx];
        const highestNeed = Object.entries(needs)
            .filter(([, v]) => v > 0)
            .sort(([, a], [, b]) => b - a)[0];
        if (highestNeed) needs[highestNeed[0]]--;
    });

    teams.forEach(team => {
        const squad = [...team.players];
        FORMATION.forEach(slot => {
            let foundIdx = -1;

            // Buscar por prioridad: match exacto → POLI
            const priorities = SLOT_FILL_PRIORITY[slot.role] || [slot.role, 'POLI'];
            for (const candidateRole of priorities) {
                foundIdx = squad.findIndex(p => p.role === candidateRole);
                if (foundIdx !== -1) break;
            }

            // Buscar por posición alternativa
            if (foundIdx === -1) {
                foundIdx = squad.findIndex(p => p.altPosition === slot.role && p.role !== 'ARQ');
            }

            // Fallback: cualquier jugador de campo (nunca ARQ para slot de campo)
            if (foundIdx === -1 && squad.length > 0) {
                if (slot.role === 'ARQ') {
                    foundIdx = squad.findIndex(() => true);
                } else {
                    foundIdx = squad.findIndex(p => p.role !== 'ARQ');
                }
            }

            if (foundIdx !== -1) {
                const p = squad.splice(foundIdx, 1)[0];
                const outOfPosition = !isPositionCompatible(p.position, slot.role, p.altPosition);
                team.starters.push({ ...p, ...slot, isOutOfPosition: outOfPosition });
            } else {
                team.starters.push({
                    name: 'FALTA UNO',
                    vacante: true,
                    id: `vacante-${team.id}-${slot.role}`,
                    ...slot
                });
            }
        });
        team.bench = squad;

        const allTeamPlayers = [...team.players, ...team.bench];  // stats antes de SUPL
        const totalScore = allTeamPlayers.reduce((acc, p) => acc + getScore(p), 0);
        const totalAge = allTeamPlayers.reduce((acc, p) => acc + (p.age || 0), 0);
        team.stats = {
            score: totalScore.toFixed(1),
            avgAge: allTeamPlayers.length ? (totalAge / allTeamPlayers.length).toFixed(1) : 0
        };
    });

    // Distribuir SUPL forzados al banco de cada equipo (después de armar titulares)
    const sortedForcedBench = forcedBench.sort((a, b) => getScore(b) - getScore(a));
    sortedForcedBench.forEach((player, i) => {
        const teamIdx = i % TEAMS_COUNT;
        teams[teamIdx].bench.push({ ...player, role: 'SUPL' });
    });

    // Asignar DTs (1 por equipo si hay suficientes)
    teams.forEach((team, index) => {
        const coach = coaches[index];

        team.starters.push({
            ...(coach || { name: 'FALTA DT', vacante: true, id: `vacante-dt-${index}` }),
            role: 'DT',
            top: '85%', // Slightly higher and more visible
            left: '8%',
            isOutOfPosition: false
        });
    });

    return teams;
};

export const recalculateTeamStats = (team) => {
    const getScore = (p) => (p.quality || 5) * 0.7 + (p.responsibility || 3) * 0.3;
    const activePlayers = [
        ...team.starters.filter(p => !p.vacante),
        ...team.bench
    ];

    const totalScore = activePlayers.reduce((acc, p) => acc + getScore(p), 0);
    const totalAge = activePlayers.reduce((acc, p) => acc + (p.age || 0), 0);

    team.stats = {
        score: activePlayers.length ? totalScore.toFixed(1) : '0.0',
        avgAge: activePlayers.length ? (totalAge / activePlayers.length).toFixed(1) : '0'
    };

    return team;
};
