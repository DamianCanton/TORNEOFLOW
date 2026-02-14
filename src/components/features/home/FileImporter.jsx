import React from 'react';
import { Upload, Download, CheckCircle, AlertCircle } from 'lucide-react';
import { parseFile, downloadTemplate } from '../../../utils/fileParser';
import Button from '../../ui/Button';

export default function FileImporter({
    onImport,
    onError,
    clearError,
    pendingPlayersCount,
    errors
}) {
    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        clearError('fileUpload');
        clearError('excelPlayers');

        try {
            const players = await parseFile(file);
            onImport(players);
        } catch (error) {
            console.error("Error importing file:", error);
            onError('Error al leer el archivo. Asegurate que sea un Excel valido.');
        }
        e.target.value = '';
    };

    return (
        <div className="space-y-6">
            <div className={`
                border-2 rounded-3xl p-8 flex flex-col items-center justify-center gap-6 
                transition-all group relative cursor-pointer
                ${pendingPlayersCount > 0
                    ? 'border-emerald-500/50 bg-emerald-500/10 border-solid'
                    : 'border-white/10 bg-white/5 hover:bg-white/10 border-dashed'}
            `}>
                <input
                    type="file"
                    accept=".xlsx,.xls,.csv"
                    onChange={handleFileUpload}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-40"
                    title={pendingPlayersCount > 0 ? "Cambiar archivo" : "Seleccionar archivo"}
                />

                <div className={`
                    w-16 h-16 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110
                    ${pendingPlayersCount > 0 ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' : 'bg-emerald-500/20 text-emerald-400'}
                `}>
                    {pendingPlayersCount > 0 ? <CheckCircle size={32} /> : <Upload size={32} />}
                </div>

                <div className="text-center space-y-2">
                    <h3 className={`text-lg font-bold ${pendingPlayersCount > 0 ? 'text-emerald-400' : 'text-white'}`}>
                        {pendingPlayersCount > 0 ? '¡Jugadores Cargados!' : 'Importar Jugadores'}
                    </h3>
                    <p className="text-slate-400 text-sm">
                        {pendingPlayersCount > 0
                            ? `${pendingPlayersCount} jugadores listos para el torneo`
                            : 'Arrastra tu archivo Excel aquí o haz clic para buscar'}
                    </p>
                </div>

                <Button
                    variant="secondary"
                    className={`z-10 relative pointer-events-none ${pendingPlayersCount > 0 ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : ''}`}
                    icon={pendingPlayersCount > 0 ? Upload : Download}
                >
                    {pendingPlayersCount > 0 ? 'Cambiar Excel' : 'Seleccionar Archivo'}
                </Button>
            </div>

            <div className="flex justify-center">
                <button
                    onClick={downloadTemplate}
                    className="text-xs text-slate-500 hover:text-emerald-400 transition-colors flex items-center gap-2 uppercase tracking-wider font-bold"
                >
                    <Download size={14} />
                    Descargar Plantilla Modelo
                </button>
            </div>

            {/* File Upload Error */}
            {errors.fileUpload && (
                <div className="flex items-center gap-2 px-3 py-2 bg-rose-500/10 border border-rose-500/20 rounded-lg animate-fade-in">
                    <AlertCircle size={14} className="text-rose-400 flex-shrink-0" />
                    <span className="text-rose-400 text-xs font-medium">{errors.fileUpload}</span>
                </div>
            )}

            {/* Excel Player Validation Errors */}
            {errors.excelPlayers?.length > 0 && (
                <div className="space-y-1 px-3 py-2 bg-rose-500/10 border border-rose-500/20 rounded-lg animate-fade-in">
                    {errors.excelPlayers.map((err, i) => (
                        <div key={i} className="flex items-start gap-2">
                            <AlertCircle size={14} className="text-rose-400 flex-shrink-0 mt-0.5" />
                            <span className="text-rose-400 text-xs font-medium">{err}</span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
