import React from 'react';
import { useDraggable, useDroppable } from '@dnd-kit/core';
import { Crown, ArrowRightLeft } from 'lucide-react';

// Droppable wrapper for rows
export function DroppableRow({ id, isEditMode, children }) {
    const { setNodeRef, isOver } = useDroppable({
        id: `drop-${id}`,
        data: { dropId: id }
    });

    return (
        <tbody ref={setNodeRef} className={`transition-colors ${isOver && isEditMode ? 'bg-emerald-500/10' : ''}`}>
            {children}
        </tbody>
    );
}

// Draggable Player Row
export default function DraggableRow({
    player,
    id,
    isEditMode,
    onSwapClick,
    onCaptainClick,
    teamId,
    origin,
    idx,
    isBeingDragged,
    isCaptain
}) {
    const { attributes, listeners, setNodeRef } = useDraggable({
        id: id,
        data: { player, teamId, origin, idx },
        disabled: !isEditMode || player.vacante
    });

    const isStarter = origin === 'starter';
    const isDT = player.role === 'DT';
    const isARQ = player.role === 'ARQ';

    // Show placeholder when being dragged
    if (isBeingDragged) {
        return (
            <DroppableRow id={id} isEditMode={isEditMode}>
                <tr className="border-t border-dashed border-emerald-500/50 bg-emerald-500/10 h-10">
                    <td colSpan={isEditMode ? 4 : 2} className="text-center text-emerald-400 text-xs font-medium animate-pulse">
                        Moviendo...
                    </td>
                </tr>
            </DroppableRow>
        );
    }

    return (
        <DroppableRow id={id} isEditMode={isEditMode}>
            <tr
                ref={setNodeRef}
                {...(isEditMode && !player.vacante ? listeners : {})}
                {...attributes}
                className={`border-t border-white/5 transition-all
                    ${isDT ? 'bg-indigo-500/10' : ''}
                    ${player.vacante ? 'bg-red-500/10' : ''}
                    ${isCaptain ? 'bg-amber-500/10' : ''}
                    ${!isStarter ? 'hover:bg-white/5' : 'hover:bg-white/5'}
                    ${isEditMode && !player.vacante ? 'cursor-grab active:cursor-grabbing hover:bg-white/10' : ''}
                `}
            >
                <td className="py-2.5 px-3 w-[60px]">
                    <div className="flex items-center gap-1">
                        {isCaptain && (
                            <Crown size={12} className="text-amber-400 flex-shrink-0" />
                        )}
                        {player.number && (
                            <span className="text-[10px] font-bold text-slate-500 w-4 text-right flex-shrink-0">
                                {player.number}
                            </span>
                        )}
                        <span className={`inline-flex items-center justify-center h-6 w-11 rounded-md text-[10px] font-bold tracking-wider shadow-sm
                            ${isDT ? 'bg-indigo-500/20 text-indigo-300' :
                                isARQ ? 'bg-yellow-500/20 text-yellow-300' :
                                    isCaptain ? 'bg-amber-500/20 text-amber-300' :
                                        isStarter ? 'bg-slate-500/20 text-slate-300' : 'bg-slate-600/20 text-slate-400'}
                         `}>
                            {isStarter ? player.role : (player.position || player.role)}
                        </span>
                    </div>
                </td>
                <td className={`py-2.5 px-3 font-medium text-xs sm:text-sm leading-tight ${isStarter ? 'text-white' : 'text-slate-300'}`}>
                    <span className="flex items-center gap-1.5">
                        {player.vacante ? (
                            <span className="text-red-400/80 italic text-xs font-normal">{isDT ? 'Falta DT' : 'Vacante'}</span>
                        ) : (
                            <>
                                {player.name}
                                {isCaptain && <span className="text-[9px] text-amber-400 font-bold">(C)</span>}
                                {player.isOutOfPosition && <span className="text-[9px] text-amber-400 font-bold">({player.position})</span>}
                            </>
                        )}
                    </span>
                </td>
                {isEditMode && (
                    <td className="py-2.5 px-1 text-right w-16">
                        <div className="flex items-center justify-end gap-0.5">
                            {!player.vacante && !isDT && (
                                <button
                                    onClick={(e) => { e.stopPropagation(); onCaptainClick(); }}
                                    className={`p-1.5 rounded-lg transition ${isCaptain
                                        ? 'text-amber-400 bg-amber-500/20'
                                        : 'text-slate-500 hover:text-amber-400 hover:bg-amber-500/10'}`}
                                    title={isCaptain ? 'Quitar capitán' : 'Hacer capitán'}
                                >
                                    <Crown size={14} />
                                </button>
                            )}
                            {!player.vacante && (
                                <button
                                    onClick={(e) => { e.stopPropagation(); onSwapClick(); }}
                                    className="p-1.5 text-slate-500 hover:text-emerald-400 hover:bg-emerald-500/10 rounded-lg transition"
                                    title="Mover a otro equipo"
                                >
                                    <ArrowRightLeft size={14} />
                                </button>
                            )}
                        </div>
                    </td>
                )}
            </tr>
        </DroppableRow>
    );
}
