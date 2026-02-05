import { useState, useRef } from 'react';
import useAppStore from '../store';
import { ArrowLeft, FileText, Pencil, Save, ArrowRightLeft, ChevronLeft, ChevronRight } from 'lucide-react';
import { generatePDF } from '../utils/pdfGenerator';
import { recalculateTeamStats } from '../utils/tournamentMaker';
import { DndContext, useDraggable, useDroppable, closestCenter, PointerSensor, useSensor, useSensors, DragOverlay } from '@dnd-kit/core';

// Draggable Player Row
function DraggableRow({ player, id, isEditMode, onSwapClick, teamId, origin, idx, isBeingDragged }) {
    const { attributes, listeners, setNodeRef, transform } = useDraggable({
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
                <tr className="border-t border-dashed border-emerald-500 bg-emerald-900/20 h-10">
                    <td colSpan={isEditMode ? 3 : 2} className="text-center text-emerald-400 text-xs">
                        Arrastrando este jugador...
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
                className={`border-t border-slate-800 transition-colors
                    ${isDT ? 'bg-indigo-950/50' : ''}
                    ${player.vacante ? 'bg-red-900/20' : ''}
                    ${!isStarter ? 'hover:bg-slate-800/30' : ''}
                    ${isEditMode && !player.vacante ? 'cursor-grab active:cursor-grabbing hover:bg-slate-800' : ''}
                `}
            >
                <td className={`py-2 px-2 font-bold 
                    ${isDT ? 'text-indigo-400' : isARQ ? 'text-yellow-500' : isStarter ? 'text-slate-400' : 'text-slate-500'}`}>
                    {isStarter ? player.role : (player.position || player.role)}
                </td>
                <td className={`py-2 px-2 ${isStarter ? 'text-white' : 'text-slate-300'}`}>
                    {player.vacante ? (
                        <span className="text-red-400 italic">{isDT ? 'Falta DT' : 'Vacante'}</span>
                    ) : player.name}
                </td>
                {isEditMode && (
                    <td className="py-2 px-2">
                        {!player.vacante && (
                            <button
                                onClick={(e) => { e.stopPropagation(); onSwapClick(); }}
                                className="text-slate-500 hover:text-emerald-400 transition"
                                title="Mover a otro equipo"
                            >
                                <ArrowRightLeft size={14} />
                            </button>
                        )}
                    </td>
                )}
            </tr>
        </DroppableRow>
    );
}

// Droppable wrapper for rows
function DroppableRow({ id, isEditMode, children }) {
    const { setNodeRef, isOver } = useDroppable({
        id: `drop-${id}`,
        data: { dropId: id }
    });

    return (
        <tbody ref={setNodeRef} className={isOver && isEditMode ? 'bg-emerald-900/40' : ''}>
            {children}
        </tbody>
    );
}

// Droppable Team Card
function DroppableTeamCard({ team, children, isEditMode }) {
    const { setNodeRef, isOver } = useDroppable({
        id: `team-${team.id}`,
        data: { teamId: team.id }
    });

    return (
        <div
            ref={setNodeRef}
            className={`flex-shrink-0 w-64 sm:w-72 bg-slate-900 rounded-lg sm:rounded-xl border shadow-xl overflow-hidden transition-all
                ${isOver && isEditMode ? 'border-emerald-500 ring-2 ring-emerald-500/50 scale-[1.02]' : 'border-slate-800'}
            `}
        >
            {children}
        </div>
    );
}

export default function TeamsTable() {
    const { tournamentTeams, setTournamentTeams, navigate, tournamentName, tournamentStartDate, tournamentEndDate } = useAppStore();

    const formatDate = (dateStr) => {
        if (!dateStr) return '';
        const date = new Date(dateStr + 'T00:00:00');
        return date.toLocaleDateString('es-AR', { day: 'numeric', month: 'short' });
    };
    const [isEditMode, setIsEditMode] = useState(false);
    const [swapModal, setSwapModal] = useState(null);
    const [draggedId, setDraggedId] = useState(null);
    const [draggedData, setDraggedData] = useState(null);
    const scrollContainerRef = useRef(null);

    const scrollLeft = () => {
        scrollContainerRef.current?.scrollBy({ left: -300, behavior: 'smooth' });
    };
    const scrollRight = () => {
        scrollContainerRef.current?.scrollBy({ left: 300, behavior: 'smooth' });
    };

    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
    );

    if (!tournamentTeams || tournamentTeams.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen p-4">
                <p className="text-slate-400">No hay equipos generados.</p>
                <button onClick={() => navigate('home')} className="mt-4 text-emerald-500 hover:underline">Volver al inicio</button>
            </div>
        );
    }

    const handleDragStart = (event) => {
        setDraggedId(event.active.id);
        setDraggedData(event.active.data.current);
    };

    const handleDragEnd = (event) => {
        const { active, over } = event;

        setDraggedId(null);
        setDraggedData(null);

        if (!over) return;

        const activeData = active.data.current;
        const overId = over.id.toString();

        // Case 1: Dropped on another player row (swap positions)
        if (overId.startsWith('drop-')) {
            const targetId = overId.replace('drop-', '');
            const parts = targetId.split('-');
            const targetOrigin = parts[0];
            const targetTeamId = parseInt(parts[1]);
            const targetIdx = parseInt(parts[2]);

            if (activeData.teamId === targetTeamId && activeData.origin === targetOrigin && activeData.idx === targetIdx) {
                return;
            }

            const newTeams = JSON.parse(JSON.stringify(tournamentTeams));
            const sourceTeam = newTeams.find(t => t.id === activeData.teamId);
            const targetTeam = newTeams.find(t => t.id === targetTeamId);

            if (!sourceTeam || !targetTeam) return;

            const sourceList = activeData.origin === 'starter' ? sourceTeam.starters : sourceTeam.bench;
            const targetList = targetOrigin === 'starter' ? targetTeam.starters : targetTeam.bench;

            const sourcePlayer = { ...sourceList[activeData.idx] };
            const targetPlayer = { ...targetList[targetIdx] };

            if (targetPlayer.vacante) {
                if (targetOrigin === 'starter') {
                    targetList[targetIdx] = {
                        ...sourcePlayer,
                        role: targetPlayer.role,
                        top: targetPlayer.top,
                        left: targetPlayer.left,
                        isOutOfPosition: sourcePlayer.position !== 'POLI' && sourcePlayer.position !== targetPlayer.role
                    };
                }

                if (activeData.origin === 'starter') {
                    // Vacante limpia: solo datos del slot
                    sourceList[activeData.idx] = {
                        name: 'FALTA UNO',
                        vacante: true,
                        role: sourcePlayer.role,
                        top: sourcePlayer.top,
                        left: sourcePlayer.left
                    };
                } else {
                    sourceList.splice(activeData.idx, 1);
                }
            } else {
                // Full swap
                if (activeData.origin === 'starter' && targetOrigin === 'starter') {
                    sourceList[activeData.idx] = {
                        ...targetPlayer,
                        role: sourcePlayer.role,
                        top: sourcePlayer.top,
                        left: sourcePlayer.left,
                        isOutOfPosition: targetPlayer.position !== 'POLI' && targetPlayer.position !== sourcePlayer.role
                    };
                    targetList[targetIdx] = {
                        ...sourcePlayer,
                        role: targetPlayer.role,
                        top: targetPlayer.top,
                        left: targetPlayer.left,
                        isOutOfPosition: sourcePlayer.position !== 'POLI' && sourcePlayer.position !== targetPlayer.role
                    };
                } else if (activeData.origin === 'bench' && targetOrigin === 'bench') {
                    sourceList[activeData.idx] = targetPlayer;
                    targetList[targetIdx] = sourcePlayer;
                } else {
                    if (activeData.origin === 'starter') {
                        sourceList[activeData.idx] = {
                            ...targetPlayer,
                            role: sourcePlayer.role,
                            top: sourcePlayer.top,
                            left: sourcePlayer.left,
                            isOutOfPosition: targetPlayer.position !== 'POLI' && targetPlayer.position !== sourcePlayer.role
                        };
                        targetList[targetIdx] = { ...sourcePlayer, top: undefined, left: undefined, role: undefined, isOutOfPosition: undefined };
                    } else {
                        targetList[targetIdx] = {
                            ...sourcePlayer,
                            role: targetPlayer.role,
                            top: targetPlayer.top,
                            left: targetPlayer.left,
                            isOutOfPosition: sourcePlayer.position !== 'POLI' && sourcePlayer.position !== targetPlayer.role
                        };
                        sourceList[activeData.idx] = { ...targetPlayer, top: undefined, left: undefined, role: undefined, isOutOfPosition: undefined };
                    }
                }
            }

            // Solo recalcular si hay transferencia entre equipos diferentes
            if (sourceTeam.id !== targetTeam.id) {
                recalculateTeamStats(sourceTeam);
                recalculateTeamStats(targetTeam);
            }
            // Swaps dentro del mismo equipo NO cambian el score
            setTournamentTeams(newTeams);
            return;
        }

        // Case 2: Dropped on team card (transfer to bench)
        if (overId.startsWith('team-')) {
            const targetTeamId = parseInt(overId.replace('team-', ''));

            if (targetTeamId === activeData.teamId) return;

            const newTeams = JSON.parse(JSON.stringify(tournamentTeams));
            const sourceTeam = newTeams.find(t => t.id === activeData.teamId);
            const targetTeam = newTeams.find(t => t.id === targetTeamId);

            if (!sourceTeam || !targetTeam) return;

            let playerToMove;
            if (activeData.origin === 'starter') {
                const p = sourceTeam.starters[activeData.idx];
                playerToMove = { ...p, top: undefined, left: undefined, role: undefined, isOutOfPosition: undefined };
                // Vacante limpia: solo datos del slot
                sourceTeam.starters[activeData.idx] = {
                    name: 'FALTA UNO',
                    vacante: true,
                    role: p.role,
                    top: p.top,
                    left: p.left
                };
            } else {
                playerToMove = sourceTeam.bench[activeData.idx];
                sourceTeam.bench.splice(activeData.idx, 1);
            }

            targetTeam.bench.push(playerToMove);
            recalculateTeamStats(sourceTeam);
            recalculateTeamStats(targetTeam);
            setTournamentTeams(newTeams);
        }
    };

    const handleTeamSwap = (targetTeamId) => {
        if (!swapModal) return;

        const newTeams = JSON.parse(JSON.stringify(tournamentTeams));
        const sourceTeam = newTeams.find(t => t.id === swapModal.teamId);
        const targetTeam = newTeams.find(t => t.id === targetTeamId);

        if (!sourceTeam || !targetTeam) return;

        let playerToMove;
        if (swapModal.origin === 'starter') {
            const p = sourceTeam.starters[swapModal.idx];
            playerToMove = { ...p, top: undefined, left: undefined, role: undefined, isOutOfPosition: undefined };
            // Vacante limpia: solo datos del slot
            sourceTeam.starters[swapModal.idx] = {
                name: 'FALTA UNO',
                vacante: true,
                role: p.role,
                top: p.top,
                left: p.left
            };
        } else {
            playerToMove = sourceTeam.bench[swapModal.idx];
            sourceTeam.bench.splice(swapModal.idx, 1);
        }

        targetTeam.bench.push(playerToMove);
        recalculateTeamStats(sourceTeam);
        recalculateTeamStats(targetTeam);
        setTournamentTeams(newTeams);
        setSwapModal(null);
    };

    return (
        <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
        >
            <div className="min-h-screen bg-slate-950 flex flex-col">
                {/* Header */}
                <div className="p-3 sm:p-4 md:p-6 border-b border-slate-800 bg-slate-950 sticky top-0 z-30">
                    {/* Tournament Info */}
                    <div className="text-center mb-3 sm:mb-4">
                        <h1 className="text-lg sm:text-xl md:text-2xl font-black text-white uppercase tracking-tight">{tournamentName || 'Torneo'}</h1>
                        {tournamentStartDate && tournamentEndDate && (
                            <p className="text-slate-400 text-xs mt-0.5">
                                {formatDate(tournamentStartDate)} — {formatDate(tournamentEndDate)}
                            </p>
                        )}
                    </div>

                    {/* Controls */}
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4 bg-slate-900 p-3 rounded-lg border border-slate-800">
                        <button
                            onClick={() => navigate('tournament')}
                            className="flex items-center gap-2 text-slate-400 hover:text-white transition self-start sm:self-auto"
                        >
                            <ArrowLeft size={18} className="sm:w-5 sm:h-5" /> <span className="text-sm sm:text-base">Vista Cancha</span>
                        </button>
                        <span className="text-slate-500 text-xs sm:text-sm hidden sm:block">{tournamentTeams.length} equipos</span>
                        <div className="flex gap-2 w-full sm:w-auto">
                            <button
                                onClick={() => setIsEditMode(!isEditMode)}
                                className={`flex-1 sm:flex-none flex items-center justify-center gap-1 sm:gap-2 px-3 sm:px-4 py-2 rounded-lg transition border text-sm ${isEditMode ? 'bg-emerald-600 border-emerald-500 text-white' : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'}`}
                            >
                                {isEditMode ? <Save size={16} /> : <Pencil size={16} />}
                                <span>{isEditMode ? 'Guardar' : 'Editar'}</span>
                            </button>
                            <button
                                onClick={() => generatePDF(tournamentTeams)}
                                className="flex-1 sm:flex-none flex items-center justify-center gap-1 sm:gap-2 px-3 sm:px-4 py-2 bg-red-600/20 text-red-400 rounded-lg hover:bg-red-600 hover:text-white transition border border-red-600/50 text-sm"
                            >
                                <FileText size={16} /> PDF
                            </button>
                        </div>
                    </div>
                    {isEditMode && (
                        <p className="text-center text-emerald-400 text-xs sm:text-sm mt-2 sm:mt-3 animate-pulse">
                            Arrastra jugadores para intercambiar posiciones
                        </p>
                    )}
                </div>

                {/* Teams Container */}
                <div className="flex-1 p-3 sm:p-4 md:p-6 overflow-hidden">
                    <div
                        ref={scrollContainerRef}
                        className="h-full overflow-x-scroll overflow-y-auto pb-2"
                        style={{
                            scrollbarWidth: 'thin',
                            scrollbarColor: '#10b981 #334155'
                        }}
                    >
                        <div className="flex gap-3 sm:gap-4 pb-4 min-w-max">
                            {tournamentTeams.map((team) => (
                                <DroppableTeamCard key={team.id} team={team} isEditMode={isEditMode}>
                                    <div className="bg-emerald-600 p-2 sm:p-3 text-center">
                                        <h2 className="text-base sm:text-lg font-black text-white uppercase tracking-wide">{team.name}</h2>
                                        <p className="text-[10px] sm:text-xs text-emerald-200 mt-0.5 sm:mt-1">
                                            Jugadores: {team.starters.filter(p => !p.vacante).length + team.bench.length}
                                        </p>
                                    </div>

                                    <div className="p-1.5 sm:p-2">
                                        <table className="w-full text-xs sm:text-sm">
                                            <thead>
                                                <tr className="text-slate-500 text-xs uppercase tracking-wider">
                                                    <th className="text-left py-2 px-2 font-medium">Pos</th>
                                                    <th className="text-left py-2 px-2 font-medium">Nombre</th>
                                                    {isEditMode && <th className="w-8"></th>}
                                                </tr>
                                            </thead>
                                            {team.starters.map((player, idx) => (
                                                <DraggableRow
                                                    key={`starter-${team.id}-${idx}`}
                                                    id={`starter-${team.id}-${idx}`}
                                                    player={player}
                                                    isEditMode={isEditMode}
                                                    teamId={team.id}
                                                    origin="starter"
                                                    idx={idx}
                                                    isBeingDragged={draggedId === `starter-${team.id}-${idx}`}
                                                    onSwapClick={() => setSwapModal({ player, teamId: team.id, origin: 'starter', idx })}
                                                />
                                            ))}

                                            {team.bench.length > 0 && (
                                                <tbody>
                                                    <tr>
                                                        <td colSpan={isEditMode ? 3 : 2} className="py-2 px-2 text-xs text-slate-600 uppercase tracking-widest text-center bg-slate-800/50">
                                                            Suplentes
                                                        </td>
                                                    </tr>
                                                </tbody>
                                            )}

                                            {team.bench.map((player, idx) => (
                                                <DraggableRow
                                                    key={`bench-${team.id}-${idx}`}
                                                    id={`bench-${team.id}-${idx}`}
                                                    player={player}
                                                    isEditMode={isEditMode}
                                                    teamId={team.id}
                                                    origin="bench"
                                                    idx={idx}
                                                    isBeingDragged={draggedId === `bench-${team.id}-${idx}`}
                                                    onSwapClick={() => setSwapModal({ player, teamId: team.id, origin: 'bench', idx })}
                                                />
                                            ))}
                                        </table>
                                    </div>
                                </DroppableTeamCard>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Footer con navegación siempre visible */}
                <div className="p-3 sm:p-4 border-t border-slate-800 bg-slate-900 flex items-center justify-center gap-3 sm:gap-4">
                    <button
                        onClick={scrollLeft}
                        className="p-2 sm:p-3 bg-slate-800 hover:bg-emerald-600 rounded-full text-white border border-slate-700 transition-all hover:scale-110 shadow-lg"
                        title="Equipo anterior"
                    >
                        <ChevronLeft size={20} className="sm:w-6 sm:h-6" />
                    </button>
                    <span className="text-slate-500 text-xs sm:text-sm">Navegar entre equipos</span>
                    <button
                        onClick={scrollRight}
                        className="p-2 sm:p-3 bg-slate-800 hover:bg-emerald-600 rounded-full text-white border border-slate-700 transition-all hover:scale-110 shadow-lg"
                        title="Siguiente equipo"
                    >
                        <ChevronRight size={20} className="sm:w-6 sm:h-6" />
                    </button>
                </div>

                {/* DragOverlay - Follows the cursor with player name */}
                <DragOverlay dropAnimation={null}>
                    {draggedData && (
                        <div className="bg-emerald-600 text-white px-4 py-2 rounded-lg shadow-2xl font-bold text-sm border-2 border-white flex items-center gap-2">
                            <span className="text-emerald-200 text-xs">{draggedData.player.position || draggedData.player.role}</span>
                            <span>{draggedData.player.name}</span>
                        </div>
                    )}
                </DragOverlay>

                {/* Swap Modal */}
                {swapModal && (
                    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
                        <div className="bg-slate-900 border border-slate-700 p-6 rounded-xl max-w-sm w-full">
                            <h3 className="text-xl font-bold text-white mb-4">Mover Jugador</h3>
                            <p className="text-slate-400 mb-4">¿A qué equipo quieres mover a <span className="text-white font-bold">{swapModal.player.name}</span>?</p>
                            <div className="flex flex-col gap-2 max-h-60 overflow-y-auto">
                                {tournamentTeams.map(t => t.id !== swapModal.teamId && (
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
            </div>
        </DndContext>
    );
}
