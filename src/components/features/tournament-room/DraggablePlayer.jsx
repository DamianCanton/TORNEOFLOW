import React from 'react';
import { useDraggable } from '@dnd-kit/core';
import { Shirt, Crown, ArrowRightLeft } from 'lucide-react';

export default function DraggablePlayer({ player, id, isEditMode, onClick, onCaptainClick, isCaptain }) {
    const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
        id: id,
        data: { player, origin: 'field' },
        disabled: !isEditMode || player.vacante
    });

    const style = transform ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
        zIndex: 50
    } : undefined;

    return (
        <div ref={setNodeRef} {...listeners} {...attributes} className={`absolute transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center z-10 ${isDragging ? 'opacity-80 scale-110 cursor-grabbing' : ''}`} style={{ ...style, top: player.top, left: player.left }}>

            {/* Jersey Icon Container */}
            <div className={`relative flex items-center justify-center transition-all duration-300 hover:scale-110 hover:drop-shadow-[0_0_15px_rgba(255,255,255,0.15)] scale-[0.65] sm:scale-[0.8] lg:scale-100
                ${isEditMode && !player.vacante ? 'cursor-grab active:cursor-grabbing' : 'cursor-default'}
            `}>
                <Shirt
                    size={player.role === 'DT' ? 56 : 48}
                    className={`
                        filter drop-shadow-xl
                        ${player.vacante ? 'text-slate-800/40 fill-white/5' :
                            player.role === 'ARQ' ? 'text-yellow-500 fill-yellow-500/10' :
                                player.role === 'DT' ? 'text-indigo-500 fill-indigo-500/10' :
                                    isCaptain ? 'text-amber-400 fill-amber-400/10' :
                                        player.isOutOfPosition ? 'text-orange-500 fill-orange-500/10' : 'text-slate-200 fill-slate-200/10'
                        }
                    `}
                    strokeWidth={1.5}
                />

                {/* Captain Crown */}
                {isCaptain && (
                    <div className="absolute -top-2 left-1/2 -translate-x-1/2">
                        <Crown size={14} className="text-amber-400 drop-shadow-lg" fill="rgba(251,191,36,0.3)" />
                    </div>
                )}

                {/* Transfer Button (Edit Mode) */}
                {isEditMode && !player.vacante && (
                    <button
                        onPointerDown={(e) => { e.stopPropagation(); onClick && onClick(); }}
                        className="absolute -top-1 -right-1 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-full p-1.5 border border-slate-900 shadow-lg transition-all hover:scale-110"
                        title="Mover a otro equipo"
                    >
                        <ArrowRightLeft size={10} className="stroke-[2.5]" />
                    </button>
                )}

                {/* Captain Button (Edit Mode) */}
                {isEditMode && !player.vacante && player.role !== 'DT' && (
                    <button
                        onPointerDown={(e) => { e.stopPropagation(); onCaptainClick && onCaptainClick(); }}
                        className={`absolute -bottom-1 -left-1 p-1 rounded-full border border-slate-900 shadow-lg transition-all
                            ${isCaptain ? 'bg-amber-500 text-slate-950' : 'bg-slate-700 text-slate-400 hover:bg-amber-500 hover:text-slate-950'}
                        `}
                        title={isCaptain ? 'Quitar capitán' : 'Hacer capitán'}
                    >
                        <Crown size={10} />
                    </button>
                )}
            </div>

            {/* Name Label - Glass Pill */}
            <div className={`mt-1 sm:mt-2 px-1.5 py-0.5 sm:px-3 sm:py-1 rounded-full flex flex-col items-center leading-none pointer-events-none
               bg-slate-950/60 backdrop-blur-md border ${isCaptain ? 'border-amber-500/30' : 'border-white/10'} shadow-[0_4px_10px_rgba(0,0,0,0.5)]
            `}>
                <span className="text-[10px] sm:text-xs font-bold text-slate-100 whitespace-nowrap tracking-tight flex items-center gap-1">
                    {player.vacante ? '?' : player.name}
                    {isCaptain && <span className="text-amber-400 text-[8px] font-black">(C)</span>}
                    {player.isOutOfPosition && <span className="text-amber-400 text-[8px] font-black">({player.position})</span>}
                </span>
                {!player.vacante && (
                    <span className={`text-[8px] font-black uppercase tracking-[0.15em] mt-0.5
                        ${player.role === 'ARQ' ? 'text-yellow-500' :
                            player.role === 'DEF' ? 'text-blue-400' :
                                player.role === 'MED' ? 'text-emerald-400' :
                                    player.role === 'DEL' ? 'text-rose-400' : 'text-slate-500'}
                    `}>
                        {player.position || player.role}
                    </span>
                )}
            </div>
        </div>
    );
}
