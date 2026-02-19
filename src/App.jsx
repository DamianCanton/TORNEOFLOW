import useAppStore from './store';
import Home from './pages/Home';
import MatchRoom from './pages/MatchRoom';
import TournamentRoom from './pages/TournamentRoom';
import TeamsTable from './pages/TeamsTable';
import PlayerSetup from './pages/PlayerSetup';
import ToastContainer from './components/Toast';
import PushNotification from './components/PushNotification';

function App() {
    const currentView = useAppStore((state) => state.currentView);

    return (
        <main className="bg-slate-950 min-h-screen text-white">
            {currentView === 'home' && <Home />}
            {currentView === 'playerSetup' && <PlayerSetup />}
            {currentView === 'matchRoom' && <MatchRoom />}
            {currentView === 'tournament' && <TournamentRoom />}
            {currentView === 'teamsTable' && <TeamsTable />}
            <ToastContainer />
            <PushNotification />
        </main>
    );
}

export default App;

