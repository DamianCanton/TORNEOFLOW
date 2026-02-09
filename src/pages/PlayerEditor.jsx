import useAppStore from '../store';

export default function PlayerEditor() {
    const { activePlayers, createMatches, reset } = useAppStore();

    return (
        <div className="min-h-screen p-4 sm:p-6 md:p-8">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6">
                <h2 className="text-2xl md:text-3xl font-bold text-center md:text-left">Editor de Jugadores ({activePlayers.length})</h2>
                <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
                    <button onClick={reset} className="flex-1 md:flex-none px-4 py-2 bg-slate-800 rounded hover:bg-slate-700 transition">Volver</button>
                    <button onClick={createMatches} className="flex-1 md:flex-none px-4 py-2 bg-emerald-600 rounded font-bold hover:bg-emerald-500 transition">Generar Partidos</button>
                </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                {activePlayers.map((p) => (
                    <div key={p.id} className="bg-slate-900 p-3 sm:p-4 rounded border border-slate-800">
                        <div className="font-bold text-base sm:text-lg">{p.name}</div>
                        <div className="text-xs sm:text-sm text-slate-400">{p.position} - Q:{p.quality}</div>
                    </div>
                ))}
            </div>
        </div>
    );
}
