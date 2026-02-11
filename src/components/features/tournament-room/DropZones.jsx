import React from 'react';
import { useDroppable } from '@dnd-kit/core';

export function FieldSlot({ index, player, children }) {
    const { setNodeRef, isOver } = useDroppable({
        id: `slot-${index}`,
        data: { index }
    });

    return (
        <div ref={setNodeRef} className={`absolute transform -translate-x-1/2 -translate-y-1/2 w-10 h-10 sm:w-14 sm:h-14 lg:w-16 lg:h-16 rounded-full transition-all duration-300 ${isOver ? 'bg-emerald-500/20 scale-125 ring-2 ring-emerald-400/50 shadow-[0_0_20px_rgba(16,185,129,0.3)]' : ''}`} style={{ top: player.top, left: player.left }}>
            {children}
        </div>
    );
}

export function BenchDroppableArea({ children }) {
    const { setNodeRef, isOver } = useDroppable({
        id: 'bench-zone'
    });
    return (
        <div ref={setNodeRef} className={`rounded-xl transition-all duration-300 p-2 min-h-[80px] sm:min-h-[120px] bg-black/20 border-2 ${isOver ? 'border-dashed border-emerald-500/50 bg-emerald-500/5' : 'border-transparent'}`}>
            {children}
        </div>
    );
}
