import { useDroppable } from '@dnd-kit/core';

export default function Pitch({ team, isEditMode, children }) {
    const { setNodeRef, isOver } = useDroppable({
        id: `pitch-${team.id}`,
        data: { teamId: team.id, origin: 'pitch' }
    });

    return (
        <div
            ref={setNodeRef}
            className={`
                relative w-full aspect-[2/3] sm:aspect-[3/4] md:aspect-[4/3] lg:aspect-[3/4] xl:aspect-[4/3] 
                bg-emerald-800 rounded-xl overflow-hidden border-2 
                ${isOver && isEditMode ? 'border-emerald-400 ring-2 ring-emerald-400/50' : 'border-emerald-700/50'}
                shadow-2xl transition-all
            `}
        >
            {/* Field Pattern */}
            <div className="absolute inset-0 bg-[linear-gradient(to_bottom,transparent_0px,transparent_49%,rgba(255,255,255,0.05)_50%,transparent_51%),linear-gradient(to_right,transparent_0px,transparent_49%,rgba(255,255,255,0.05)_50%,transparent_51%)] bg-[length:50px_50px]"></div>

            {/* Center Circle */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 border-2 border-white/20 rounded-full"></div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 bg-white/20 rounded-full"></div>

            {/* Penalty Areas */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/5 h-[15%] border-b-2 border-x-2 border-white/20 rounded-b-lg"></div>
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-3/5 h-[15%] border-t-2 border-x-2 border-white/20 rounded-t-lg"></div>

            {/* Goals */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/4 h-2 border-b border-x border-white/40 bg-white/5 rounded-b-sm"></div>
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1/4 h-2 border-t border-x border-white/40 bg-white/5 rounded-t-sm"></div>

            {/* Corners */}
            <div className="absolute top-0 left-0 w-4 h-4 border-b border-r border-white/20 rounded-br-full"></div>
            <div className="absolute top-0 right-0 w-4 h-4 border-b border-l border-white/20 rounded-bl-full"></div>
            <div className="absolute bottom-0 left-0 w-4 h-4 border-t border-r border-white/20 rounded-tr-full"></div>
            <div className="absolute bottom-0 right-0 w-4 h-4 border-t border-l border-white/20 rounded-tl-full"></div>

            {/* Players Layer */}
            <div className="absolute inset-0 z-10">
                {children}
            </div>
        </div>
    );
}
