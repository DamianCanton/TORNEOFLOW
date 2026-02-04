import useAppStore from '../store';

export default function PlayerEditor() {
    const { activePlayers, createMatches, reset } = useAppStore();

    return (
        <div className="min-h-screen p-8">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-3xl font-bold">Editor de Jugadores ({activePlayers.length})</h2>
                <div className="flex gap-2">
                    <button onClick={reset} className="px-4 py-2 bg-slate-800 rounded">Volver</button>
                    <button onClick={createMatches} className="px-4 py-2 bg-emerald-600 rounded font-bold">Generar Partidos</button>
                </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {activePlayers.map((p) => (
                    <div key={p.id} className="bg-slate-900 p-4 rounded border border-slate-800">
                        <div className="font-bold text-lg">{p.name}</div>
                        <div className="text-sm text-slate-400">{p.position} - Q:{p.quality}</div>
                    </div>
                ))}
            </div>
        </div>
    );
}
