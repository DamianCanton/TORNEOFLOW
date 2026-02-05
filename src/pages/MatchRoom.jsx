import useAppStore from '../store';

export default function MatchRoom() {
    const { matches, reset, tournamentName, tournamentStartDate, tournamentEndDate } = useAppStore();

    const formatDate = (dateStr) => {
        if (!dateStr) return '';
        const date = new Date(dateStr + 'T00:00:00');
        return date.toLocaleDateString('es-AR', { day: 'numeric', month: 'short' });
    };

    return (
        <div className="min-h-screen p-4 sm:p-6 md:p-8">
            {/* Tournament Header */}
            <div className="text-center mb-6 sm:mb-8">
                <h1 className="text-xl sm:text-2xl md:text-3xl font-black text-white uppercase tracking-tight">{tournamentName || 'Torneo'}</h1>
                {tournamentStartDate && tournamentEndDate && (
                    <p className="text-slate-400 text-xs sm:text-sm mt-1">
                        {formatDate(tournamentStartDate)} — {formatDate(tournamentEndDate)}
                    </p>
                )}
                <h2 className="text-lg sm:text-xl font-bold text-emerald-400 mt-4">Partidos Generados</h2>
            </div>

            <div className="flex flex-col gap-3 sm:gap-4 items-center">
                {matches.map((m, idx) => (
                    <div key={idx} className="bg-slate-900 p-4 sm:p-6 rounded-xl border border-slate-800 w-full max-w-2xl">
                        <div className="text-lg sm:text-xl font-bold mb-2">Equipo 1 vs Equipo 2</div>
                    </div>
                ))}
            </div>
            <div className="text-center mt-6 sm:mt-8">
                <button onClick={reset} className="text-slate-400 hover:text-white transition px-4 py-2">Volver al inicio</button>
            </div>
        </div>
    );
}
