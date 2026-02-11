import React from 'react';
import { useDroppable } from '@dnd-kit/core';

export default function DroppableTeamCard({ team, children, isEditMode }) {
    const { setNodeRef, isOver } = useDroppable({
        id: `team-${team.id}`,
        data: { teamId: team.id }
    });

    return (
        <div
            ref={setNodeRef}
            className={`flex-shrink-0 w-[85vw] sm:w-80 backdrop-blur-xl rounded-2xl border shadow-xl overflow-hidden transition-all duration-300 flex flex-col
                ${isOver && isEditMode
                    ? 'border-emerald-500/50 bg-emerald-500/5 ring-1 ring-emerald-500/30 scale-[1.01]'
                    : 'bg-white/5 border-white/10 hover:border-white/20 hover:bg-white/10'
                }
            `}
        >
            {children}
        </div>
    );
}
