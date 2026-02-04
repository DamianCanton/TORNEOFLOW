import { useState } from 'react';
import useAppStore from '../store';
import { ChevronLeft, ChevronRight, Share2, RotateCcw, FileText, Pencil, Save, ArrowRightLeft } from 'lucide-react';
import { generatePDF } from '../utils/pdfGenerator';
import { DndContext, useDraggable, useDroppable, DragOverlay, closestCenter, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';

function DraggablePlayer({ player, id, isEditMode, onClick }) {
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
        <div ref={setNodeRef} {...listeners} {...attributes} className={`absolute transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center z-10 ${isDragging ? 'opacity-50' : ''}`} style={{ ...style, top: player.top, left: player.left }}>
            <div className={`rounded-full border-2 shadow-xl flex items-center justify-center text-[10px] font-black cursor-grab active:cursor-grabbing transition-transform hover:scale-110
                ${player.role === 'DT' ? 'w-10 h-10 md:w-14 md:h-14 border-4 z-20' : 'w-8 h-8 md:w-10 md:h-10'}
                ${player.vacante ? 'bg-red-500/20 text-red-200 border-red-500 border-dashed' :
                    player.role === 'ARQ' ? 'bg-yellow-500 text-yellow-950 border-yellow-600' :
                        player.role === 'DT' ? 'bg-indigo-950 text-white border-indigo-400' :
                            player.isOutOfPosition ? 'bg-orange-600 text-white border-orange-400' : 'bg-slate-900 text-white border-slate-600'}`}>
                {player.vacante ? (player.role === 'DT' ? 'DT' : '?') : player.role}
            </div>
            <div className="mt-1 px-2 py-0.5 bg-black/70 backdrop-blur-md rounded text-[9px] text-white font-bold whitespace-nowrap flex gap-1 items-center">
                {player.name}
                {isEditMode && !player.vacante && <button onPointerDown={(e) => { e.stopPropagation(); onClick(); }} className="p-0.5 hover:text-emerald-400" title="Mover a otro equipo"><ArrowRightLeft size={12} /></button>}
            </div>
        </div>
    );
}

function FieldSlot({ index, player, children }) {
    const { setNodeRef, isOver } = useDroppable({
        id: `slot-${index}`,
        data: { index }
    });

    return (
        <div ref={setNodeRef} className={`absolute transform -translate-x-1/2 -translate-y-1/2 w-12 h-12 rounded-full transition-colors ${isOver ? 'bg-white/30' : ''}`} style={{ top: player.top, left: player.left }}>
            {children}
        </div>
    );
}

function BenchPlayer({ player, id, isEditMode, onClick }) {
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
        <div ref={setNodeRef} style={style} {...listeners} {...attributes} className={`px-3 py-2 bg-slate-800 rounded-lg border border-slate-700 text-xs flex items-center gap-2 cursor-grab active:cursor-grabbing ${isDragging ? 'opacity-50' : ''}`}>
            <span className="font-black text-slate-500">{player.position}</span>
            <span className="text-slate-300">{player.name}</span>
            {isEditMode && <button onPointerDown={(e) => { e.stopPropagation(); onClick(); }} className="p-0.5 text-slate-500 hover:text-emerald-400"><ArrowRightLeft size={10} /></button>}
        </div>
    );
}

export default function TournamentRoom() {
    const { tournamentTeams, setTournamentTeams, reset } = useAppStore();
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isEditMode, setIsEditMode] = useState(false);
    const [swapModal, setSwapModal] = useState(null); // { player, teamIndex, origin: 'bench'|'field', idx }

    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
    );

    const currentTeam = tournamentTeams[currentIndex];

    // Safety check
    if (!currentTeam) return <div className="text-white p-10">Cargando...</div>;

    const nextTeam = () => setCurrentIndex(prev => (prev + 1) % tournamentTeams.length);
    const prevTeam = () => setCurrentIndex(prev => (prev - 1 + tournamentTeams.length) % tournamentTeams.length);

    const handleDragEnd = (event) => {
        const { active, over } = event;
        if (!over) return;

        const activeId = active.id;
        const overId = over.id;

        if (activeId === overId) return;

        // Clone teams
        const newTeams = [...tournamentTeams];
        const team = { ...newTeams[currentIndex] };
        const starters = [...team.starters];
        const bench = [...team.bench];

        const activeData = active.data.current;
        const overData = over.data.current;

        // Dragging from Bench
        if (activeData.origin === 'bench') {
            const benchIdx = bench.findIndex(p => `bench-${p.id}` === activeId);
            const player = bench[benchIdx];

            if (overId.startsWith('slot-')) {
                // To Field Slot
                const slotIdx = parseInt(overId.split('-')[1]);
                const targetSlot = starters[slotIdx];

                // Remove from Bench
                bench.splice(benchIdx, 1);

                // If slot has a real player, move them to bench
                if (!targetSlot.vacante) {
                    bench.push({
                        ...targetSlot,
                        top: undefined, left: undefined, role: targetSlot.role // Keep original role or reset?
                    });
                }

                // Place bench player in slot (adopt slot coords and role)
                starters[slotIdx] = {
                    ...player,
                    role: targetSlot.role, // Adopt the role of the position
                    top: targetSlot.top,
                    left: targetSlot.left,
                    isOutOfPosition: player.position !== 'POLI' && player.position !== targetSlot.role
                };
            }
        }
        // Dragging from Field
        else if (activeData.origin === 'field') {
            const starterIdx = starters.findIndex(p => `starter-${p.name}-${p.role}` === activeId || `starter-${p.role}-${p.top}` === activeId); // improved ID find
            // Wait, constructing stable IDs for starters is tricky if we rely on generated props.
            // Let's rely on the index passed in DraggablePlayer if possible, but useDraggable needs ID.
            // Loop to find index based on ID
            let sIdx = -1;
            starters.forEach((p, i) => {
                if (`starter-${i}` === activeId) sIdx = i;
            });

            if (sIdx === -1) return;
            const player = starters[sIdx];

            if (overId.startsWith('slot-')) {
                // Swap on field
                const targetIdx = parseInt(overId.split('-')[1]);
                if (sIdx === targetIdx) return;

                const targetPlayer = starters[targetIdx];

                // Swap Logic
                // Player A takes Target B's slot (role/pos)
                // Player B takes Player A's slot

                starters[targetIdx] = { ...player, top: targetPlayer.top, left: targetPlayer.left, role: targetPlayer.role };
                starters[sIdx] = { ...targetPlayer, top: player.top, left: player.left, role: player.role };
            }
            else if (overId === 'bench-zone') {
                // Move to bench
                if (!player.vacante) {
                    starters[sIdx] = { ...player, vacante: true, name: 'FALTA UNO' }; // Reset to empty slot
                    bench.push({ ...player, top: undefined, left: undefined });
                }
            }
        }

        team.starters = starters;
        team.bench = bench;
        newTeams[currentIndex] = team;
        setTournamentTeams(newTeams);
    };

    const handleTeamSwap = (targetTeamId) => {
        if (!swapModal) return;

        const newTeams = [...tournamentTeams];
        const sourceTeam = newTeams[currentIndex];
        const targetTeam = newTeams.find(t => t.id === targetTeamId);
        if (!targetTeam) return;

        // Logic to simply move player to bench of target team? Or swap with a player?
        // Simple implementation: Move to target team's bench.

        // Remove from source
        let playerToMove;
        if (swapModal.origin === 'field') {
            const p = sourceTeam.starters[swapModal.idx];
            playerToMove = { ...p, top: undefined, left: undefined };
            // Make position vacante
            sourceTeam.starters[swapModal.idx] = { ...p, vacante: true, name: 'FALTA UNO' };
        } else {
            playerToMove = sourceTeam.bench[swapModal.idx];
            sourceTeam.bench.splice(swapModal.idx, 1);
        }

        // Add to target bench
        targetTeam.bench.push(playerToMove);

        setTournamentTeams(newTeams);
        setSwapModal(null);
        alert(`Jugador movido a ${targetTeam.name}`);
    };

    return (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <div className="flex flex-col items-center justify-center min-h-screen bg-slate-950 p-4 animate-fade-in pb-20">

                {/* Header Controls */}
                <div className="w-full max-w-4xl flex flex-col md:flex-row justify-between items-center mb-6 gap-4 bg-slate-900 p-4 rounded-xl border border-slate-800 shadow-xl z-20 relative">
                    <button onClick={prevTeam} className="p-3 bg-slate-800 hover:bg-emerald-600 rounded-lg text-white border border-slate-700 transition"><ChevronLeft size={24} /></button>
                    <div className="text-center">
                        <h2 className="text-3xl md:text-4xl font-black italic text-white uppercase tracking-tighter">{currentTeam.name}</h2>
                        <div className="flex gap-4 justify-center mt-2 text-xs font-mono text-emerald-400">
                            <span className={currentTeam.starters.length !== 11 ? 'text-orange-400' : ''}>Jugadores: {currentTeam.starters.filter(p => !p.vacante).length + currentTeam.bench.length}</span>
                            <span>Score: {currentTeam.stats.score}</span>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <button onClick={() => setIsEditMode(!isEditMode)} className={`p-3 rounded-lg text-white border transition flex items-center gap-2 ${isEditMode ? 'bg-emerald-600 border-emerald-500' : 'bg-slate-800 border-slate-700 hover:bg-slate-700'}`}>
                            {isEditMode ? <Save size={20} /> : <Pencil size={20} />}
                            <span className="hidden md:inline">{isEditMode ? 'Guardar' : 'Editar'}</span>
                        </button>
                        <button onClick={nextTeam} className="p-3 bg-slate-800 hover:bg-emerald-600 rounded-lg text-white border border-slate-700 transition"><ChevronRight size={24} /></button>
                    </div>
                </div>

                {/* Pitch */}
                <div className="relative w-full max-w-4xl aspect-[4/3] bg-[#2d8a4e] rounded-xl shadow-2xl overflow-hidden border-4 border-white/10 mb-6 select-none">
                    {/* Field Markings */}
                    <div className="absolute inset-5 border-2 border-white/60 rounded-lg pointer-events-none"></div>
                    <div className="absolute top-1/2 w-full h-0.5 bg-white/60 pointer-events-none"></div>
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 border-2 border-white/60 rounded-full pointer-events-none"></div>

                    {/* Players */}
                    {currentTeam.starters.map((p, idx) => (
                        <FieldSlot key={`slot-${idx}`} index={idx} player={p}>
                            <DraggablePlayer
                                id={`starter-${idx}`}
                                player={p}
                                isEditMode={isEditMode}
                                onClick={() => setSwapModal({ player: p, teamIndex: currentIndex, origin: 'field', idx })}
                            />
                        </FieldSlot>
                    ))}
                </div>

                {/* Bench */}
                <div className="w-full max-w-4xl bg-slate-900 p-4 rounded-xl border border-slate-800 shadow-xl mb-8 z-20 relative">
                    <div className="flex justify-between items-center mb-3">
                        <h3 className="text-slate-500 text-xs font-bold uppercase tracking-widest">Banco de Suplentes</h3>
                        {isEditMode && <span className="text-xs text-emerald-500 animate-pulse">Arrastra al campo para cambiar</span>}
                    </div>

                    <BenchDroppableArea>
                        <div className="flex flex-wrap gap-2 justify-center min-h-[50px]">
                            {currentTeam.bench.map((sub, idx) => (
                                <BenchPlayer
                                    key={`bench-${sub.id || idx}`}
                                    id={`bench-${sub.id || idx}`}
                                    player={sub}
                                    isEditMode={isEditMode}
                                    onClick={() => setSwapModal({ player: sub, teamIndex: currentIndex, origin: 'bench', idx })}
                                />
                            ))}
                        </div>
                    </BenchDroppableArea>
                </div>

                <div className="flex gap-4">
                    <button onClick={reset} className="text-slate-500 hover:text-white flex items-center gap-2 text-sm"><RotateCcw size={16} /> Volver al Inicio</button>
                    <button onClick={() => generatePDF(tournamentTeams)} className="text-slate-500 hover:text-red-400 flex items-center gap-2 text-sm"><FileText size={16} /> Exportar PDF</button>
                </div>

                {/* Swap Modal */}
                {swapModal && (
                    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
                        <div className="bg-slate-900 border border-slate-700 p-6 rounded-xl max-w-sm w-full">
                            <h3 className="text-xl font-bold text-white mb-4">Mover Jugador</h3>
                            <p className="text-slate-400 mb-4">¿A qué equipo quieres mover a <span className="text-white font-bold">{swapModal.player.name}</span>?</p>
                            <div className="flex flex-col gap-2 max-h-60 overflow-y-auto">
                                {tournamentTeams.map(t => t.id !== currentTeam.id && (
                                    <button
                                        key={t.id}
                                        onClick={() => handleTeamSwap(t.id)}
                                        className="p-3 text-left bg-slate-800 hover:bg-emerald-600 rounded-lg text-white transition border border-slate-700"
                                    >
                                        Mover a {t.name}
                                    </button>
                                ))}
                            </div>
                            <button onClick={() => setSwapModal(null)} className="mt-4 w-full py-2 text-slate-500 hover:text-white">Cancelar</button>
                        </div>
                    </div>
                )}

                <DragOverlay>
                    {/* Optional: custom preview */}
                </DragOverlay>
            </div>
        </DndContext>
    );
}

function BenchDroppableArea({ children }) {
    const { setNodeRef, isOver } = useDroppable({
        id: 'bench-zone'
    });
    return (
        <div ref={setNodeRef} className={`rounded-lg transition-colors p-2 ${isOver ? 'bg-slate-800/50 border-2 border-dashed border-emerald-500/50' : ''}`}>
            {children}
        </div>
    );
}

