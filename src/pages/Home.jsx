import useAppStore from '../store';
import { parseFile, downloadTemplate } from '../utils/fileParser';
import { Upload, Download } from 'lucide-react';

export default function Home() {
    const { inputPlayers, setInputPlayers, syncPlayersFromText, importPlayers } = useAppStore();

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

    return (
        <div className="flex flex-col items-center justify-center min-h-screen p-4">
            <h1 className="text-4xl font-bold mb-8">TORNEO FLOW</h1>
            <textarea
                className="w-full max-w-lg p-4 bg-slate-900 rounded-lg border border-slate-700 text-white min-h-[200px] mb-4"
                placeholder="Pega la lista de jugadores aquí..."
                value={inputPlayers}
                onChange={(e) => setInputPlayers(e.target.value)}
            />
            <div className="flex flex-wrap gap-4 justify-center">
                <button
                    className="bg-emerald-600 px-6 py-3 rounded-lg font-bold hover:bg-emerald-500 transition"
                    onClick={() => syncPlayersFromText(inputPlayers)}
                >
                    Comenzar
                </button>
                <div className="relative">
                    <input
                        type="file"
                        accept=".xlsx,.xls,.csv"
                        onChange={handleFileUpload}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    <button className="bg-slate-700 px-6 py-3 rounded-lg font-bold hover:bg-slate-600 transition flex items-center gap-2 text-slate-200">
                        <Upload size={20} /> Importar Excel
                    </button>
                </div>
                <button
                    onClick={downloadTemplate}
                    className="bg-slate-800 px-6 py-3 rounded-lg font-bold hover:bg-slate-700 transition flex items-center gap-2 text-slate-400 border border-slate-700"
                >
                    <Download size={20} /> Modelo
                </button>
            </div>
        </div>
    );
}
