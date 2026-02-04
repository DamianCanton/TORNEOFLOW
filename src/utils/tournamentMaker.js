// TEAMS_COUNT removed, calculated dynamically

const FORMATION = [
    { role: 'ARQ', top: '88%', left: '50%' },
    { role: 'LAT', top: '70%', left: '15%' }, { role: 'CEN', top: '75%', left: '38%' },
    { role: 'CEN', top: '75%', left: '62%' }, { role: 'LAT', top: '70%', left: '85%' },
    { role: 'VOL', top: '45%', left: '15%' }, { role: 'MED', top: '50%', left: '38%' },
    { role: 'MED', top: '50%', left: '62%' }, { role: 'VOL', top: '45%', left: '85%' },
    { role: 'DEL', top: '15%', left: '35%' }, { role: 'DEL', top: '15%', left: '65%' }
];

export const generateTournament = (allPlayers) => {
    // Separate DTs from Players
    const coaches = allPlayers.filter(p => p.position === 'DT');
    const players = allPlayers.filter(p => p.position !== 'DT');

    // Calculate teams count: 15 players per team (11 starters + 4 bench)
    // Minimum 2 teams
    const calculatedTeams = Math.floor(players.length / 15);
    const TEAMS_COUNT = calculatedTeams < 2 ? 2 : calculatedTeams;

    const teams = Array.from({ length: TEAMS_COUNT }, (_, i) => ({
        id: i + 1,
        name: `Equipo ${i + 1}`,
        players: [],
        starters: [],
        bench: [],
        stats: { score: 0, avgAge: 0 }
    }));

    const getScore = (p) => (p.quality || 5) * 0.7 + (p.responsibility || 3) * 0.3;

    const pools = { ARQ: [], CEN: [], LAT: [], MED: [], VOL: [], DEL: [], POLI: [] };
    players.forEach(p => {
        const pos = pools[p.position] ? p.position : 'POLI';
        pools[pos].push(p);
    });

    const order = ['ARQ', 'CEN', 'DEL', 'MED', 'VOL', 'LAT', 'POLI'];

    let teamIndex = 0;
    let direction = 1;

    order.forEach(role => {
        const sortedPool = pools[role].sort((a, b) => getScore(b) - getScore(a));

        sortedPool.forEach(player => {
            teams[teamIndex].players.push({ ...player, role });
            teamIndex += direction;
            if (teamIndex >= TEAMS_COUNT) { teamIndex = TEAMS_COUNT - 1; direction = -1; }
            else if (teamIndex < 0) { teamIndex = 0; direction = 1; }
        });
    });

    teams.forEach(team => {
        const squad = [...team.players];
        FORMATION.forEach(slot => {
            // Find best fit: Correct Role AND Not Injured
            let foundIdx = squad.findIndex(p => p.role === slot.role && !p.injured);

            // Fallback 1: POLI AND Not Injured
            if (foundIdx === -1) foundIdx = squad.findIndex(p => p.role === 'POLI' && !p.injured);

            // Fallback 2: Any non-ARQ AND Not Injured (if slot is not ARQ)
            // If slot IS ARQ, we really prefer a real ARQ or at least a POLI, but if forced, we take anyone uninjured
            if (foundIdx === -1 && squad.length > 0) {
                foundIdx = squad.findIndex(p => p.role !== 'ARQ' && !p.injured);
                // if still -1 (maybe only ARQs left or everyone injured?), try finding anyone uninjured
                if (foundIdx === -1) foundIdx = squad.findIndex(p => !p.injured);
            }

            if (foundIdx !== -1) {
                const p = squad.splice(foundIdx, 1)[0];
                const isOutOfPosition = p.role !== slot.role && p.role !== 'POLI';
                team.starters.push({ ...p, ...slot, isOutOfPosition });
            } else {
                team.starters.push({ name: 'FALTA UNO', vacante: true, ...slot });
            }
        });
        team.bench = squad;

        const totalScore = team.players.reduce((acc, p) => acc + getScore(p), 0);
        const totalAge = team.players.reduce((acc, p) => acc + (p.age || 0), 0);
        team.stats = {
            score: totalScore.toFixed(1),
            avgAge: team.players.length ? (totalAge / team.players.length).toFixed(1) : 0
        };
    });

    // Assign Coaches (DTs)
    // Assign Coaches (DTs)
    teams.forEach((team, index) => {
        const coach = coaches[index];

        team.starters.push({
            ...(coach || { name: 'FALTA DT', vacante: true }),
            role: 'DT',
            top: '85%', // Slightly higher and more visible
            left: '8%',
            isOutOfPosition: false
        });
    });

    return teams;
};
