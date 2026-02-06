import { useState } from 'react';
import useAppStore from '../store';
import { parseFile, downloadTemplate } from '../utils/fileParser';
import { validateTournamentName, validateDates, validatePlayers } from '../utils/validators';
import { Upload, Download, Play, Trophy, AlertCircle } from 'lucide-react';
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

    const [errors, setErrors] = useState({
        tournamentName: '',
        dates: '',
        players: '',
        fileUpload: ''
    });

    const clearError = (field) => {
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: '' }));
        }
    };

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        clearError('fileUpload');
        try {
            const players = await parseFile(file);
            importPlayers(players);
        } catch (error) {
            console.error("Error importing file:", error);
            setErrors(prev => ({
                ...prev,
                fileUpload: 'Error al leer el archivo. Asegurate que sea un Excel valido.'
            }));
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
        const newErrors = {};

        const nameError = validateTournamentName(tournamentName);
        if (nameError) newErrors.tournamentName = nameError;

        const datesError = validateDates(tournamentStartDate, tournamentEndDate);
        if (datesError) newErrors.dates = datesError;

        const playersError = validatePlayers(inputPlayers);
        if (playersError) newErrors.players = playersError;

        if (Object.keys(newErrors).length > 0) {
            setErrors(prev => ({ ...prev, ...newErrors }));
            return;
        }

        setErrors({});
        syncPlayersFromText(inputPlayers.trim());
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen p-6 relative bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-[#0a0a0a] to-black overflow-hidden font-sans text-slate-200 selection:bg-emerald-500/30 selection:text-white">

            {/* Background Atmosphere */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-3xl h-64 bg-emerald-500/10 blur-[120px] rounded-full pointer-events-none"></div>

            <div className="relative z-10 w-full max-w-xl flex flex-col gap-8 animate-fade-in">

                {/* Header */}
                <div className="text-center space-y-4">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-700 shadow-[0_0_40px_-10px_rgba(16,185,129,0.5)] mb-2">
                        <Trophy size={32} className="text-white drop-shadow-md" />
                    </div>
                    <h1 className="text-4xl sm:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white to-slate-400 tracking-tighter drop-shadow-sm">
                        TORNEO FLOW
                    </h1>
                    <p className="text-slate-500 font-medium tracking-wide">Gestor de torneos inteligente</p>
                </div>

                {/* Form Container */}
                <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-6 sm:p-8 rounded-3xl shadow-2xl space-y-6 relative overflow-hidden">
                    {/* Subtle Inner Glow */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 blur-3xl rounded-full pointer-events-none -translate-y-1/2 translate-x-1/2"></div>

                    {/* Tournament Info Inputs */}
                    <div className="space-y-4">
                        <div className="space-y-1.5">
                            <label className="text-[10px] uppercase font-bold tracking-widest text-slate-500 ml-1">Nombre</label>
                            <input
                                type="text"
                                className={`w-full px-4 py-3 bg-black/30 rounded-xl border text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all font-medium ${errors.tournamentName ? 'border-rose-500/50' : 'border-white/10'}`}
                                placeholder="Ej: Copa de Verano 2024"
                                value={tournamentName}
                                onChange={(e) => { setTournamentName(e.target.value); clearError('tournamentName'); }}
                            />
                            {errors.tournamentName && (
                                <div className="flex items-center gap-2 mt-2 px-3 py-2 bg-rose-500/10 border border-rose-500/20 rounded-lg animate-fade-in">
                                    <AlertCircle size={14} className="text-rose-400 flex-shrink-0" />
                                    <span className="text-rose-400 text-xs font-medium">{errors.tournamentName}</span>
                                </div>
                            )}
                        </div>

                        <div className="space-y-2">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-[10px] uppercase font-bold tracking-widest text-slate-500 ml-1">Inicio</label>
                                    <input
                                        type="date"
                                        className={`w-full px-4 py-3 bg-black/30 rounded-xl border text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all text-sm font-medium ${errors.dates ? 'border-rose-500/50' : 'border-white/10'}`}
                                        value={tournamentStartDate}
                                        onChange={(e) => { setTournamentStartDate(e.target.value); clearError('dates'); }}
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[10px] uppercase font-bold tracking-widest text-slate-500 ml-1">Fin</label>
                                    <input
                                        type="date"
                                        className={`w-full px-4 py-3 bg-black/30 rounded-xl border text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all text-sm font-medium ${errors.dates ? 'border-rose-500/50' : 'border-white/10'}`}
                                        value={tournamentEndDate}
                                        onChange={(e) => { setTournamentEndDate(e.target.value); clearError('dates'); }}
                                    />
                                </div>
                            </div>
                            {errors.dates && (
                                <div className="flex items-center gap-2 px-3 py-2 bg-rose-500/10 border border-rose-500/20 rounded-lg animate-fade-in">
                                    <AlertCircle size={14} className="text-rose-400 flex-shrink-0" />
                                    <span className="text-rose-400 text-xs font-medium">{errors.dates}</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Players Input */}
                    <div className="space-y-1.5">
                        <label className="text-[10px] uppercase font-bold tracking-widest text-slate-500 ml-1">Jugadores</label>
                        <textarea
                            className={`w-full p-4 bg-black/30 rounded-xl border text-white min-h-[160px] placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all text-sm font-mono leading-relaxed resize-none custom-scrollbar ${errors.players ? 'border-rose-500/50' : 'border-white/10'}`}
                            placeholder={"Luis (ARQ)\nCarlos (DEF)\nAna (MED)\nPedro (DEL)"}
                            value={inputPlayers}
                            onChange={(e) => { setInputPlayers(e.target.value); clearError('players'); }}
                        />
                        {errors.players && (
                            <div className="flex items-center gap-2 mt-2 px-3 py-2 bg-rose-500/10 border border-rose-500/20 rounded-lg animate-fade-in">
                                <AlertCircle size={14} className="text-rose-400 flex-shrink-0" />
                                <span className="text-rose-400 text-xs font-medium">{errors.players}</span>
                            </div>
                        )}
                    </div>

                    {/* Primary Action */}
                    <button
                        className="w-full bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-400 hover:to-green-500 text-white py-4 rounded-xl font-bold uppercase tracking-widest text-sm shadow-[0_0_25px_-5px_rgba(16,185,129,0.5)] hover:shadow-[0_0_35px_-5px_rgba(16,185,129,0.7)] hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 group border-t border-white/20"
                        onClick={handleStart}
                    >
                        <Play size={18} className="fill-white" /> Comenzar Torneo
                    </button>

                    {/* Secondary Actions */}
                    <div className="grid grid-cols-2 gap-4 pt-2">
                        <div className="relative group">
                            <input
                                type="file"
                                accept=".xlsx,.xls,.csv"
                                onChange={handleFileUpload}
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
                            />
                            <button className="w-full bg-white/5 hover:bg-white/10 px-4 py-3 rounded-xl font-semibold text-slate-300 transition border border-white/5 flex items-center justify-center gap-2 text-sm group-hover:text-white group-hover:border-white/10">
                                <Upload size={16} /> Importar Excel
                            </button>
                        </div>
                        <button
                            onClick={downloadTemplate}
                            className="w-full bg-white/5 hover:bg-white/10 px-4 py-3 rounded-xl font-semibold text-slate-300 transition border border-white/5 flex items-center justify-center gap-2 text-sm hover:text-white hover:border-white/10"
                        >
                            <Download size={16} /> Descargar Modelo
                        </button>
                    </div>

                    {/* File Upload Error */}
                    {errors.fileUpload && (
                        <div className="flex items-center gap-2 px-3 py-2 bg-rose-500/10 border border-rose-500/20 rounded-lg animate-fade-in">
                            <AlertCircle size={14} className="text-rose-400 flex-shrink-0" />
                            <span className="text-rose-400 text-xs font-medium">{errors.fileUpload}</span>
                        </div>
                    )}
                </div>
            </div>

            {/* Subtle Demo Link */}
            <button
                onClick={loadDemoData}
                className="fixed bottom-6 right-6 text-slate-600 text-[10px] font-bold uppercase tracking-widest hover:text-emerald-500 transition-colors opacity-50 hover:opacity-100"
            >
                Cargar Datos Demo
            </button>
        </div>
    );
}
