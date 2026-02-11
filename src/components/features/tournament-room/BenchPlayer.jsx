import React from 'react';
import { useDraggable } from '@dnd-kit/core';
import { Shirt, Crown, ArrowRightLeft } from 'lucide-react';

export default function BenchPlayer({ player, id, isEditMode, onClick, onCaptainClick, isCaptain }) {
    const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
        id: id,
        data: { player, origin: 'bench' },
        disabled: !isEditMode
    });

    const style = transform ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
        zIndex: 50
    } : undefined;

    return (
        <div ref={setNodeRef} style={style} {...listeners} {...attributes} className={`
            flex items-center gap-4 p-3 rounded-xl transition-all duration-300 group
            ${isCaptain ? 'bg-amber-500/10 border-amber-500/30' : 'bg-white/5 border-white/5'} border hover:bg-white/10 hover:border-white/10 shadow-sm
            ${isEditMode ? 'cursor-grab active:cursor-grabbing hover:border-emerald-500/30 hover:shadow-[0_0_15px_-5px_rgba(16,185,129,0.2)]' : ''}
            ${isDragging ? 'opacity-50 scale-95' : ''}
        `}>
            {/* Bench Jersey Preview */}
            <div className="flex-shrink-0 p-2 bg-white/5 rounded-lg border border-white/5 relative">
                <Shirt
                    size={16}
                    className={isCaptain ? 'text-amber-400' : 'text-slate-400'}
                    strokeWidth={2}
                />
                {isCaptain && (
                    <Crown size={10} className="absolute -top-1 -right-1 text-amber-400" />
                )}
            </div>

            <div className="flex flex-col flex-1 min-w-0">
                <span className="text-slate-200 font-semibold truncate text-xs tracking-tight group-hover:text-white transition-colors flex items-center gap-1">
                    {player.name}
                    {isCaptain && <span className="text-amber-400 text-[9px] font-black">(C)</span>}
                </span>
                <span className="text-[10px] uppercase tracking-wider text-slate-500 font-bold group-hover:text-emerald-400 transition-colors">{player.position}</span>
            </div>

            {isEditMode && (
                <div className="flex items-center gap-1">
                    <button
                        onPointerDown={(e) => { e.stopPropagation(); onCaptainClick && onCaptainClick(); }}
                        className={`p-1.5 rounded-md transition ${isCaptain ? 'text-amber-400 bg-amber-500/20' : 'text-slate-600 hover:text-amber-400 hover:bg-amber-500/10'}`}
                        title={isCaptain ? 'Quitar capitán' : 'Hacer capitán'}
                    >
                        <Crown size={12} />
                    </button>
                    <button onPointerDown={(e) => { e.stopPropagation(); onClick(); }} className="text-slate-600 hover:text-emerald-400 transition p-1.5 hover:bg-white/10 rounded-md">
                        <ArrowRightLeft size={14} />
                    </button>
                </div>
            )}
        </div>
    );
}
