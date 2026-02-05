import { create } from 'zustand';
import { generateMatches } from './utils/matchMaker';
import { generateTournament } from './utils/tournamentMaker';
import { parsePlayers } from './utils/parser';

const useAppStore = create((set, get) => ({
    inputPlayers: '',
    activePlayers: [],
    matches: [],
    tournamentTeams: [],
    reserves: [],
    currentView: 'home',
    tournamentName: '',
    tournamentStartDate: '',
    tournamentEndDate: '',

    setInputPlayers: (text) => set({ inputPlayers: text }),
    setTournamentName: (name) => set({ tournamentName: name }),
    setTournamentStartDate: (date) => set({ tournamentStartDate: date }),
    setTournamentEndDate: (date) => set({ tournamentEndDate: date }),

    syncPlayersFromText: (text) => {
        const parsedPlayers = parsePlayers(text).map(p => ({ ...p, id: crypto.randomUUID() }));
        get().processPlayers(parsedPlayers, text);
    },

    importPlayers: (players) => {
        // Ensure every player has an ID and basics
        const processed = players.map(p => ({
            id: crypto.randomUUID(),
            quality: 5,
            responsibility: 3,
            age: 25,
            position: 'POLI',
            ...p
        }));
        get().processPlayers(processed, '');
    },

    processPlayers: (players, textSource) => {
        // Mínimo 22 jugadores para torneo (11 por equipo × 2 equipos)
        if (players.length >= 22) {
            const teams = generateTournament(players);
            set({ inputPlayers: textSource, activePlayers: players, tournamentTeams: teams, currentView: 'tournament' });
        } else {
            set({ inputPlayers: textSource, activePlayers: players, currentView: 'editor' });
        }
    },

    createMatches: () => {
        const { activePlayers } = get();
        const { matches, reserves } = generateMatches(activePlayers);
        set({ matches, reserves, currentView: 'matchRoom' });
    },

    addPlayer: (player) => set((state) => ({ activePlayers: [...state.activePlayers, player] })),
    removePlayer: (id) => set((state) => ({ activePlayers: state.activePlayers.filter((p) => p.id !== id) })),
    updatePlayer: (updatedPlayer) => set((state) => ({ activePlayers: state.activePlayers.map((p) => (p.id === updatedPlayer.id ? updatedPlayer : p)) })),
    navigate: (view) => set({ currentView: view }),
    setTournamentTeams: (teams) => set({ tournamentTeams: teams }),
    reset: () => set({ currentView: 'home', matches: [], tournamentTeams: [], activePlayers: [], inputPlayers: '', tournamentName: '', tournamentStartDate: '', tournamentEndDate: '' }),
}));

export default useAppStore;
