import useAppStore from '../store';

export default function MatchRoom() {
    const { matches, reset } = useAppStore();

    return (
        <div className="min-h-screen p-8 text-center">
            <h2 className="text-3xl font-bold mb-6">Partidos Generados</h2>
            <div className="flex flex-col gap-4 items-center">
                {matches.map((m, idx) => (
                    <div key={idx} className="bg-slate-900 p-6 rounded-xl border border-slate-800 w-full max-w-2xl">
                        <div className="text-xl font-bold mb-2">Equipo 1 vs Equipo 2</div>
                        {/* Placeholder matches display */}
                    </div>
                ))}
            </div>
            <button onClick={reset} className="mt-8 text-slate-400 hover:text-white">Volver</button>
        </div>
    );
}
