import { create } from 'zustand';
import { generateTournament } from './utils/tournamentMaker';
import { parsePlayers } from './utils/parser';

const useAppStore = create((set, get) => ({
    inputPlayers: '',
    activePlayers: [],
    pendingPlayers: [],
    matches: [],
    tournamentTeams: [],
    reserves: [],
    currentView: 'home',
    tournamentName: '',
    tournamentStartDate: '',
    tournamentEndDate: '',

    setTournamentName: (name) => set({ tournamentName: name }),
    setTournamentStartDate: (date) => set({ tournamentStartDate: date }),
    setTournamentEndDate: (date) => set({ tournamentEndDate: date }),

    syncPlayersFromText: (text) => {
        const parsedPlayers = parsePlayers(text).map(p => ({ ...p, id: crypto.randomUUID() }));
        get().processPlayers(parsedPlayers, text);
    },

    importPlayers: (players) => {
        const processed = players.map(p => ({
            id: crypto.randomUUID(),
            quality: 5,
            responsibility: 3,
            age: 25,
            position: 'POLI',
            ...p
        }));
        const seen = new Set();
        const unique = processed.filter(p => {
            const key = `${p.name}-${p.position}-${p.quality}-${p.responsibility}-${p.age}`.toLowerCase();
            if (seen.has(key)) return false;
            seen.add(key);
            return true;
        });
        set({ pendingPlayers: unique });
    },

    createTournament: () => {
        const { pendingPlayers, processPlayers } = get();
        processPlayers(pendingPlayers, '');
    },

    processPlayers: (players, textSource) => {
        // Mínimo 22 jugadores para torneo (11 por equipo × 2 equipos)
        if (players.length >= 22) {
            const teams = generateTournament(players);
            set({ inputPlayers: textSource, activePlayers: players, tournamentTeams: teams, currentView: 'tournament' });
        } else {
            const teams = generateTournament(players);
            set({ inputPlayers: textSource, activePlayers: players, tournamentTeams: teams, currentView: 'tournament' });
        }
    },

    createMatches: () => {
        const { activePlayers } = get();
        const teams = generateTournament(activePlayers);
        set({ tournamentTeams: teams, currentView: 'tournament' });
    },

    addPlayer: (player) => set((state) => ({ activePlayers: [...state.activePlayers, player] })),
    removePlayer: (id) => set((state) => ({ activePlayers: state.activePlayers.filter((p) => p.id !== id) })),
    updatePlayer: (updatedPlayer) => set((state) => ({ activePlayers: state.activePlayers.map((p) => (p.id === updatedPlayer.id ? updatedPlayer : p)) })),
    navigate: (view) => set({ currentView: view }),
    setTournamentTeams: (teams) => set({ tournamentTeams: teams }),
    reset: () => set({ currentView: 'home', matches: [], tournamentTeams: [], activePlayers: [], pendingPlayers: [], inputPlayers: '', tournamentName: '', tournamentStartDate: '', tournamentEndDate: '' }),

    // Toast notifications
    toasts: [],
    addToast: (toast) => set((state) => ({
        toasts: [...state.toasts, { id: crypto.randomUUID(), ...toast }]
    })),
    removeToast: (id) => set((state) => ({
        toasts: state.toasts.filter(t => t.id !== id)
    })),

    // Push notification (central)
    pushNotification: null,
    showPushNotification: (message) => {
        set({ pushNotification: { id: crypto.randomUUID(), message } });
    },
    hidePushNotification: () => set({ pushNotification: null }),
}));

export default useAppStore;
