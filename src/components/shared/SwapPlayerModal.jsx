import React from 'react';
import { ArrowRightLeft } from 'lucide-react';

export default function SwapPlayerModal({
    isOpen,
    onClose,
    player,
    currentTeamId,
    teams,
    onSwap
}) {
    if (!isOpen || !player) return null;

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-6 animate-fade-in">
            <div className="bg-slate-900 border border-white/10 p-6 rounded-3xl max-w-sm w-full shadow-2xl relative overflow-hidden">
                {/* Decorative glow */}
                <div className="absolute -top-10 -right-10 w-32 h-32 bg-emerald-500/20 blur-3xl rounded-full pointer-events-none"></div>

                <h3 className="text-xl font-black text-white mb-2 uppercase relative z-10">Mover Jugador</h3>
                <p className="text-slate-400 text-sm mb-6 relative z-10">
                    Elige destino para <span className="text-emerald-400 font-bold">{player.name}</span>
                </p>

                <div className="flex flex-col gap-2 max-h-60 overflow-y-auto custom-scrollbar relative z-10">
                    {teams.map(t => t.id !== currentTeamId && (
                        <button
                            key={t.id}
                            onClick={() => onSwap(t.id)}
                            className="p-4 text-left bg-white/5 hover:bg-emerald-500/20 border border-white/5 hover:border-emerald-500/50 rounded-xl text-slate-200 hover:text-white transition-all duration-200 font-semibold text-sm group"
                        >
                            <div className="flex items-center justify-between">
                                <span>{t.name}</span>
                                <ArrowRightLeft size={16} className="opacity-0 group-hover:opacity-100 transition-opacity text-emerald-400" />
                            </div>
                        </button>
                    ))}
                </div>
                <button
                    onClick={onClose}
                    className="mt-6 w-full py-3 text-slate-500 hover:text-white text-xs font-black uppercase tracking-widest transition"
                >
                    Cancelar
                </button>
            </div>
        </div>
    );
}
