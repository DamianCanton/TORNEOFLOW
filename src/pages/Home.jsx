import useAppStore from '../store';
import { parseFile, downloadTemplate } from '../utils/fileParser';
import { Upload, Download } from 'lucide-react';
import { mockPlayersSimple } from '../data/mockPlayers';

export default function Home() {
    const {
        inputPlayers,
        setInputPlayers,
        syncPlayersFromText,
        importPlayers,
        tournamentName,
        tournamentStartDate,
        tournamentEndDate,
        setTournamentName,
        setTournamentStartDate,
        setTournamentEndDate
    } = useAppStore();

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        try {
            const players = await parseFile(file);
            importPlayers(players);
        } catch (error) {
            console.error("Error importing file:", error);
            alert("Error al leer el archivo. Asegúrate que sea un Excel válido.");
        }
    };

    const loadDemoData = () => {
        setTournamentName('Torneo Demo');
        setTournamentStartDate(new Date().toISOString().split('T')[0]);
        const endDate = new Date();
        endDate.setMonth(endDate.getMonth() + 1);
        setTournamentEndDate(endDate.toISOString().split('T')[0]);
        syncPlayersFromText(mockPlayersSimple);
    };

    const handleStart = () => {
        if (!tournamentName.trim()) {
            alert('Por favor, ingresa el nombre del torneo.');
            return;
        }
        if (!tournamentStartDate || !tournamentEndDate) {
            alert('Por favor, ingresa las fechas de inicio y fin del torneo.');
            return;
        }
        const trimmed = inputPlayers.trim();
        if (!trimmed) {
            alert('Por favor, ingresa una lista de jugadores.');
            return;
        }
        syncPlayersFromText(trimmed);
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen p-4 sm:p-6 relative">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-6 sm:mb-8 text-center">TORNEO FLOW</h1>

            {/* Información del torneo */}
            <div className="w-full max-w-lg mb-4 space-y-3">
                <input
                    type="text"
                    className="w-full p-3 bg-slate-900 rounded-lg border border-slate-700 text-white text-sm sm:text-base"
                    placeholder="Nombre del torneo"
                    value={tournamentName}
                    onChange={(e) => setTournamentName(e.target.value)}
                />
                <div className="flex flex-col sm:flex-row gap-3">
                    <div className="flex-1">
                        <label className="block text-slate-400 text-xs mb-1">Fecha inicio</label>
                        <input
                            type="date"
                            className="w-full p-3 bg-slate-900 rounded-lg border border-slate-700 text-white text-sm"
                            value={tournamentStartDate}
                            onChange={(e) => setTournamentStartDate(e.target.value)}
                        />
                    </div>
                    <div className="flex-1">
                        <label className="block text-slate-400 text-xs mb-1">Fecha fin</label>
                        <input
                            type="date"
                            className="w-full p-3 bg-slate-900 rounded-lg border border-slate-700 text-white text-sm"
                            value={tournamentEndDate}
                            onChange={(e) => setTournamentEndDate(e.target.value)}
                        />
                    </div>
                </div>
            </div>

            <textarea
                className="w-full max-w-lg p-3 sm:p-4 bg-slate-900 rounded-lg border border-slate-700 text-white min-h-[180px] sm:min-h-[200px] mb-4 text-sm sm:text-base"
                placeholder="Pega la lista de jugadores aquí..."
                value={inputPlayers}
                onChange={(e) => setInputPlayers(e.target.value)}
            />
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 w-full max-w-lg sm:w-auto justify-center">
                <button
                    className="bg-emerald-600 px-6 py-3 rounded-lg font-bold hover:bg-emerald-500 transition w-full sm:w-auto text-base"
                    onClick={handleStart}
                >
                    Comenzar
                </button>
                <div className="relative w-full sm:w-auto">
                    <input
                        type="file"
                        accept=".xlsx,.xls,.csv"
                        onChange={handleFileUpload}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    <button className="bg-slate-700 px-6 py-3 rounded-lg font-bold hover:bg-slate-600 transition flex items-center justify-center gap-2 text-slate-200 w-full sm:w-auto">
                        <Upload size={20} /> Excel
                    </button>
                </div>
                <button
                    onClick={downloadTemplate}
                    className="bg-slate-800 px-6 py-3 rounded-lg font-bold hover:bg-slate-700 transition flex items-center justify-center gap-2 text-slate-400 border border-slate-700 w-full sm:w-auto"
                >
                    <Download size={20} /> Modelo
                </button>
            </div>

            {/* Botón Demo sutil en esquina inferior derecha */}
            <button
                onClick={loadDemoData}
                className="fixed bottom-4 right-4 text-slate-500 text-xs hover:text-slate-400 transition"
            >
                Cargar demo →
            </button>
        </div>
    );
}

