import { useState, useRef } from 'react';
import useAppStore from '../store';
import { ArrowLeft, FileText, Pencil, Save, ChevronLeft, ChevronRight } from 'lucide-react';
import { generatePDF } from '../utils/pdfGenerator';
import { recalculateTeamStats } from '../utils/tournamentMaker';
import { isPositionCompatible } from '../utils/positionUtils';
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors, DragOverlay } from '@dnd-kit/core';

// Shared Components
import SwapPlayerModal from '../components/shared/SwapPlayerModal';
import Button from '../components/ui/Button';

// Features (TeamsTable)
import DraggableRow from '../components/features/teams-table/DraggableRow';
import DroppableTeamCard from '../components/features/teams-table/DroppableTeamCard';


export default function TeamsTable() {
    const { tournamentTeams, setTournamentTeams, navigate, tournamentName, tournamentStartDate, tournamentEndDate, addToast, showPushNotification } = useAppStore();

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
        scrollContainerRef.current?.scrollBy({ left: -340, behavior: 'smooth' });
    };
    const scrollRight = () => {
        scrollContainerRef.current?.scrollBy({ left: 340, behavior: 'smooth' });
    };

    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
    );

    if (!tournamentTeams || tournamentTeams.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-slate-950">
                <p className="text-slate-400">No hay equipos generados.</p>
                <button onClick={() => navigate('home')} className="mt-4 text-emerald-400 hover:text-emerald-300 font-medium">Volver al inicio</button>
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
                const sourceOutOfPosition = !isPositionCompatible(sourcePlayer.position, targetPlayer.role, sourcePlayer.altPosition);
                if (targetOrigin === 'starter') {
                    targetList[targetIdx] = {
                        ...sourcePlayer,
                        role: targetPlayer.role,
                        top: targetPlayer.top,
                        left: targetPlayer.left,
                        isOutOfPosition: sourceOutOfPosition
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

                // Toast warning si está fuera de posición
                if (targetOrigin === 'starter' && sourceOutOfPosition) {
                    setTournamentTeams(newTeams);
                    addToast({ type: 'success', message: `"${sourcePlayer.name}" ingreso como titular` });
                    addToast({ type: 'warning', message: `"${sourcePlayer.name}" esta jugando fuera de posicion (${sourcePlayer.position})` });
                    return;
                }
            } else {
                // Full swap
                const sourceOutOfPosition = !isPositionCompatible(sourcePlayer.position, targetPlayer.role, sourcePlayer.altPosition);
                const targetOutOfPosition = !isPositionCompatible(targetPlayer.position, sourcePlayer.role, targetPlayer.altPosition);

                if (activeData.origin === 'starter' && targetOrigin === 'starter') {
                    sourceList[activeData.idx] = {
                        ...targetPlayer,
                        role: sourcePlayer.role,
                        top: sourcePlayer.top,
                        left: sourcePlayer.left,
                        isOutOfPosition: targetOutOfPosition
                    };
                    targetList[targetIdx] = {
                        ...sourcePlayer,
                        role: targetPlayer.role,
                        top: targetPlayer.top,
                        left: targetPlayer.left,
                        isOutOfPosition: sourceOutOfPosition
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
                            isOutOfPosition: targetOutOfPosition
                        };
                        targetList[targetIdx] = { ...sourcePlayer, top: undefined, left: undefined, role: undefined, isOutOfPosition: undefined };
                    } else {
                        targetList[targetIdx] = {
                            ...sourcePlayer,
                            role: targetPlayer.role,
                            top: targetPlayer.top,
                            left: targetPlayer.left,
                            isOutOfPosition: sourceOutOfPosition
                        };
                        sourceList[activeData.idx] = { ...targetPlayer, top: undefined, left: undefined, role: undefined, isOutOfPosition: undefined };
                    }
                }
            }

            // Solo recalcular si hay transferencia entre equipos diferentes
            if (sourceTeam.id !== targetTeam.id) {
                recalculateTeamStats(sourceTeam);
                recalculateTeamStats(targetTeam);
                setTournamentTeams(newTeams);
                addToast({ type: 'success', message: `"${sourcePlayer.name}" transferido a ${targetTeam.name}` });
                // Warning si queda fuera de posición
                const movedPlayer = targetList[targetIdx];
                if (movedPlayer && movedPlayer.isOutOfPosition) {
                    addToast({ type: 'warning', message: `"${sourcePlayer.name}" esta jugando fuera de posicion (${sourcePlayer.position})` });
                }
            } else {
                // Swaps dentro del mismo equipo NO cambian el score
                setTournamentTeams(newTeams);
                if (!sourcePlayer.vacante && !targetPlayer.vacante) {
                    addToast({ type: 'success', message: `"${sourcePlayer.name}" y "${targetPlayer.name}" intercambiaron posiciones` });
                    // Check out of position para ambos jugadores después del swap
                    const newSourcePlayer = sourceList[activeData.idx];
                    const newTargetPlayer = targetList[targetIdx];
                    if (newTargetPlayer && newTargetPlayer.isOutOfPosition) {
                        addToast({ type: 'warning', message: `"${sourcePlayer.name}" esta jugando fuera de posicion (${sourcePlayer.position})` });
                    }
                    if (newSourcePlayer && newSourcePlayer.isOutOfPosition) {
                        addToast({ type: 'warning', message: `"${targetPlayer.name}" esta jugando fuera de posicion (${targetPlayer.position})` });
                    }
                }
            }
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
            addToast({ type: 'success', message: `"${playerToMove.name}" enviado al banco de ${targetTeam.name}` });
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
        addToast({ type: 'success', message: `"${playerToMove.name}" transferido a ${targetTeam.name}` });
    };

    // Handle captain selection
    const handleCaptainToggle = (teamId, playerId, origin, idx) => {
        const newTeams = JSON.parse(JSON.stringify(tournamentTeams));
        const team = newTeams.find(t => t.id === teamId);

        if (!team) return;

        // Clear existing captain in this team
        team.starters.forEach(p => p.isCaptain = false);
        team.bench.forEach(p => p.isCaptain = false);

        // Get the player and toggle captain status
        const playerList = origin === 'starter' ? team.starters : team.bench;
        const player = playerList[idx];

        // Only set captain if the player wasn't already captain
        if (!player.isCaptain) {
            player.isCaptain = true;
        }

        setTournamentTeams(newTeams);
    };

    // Handle team name change
    const handleTeamNameChange = (teamId, newName) => {
        const newTeams = JSON.parse(JSON.stringify(tournamentTeams));
        const team = newTeams.find(t => t.id === teamId);

        if (!team) return;

        team.name = newName;
        setTournamentTeams(newTeams);
    };

    return (
        <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
        >
            <div className="h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-[#0a0a0a] to-black flex flex-col font-sans antialiased text-slate-200 overflow-hidden">
                {/* Header */}
                <div className="shrink-0 px-3 py-2.5 sm:px-4 sm:py-3 md:px-6 md:py-4 border-b border-white/5 bg-slate-950/50 backdrop-blur-xl z-30 shadow-lg flex items-center justify-between gap-2">
                    {/* Tournament Info */}
                    <div className="flex items-center gap-2 sm:gap-4 md:gap-6 min-w-0">
                        <button
                            onClick={() => navigate('tournament')}
                            className="group flex items-center gap-1.5 sm:gap-2 px-2.5 py-2 sm:px-4 bg-white/5 hover:bg-emerald-500/10 text-slate-400 hover:text-emerald-400 rounded-xl transition-all border border-white/5 hover:border-emerald-500/20 flex-shrink-0"
                            title="Volver a la cancha"
                        >
                            <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
                            <span className="hidden sm:inline text-sm font-bold tracking-wide">TABLERO</span>
                        </button>

                        <div className="flex flex-col min-w-0">
                            <h1 className="text-sm sm:text-lg md:text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-400 uppercase tracking-tighter leading-none truncate">{tournamentName || 'Torneo'}</h1>
                            {(tournamentStartDate && tournamentEndDate) && (
                                <span className="hidden sm:block text-[10px] font-bold text-slate-500 tracking-wide mt-1">
                                    {formatDate(tournamentStartDate)} - {formatDate(tournamentEndDate)}
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Controls */}
                    <div className="flex items-center gap-1.5 sm:gap-3 flex-shrink-0">
                        <div className="hidden md:flex items-center px-4 py-1.5 rounded-full bg-black/40 border border-white/5">
                            <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">{tournamentTeams.length} Equipos</span>
                        </div>

                        <button
                            onClick={() => {
                                if (isEditMode) {
                                    showPushNotification('Cambios guardados');
                                }
                                setIsEditMode(!isEditMode);
                            }}
                            className={`flex items-center justify-center gap-1.5 sm:gap-2 px-2.5 py-2 sm:px-4 rounded-xl transition-all border text-xs font-bold uppercase tracking-wider shadow-lg
                                ${isEditMode
                                    ? 'bg-emerald-500 border-emerald-400 text-slate-950 shadow-emerald-900/40 hover:bg-emerald-400'
                                    : 'bg-white/5 border-white/5 text-slate-400 hover:bg-white/10 hover:text-white hover:border-white/10'
                                }`}
                        >
                            {isEditMode ? <Save size={16} /> : <Pencil size={16} />}
                            <span className="hidden sm:inline">{isEditMode ? 'Guardar' : 'Editar'}</span>
                        </button>
                        <button
                            onClick={() => generatePDF(tournamentTeams, tournamentName)}
                            className="flex items-center justify-center gap-1.5 sm:gap-2 px-2.5 py-2 sm:px-4 bg-rose-500/10 text-rose-400 rounded-xl hover:bg-rose-500 hover:text-white transition-all border border-rose-500/20 hover:border-rose-500 text-xs font-bold uppercase tracking-wider"
                        >
                            <FileText size={16} /> <span className="hidden sm:inline">PDF</span>
                        </button>
                    </div>
                </div>

                {isEditMode && (
                    <div className="shrink-0 bg-emerald-500/10 border-b border-emerald-500/10 py-1.5 text-center relative z-20">
                        <p className="text-emerald-400 text-[10px] font-bold uppercase tracking-[0.2em] animate-pulse">
                            Modo Edición Activado
                        </p>
                    </div>
                )}

                {/* Teams Container */}
                <div className="flex-1 p-2 sm:p-4 md:p-8 overflow-hidden flex flex-col items-center relative z-10">
                    <div
                        ref={scrollContainerRef}
                        className="w-full h-full overflow-x-scroll overflow-y-hidden pb-4 custom-scrollbar scroll-smooth"
                    >
                        <div className="flex gap-3 sm:gap-6 pb-2 min-w-max px-1 sm:px-2 h-full">
                            {tournamentTeams.map((team) => (
                                <DroppableTeamCard key={team.id} team={team} isEditMode={isEditMode}>
                                    {/* Glass Header */}
                                    <div className="bg-white/5 px-4 py-3 border-b border-white/5 backdrop-blur-md relative overflow-hidden group">
                                        <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-emerald-500/10 to-transparent blur-xl rounded-full -translate-y-1/2 translate-x-1/2 group-hover:bg-emerald-500/20 transition-all duration-500"></div>

                                        <div className="flex items-center justify-between relative z-10">
                                            {isEditMode ? (
                                                <input
                                                    type="text"
                                                    value={team.name}
                                                    onChange={(e) => handleTeamNameChange(team.id, e.target.value)}
                                                    className="text-sm sm:text-base font-black text-white uppercase tracking-tight bg-white/10 border border-white/20 rounded-lg px-2 py-1 max-w-[160px] focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/30"
                                                    onClick={(e) => e.stopPropagation()}
                                                />
                                            ) : (
                                                <h2 className="text-sm sm:text-base font-black text-white uppercase tracking-tight truncate max-w-[160px]" title={team.name}>{team.name}</h2>
                                            )}
                                            <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-black/30 border border-white/5">
                                                <span className="w-1 h-1 rounded-full bg-emerald-500"></span>
                                                <span className="text-[9px] uppercase font-bold text-slate-400">
                                                    {team.starters.filter(p => !p.vacante).length + team.bench.length}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="p-1 flex-1 overflow-y-auto custom-scrollbar">
                                        <table className="w-full">
                                            <thead>
                                                <tr className="text-slate-500/60 text-[9px] uppercase tracking-widest border-b border-white/5">
                                                    <th className="text-left py-2 px-3 font-semibold w-12">Pos</th>
                                                    <th className="text-left py-2 px-3 font-semibold">Jugador</th>
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
                                                    onCaptainClick={() => handleCaptainToggle(team.id, player.id, 'starter', idx)}
                                                    isCaptain={player.isCaptain}
                                                />
                                            ))}

                                            {team.bench.length > 0 && (
                                                <tbody>
                                                    <tr>
                                                        <td colSpan={isEditMode ? 3 : 2} className="py-2.5 px-3">
                                                            <div className="flex items-center gap-2 opacity-50">
                                                                <div className="h-px bg-white/10 flex-1"></div>
                                                                <span className="text-[8px] text-slate-400 uppercase font-black tracking-widest">Suplentes</span>
                                                                <div className="h-px bg-white/10 flex-1"></div>
                                                            </div>
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
                                                    onCaptainClick={() => handleCaptainToggle(team.id, player.id, 'bench', idx)}
                                                    isCaptain={player.isCaptain}
                                                />
                                            ))}
                                        </table>
                                    </div>
                                </DroppableTeamCard>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Footer Navigation */}
                <div className="shrink-0 p-3 sm:p-4 border-t border-white/5 bg-slate-950/80 backdrop-blur-xl flex items-center justify-center gap-4 sm:gap-8 relative z-30">
                    <button
                        onClick={scrollLeft}
                        className="group p-2.5 sm:p-4 bg-white/5 hover:bg-emerald-600 hover:text-white rounded-full text-slate-400 border border-white/5 transition-all duration-300 shadow-lg hover:shadow-[0_0_20px_rgba(16,185,129,0.4)]"
                        title="Anterior"
                    >
                        <ChevronLeft size={20} className="sm:w-6 sm:h-6 group-hover:-translate-x-1 transition-transform" />
                    </button>
                    <span className="text-slate-500 text-[10px] font-bold uppercase tracking-[0.2em] sm:tracking-[0.3em] select-none hidden sm:block">Navegar Equipos</span>
                    <button
                        onClick={scrollRight}
                        className="group p-2.5 sm:p-4 bg-white/5 hover:bg-emerald-600 hover:text-white rounded-full text-slate-400 border border-white/5 transition-all duration-300 shadow-lg hover:shadow-[0_0_20px_rgba(16,185,129,0.4)]"
                        title="Siguiente"
                    >
                        <ChevronRight size={20} className="sm:w-6 sm:h-6 group-hover:translate-x-1 transition-transform" />
                    </button>
                </div>

                {/* DragOverlay */}
                <DragOverlay dropAnimation={null}>
                    {draggedData && (
                        <div className="bg-slate-900/90 backdrop-blur-xl text-white px-3 py-2 rounded-lg shadow-2xl border border-emerald-500/50 flex items-center gap-2 ring-1 ring-emerald-500/20">
                            <span className="bg-emerald-500 text-slate-950 text-[9px] font-black px-1.5 py-0.5 rounded">{draggedData.player.position || draggedData.player.role}</span>
                            <span className="font-bold text-xs">{draggedData.player.name}</span>
                        </div>
                    )}
                </DragOverlay>

                {/* Swap Modal */}
                <SwapPlayerModal
                    isOpen={!!swapModal}
                    onClose={() => setSwapModal(null)}
                    player={swapModal?.player}
                    currentTeamId={swapModal?.teamId}
                    teams={tournamentTeams}
                    onSwap={handleTeamSwap}
                />
            </div>
        </DndContext>
    );
}
