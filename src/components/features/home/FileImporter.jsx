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
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8">
                <div className="relative group">
                    <input
                        type="file"
                        accept=".xlsx,.xls,.csv"
                        onChange={handleFileUpload}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
                    />
                    <Button variant="secondary" className="w-full text-sm py-4" icon={Upload}>
                        Importar Excel
                    </Button>
                </div>
                <Button
                    variant="secondary"
                    className="w-full text-sm py-4"
                    onClick={downloadTemplate}
                    icon={Download}
                >
                    Descargar Modelo
                </Button>
            </div>

            {/* File Upload Error */}
            {errors.fileUpload && (
                <div className="flex items-center gap-2 px-3 py-2 bg-rose-500/10 border border-rose-500/20 rounded-lg animate-fade-in">
                    <AlertCircle size={14} className="text-rose-400 flex-shrink-0" />
                    <span className="text-rose-400 text-xs font-medium">{errors.fileUpload}</span>
                </div>
            )}

            {/* Imported Players Preview */}
            {pendingPlayersCount > 0 && (
                <div className="flex items-center gap-3 px-4 py-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl animate-fade-in">
                    <CheckCircle size={18} className="text-emerald-400 flex-shrink-0" />
                    <span className="text-emerald-300 text-sm font-medium">
                        {pendingPlayersCount} jugadores importados
                    </span>
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
