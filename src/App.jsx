import useAppStore from './store';
import Home from './pages/Home';
import MatchRoom from './pages/MatchRoom';
import PlayerEditor from './pages/PlayerEditor';
import TournamentRoom from './pages/TournamentRoom';

function App() {
    const currentView = useAppStore((state) => state.currentView);

    return (
        <main className="bg-slate-950 min-h-screen text-white">
            {currentView === 'home' && <Home />}
            {currentView === 'editor' && <PlayerEditor />}
            {currentView === 'matchRoom' && <MatchRoom />}
            {currentView === 'tournament' && <TournamentRoom />}
        </main>
    );
}

export default App;
