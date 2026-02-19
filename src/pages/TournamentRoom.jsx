import { useState } from 'react';
import useAppStore from '../store';
import { ChevronLeft, ChevronRight, RotateCcw, FileText, Pencil, Save, Table2, User, Shield, Users } from 'lucide-react';
import { generatePDF } from '../utils/pdfGenerator';
import { recalculateTeamStats } from '../utils/tournamentMaker';
import { isPositionCompatible } from '../utils/positionUtils';
import { DndContext, DragOverlay, closestCenter, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';

// Shared
import SwapPlayerModal from '../components/shared/SwapPlayerModal';
import Button from '../components/ui/Button';

// Features (TournamentRoom)
import DraggablePlayer from '../components/features/tournament-room/DraggablePlayer';
import BenchPlayer from '../components/features/tournament-room/BenchPlayer';
import { FieldSlot, BenchDroppableArea } from '../components/features/tournament-room/DropZones';

// Local Action Button for the top bar (kept simple here or could be moved to UI)
function ActionButton({ onClick, icon: Icon, label, active, danger }) {
    return (
        <button
            onClick={onClick}
            className={`
                group flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl transition-all duration-300 border backdrop-blur-sm
                ${active
                    ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-400 shadow-[0_0_20px_-5px_rgba(16,185,129,0.3)]'
                    : `bg-white/5 hover:bg-white/10 ${danger ? 'border-red-500/20 hover:border-red-500/40' : 'border-white/5 hover:border-white/20'}`
                }
                ${!active && (danger ? 'text-red-400 hover:text-red-300' : 'text-slate-400 hover:text-white')}
            `}
            title={label}
        >
            <Icon size={18} className="transition-transform duration-300 group-hover:scale-110" />
            {label && <span className="hidden sm:inline font-semibold text-xs uppercase tracking-wider">{label}</span>}
        </button>
    );
}

export default function TournamentRoom() {
    const { tournamentTeams, setTournamentTeams, reset, navigate, tournamentName, tournamentStartDate, tournamentEndDate, addToast, showPushNotification } = useAppStore();

    const formatDate = (dateStr) => {
        if (!dateStr) return '';
        const date = new Date(dateStr + 'T00:00:00');
        return date.toLocaleDateString('es-AR', { day: 'numeric', month: 'short' });
    };

    const [currentIndex, setCurrentIndex] = useState(0);
    const [isEditMode, setIsEditMode] = useState(false);
    const [swapModal, setSwapModal] = useState(null);

    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
    );

    const currentTeam = tournamentTeams[currentIndex];

    if (!currentTeam) return <div className="text-white p-10 bg-slate-950 h-screen flex items-center justify-center">Cargando...</div>;

    const nextTeam = () => setCurrentIndex(prev => (prev + 1) % tournamentTeams.length);
    const prevTeam = () => setCurrentIndex(prev => (prev - 1 + tournamentTeams.length) % tournamentTeams.length);

    const handleDragEnd = (event) => {
        const { active, over } = event;
        if (!over) return;

        const activeId = active.id;
        const overId = over.id;

        if (activeId === overId) return;

        const newTeams = JSON.parse(JSON.stringify(tournamentTeams));
        const team = newTeams[currentIndex];
        const starters = team.starters;
        const bench = team.bench;
        const activeData = active.data.current;

        // Logic maintained
        if (activeData.origin === 'bench') {
            const benchIdx = bench.findIndex(p => `bench-${p.id}` === activeId);
            const player = bench[benchIdx];
            if (overId.startsWith('slot-')) {
                const slotIdx = parseInt(overId.split('-')[1]);
                const targetSlot = starters[slotIdx];
                bench.splice(benchIdx, 1);
                if (!targetSlot.vacante) {
                    bench.push({ ...targetSlot, top: undefined, left: undefined, role: undefined, isOutOfPosition: undefined });
                }
                const isOutOfPosition = !isPositionCompatible(player.position, targetSlot.role, player.altPosition);
                starters[slotIdx] = {
                    ...player,
                    role: targetSlot.role, top: targetSlot.top, left: targetSlot.left,
                    isOutOfPosition
                };
                team.starters = starters;
                team.bench = bench;
                newTeams[currentIndex] = team;
                setTournamentTeams(newTeams);
                addToast({ type: 'success', message: `"${player.name}" ingreso como titular` });
                if (isOutOfPosition) {
                    addToast({ type: 'warning', message: `"${player.name}" esta jugando fuera de posicion (${player.position})` });
                }
                return;
            }
        } else if (activeData.origin === 'field') {
            const sIdx = parseInt(activeId.replace('starter-', ''));
            if (isNaN(sIdx) || sIdx < 0 || sIdx >= starters.length) return;
            const player = starters[sIdx];
            if (overId.startsWith('slot-')) {
                const targetIdx = parseInt(overId.split('-')[1]);
                if (sIdx === targetIdx) return;
                const targetPlayer = starters[targetIdx];
                const playerOutOfPosition = !isPositionCompatible(player.position, targetPlayer.role, player.altPosition);
                const targetOutOfPosition = !isPositionCompatible(targetPlayer.position, player.role, targetPlayer.altPosition);
                starters[targetIdx] = { ...player, top: targetPlayer.top, left: targetPlayer.left, role: targetPlayer.role, isOutOfPosition: playerOutOfPosition };
                starters[sIdx] = { ...targetPlayer, top: player.top, left: player.left, role: player.role, isOutOfPosition: targetOutOfPosition };
                team.starters = starters;
                team.bench = bench;
                newTeams[currentIndex] = team;
                setTournamentTeams(newTeams);
                if (!player.vacante && !targetPlayer.vacante) {
                    addToast({ type: 'success', message: `"${player.name}" y "${targetPlayer.name}" intercambiaron posiciones` });
                    if (playerOutOfPosition) {
                        addToast({ type: 'warning', message: `"${player.name}" esta jugando fuera de posicion (${player.position})` });
                    }
                    if (targetOutOfPosition) {
                        addToast({ type: 'warning', message: `"${targetPlayer.name}" esta jugando fuera de posicion (${targetPlayer.position})` });
                    }
                }
                return;
            } else if (overId === 'bench-zone') {
                if (!player.vacante) {
                    starters[sIdx] = { name: 'FALTA UNO', vacante: true, role: player.role, top: player.top, left: player.left };
                    bench.push({ ...player, top: undefined, left: undefined, role: undefined, isOutOfPosition: undefined });
                    team.starters = starters;
                    team.bench = bench;
                    newTeams[currentIndex] = team;
                    setTournamentTeams(newTeams);
                    addToast({ type: 'success', message: `"${player.name}" paso al banco` });
                    return;
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
        const newTeams = JSON.parse(JSON.stringify(tournamentTeams));
        const sourceTeam = newTeams[currentIndex];
        const targetTeam = newTeams.find(t => t.id === targetTeamId);
        if (!targetTeam) return;

        let playerToMove;
        if (swapModal.origin === 'field') {
            const p = sourceTeam.starters[swapModal.idx];
            playerToMove = { ...p, top: undefined, left: undefined, role: undefined, isOutOfPosition: undefined };
            sourceTeam.starters[swapModal.idx] = { name: 'FALTA UNO', vacante: true, role: p.role, top: p.top, left: p.left };
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
    const handleCaptainToggle = (origin, idx) => {
        const newTeams = JSON.parse(JSON.stringify(tournamentTeams));
        const team = newTeams[currentIndex];

        // Clear existing captain in this team
        team.starters.forEach(p => p.isCaptain = false);
        team.bench.forEach(p => p.isCaptain = false);

        // Get the player and set as captain
        const playerList = origin === 'field' ? team.starters : team.bench;
        playerList[idx].isCaptain = true;

        setTournamentTeams(newTeams);
    };

    // Handle team name change
    const handleTeamNameChange = (newName) => {
        const newTeams = JSON.parse(JSON.stringify(tournamentTeams));
        newTeams[currentIndex].name = newName;
        setTournamentTeams(newTeams);
    };

    // Handle save changes
    const handleToggleEditMode = () => {
        if (isEditMode) {
            showPushNotification('Cambios guardados');
        }
        setIsEditMode(!isEditMode);
    };

    return (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <div className="h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-[#0a0a0a] to-black flex flex-col lg:flex-row overflow-hidden text-slate-200 select-none font-sans antialiased">

                {/* --- LEFT COLUMN: Main Content --- */}
                <div className="flex-1 flex flex-col min-w-0 relative">

                    {/* Decorative Top Glow */}
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[80%] h-32 bg-emerald-500/10 blur-[100px] pointer-events-none z-0"></div>

                    {/* Top Bar: Navigation & Info */}
                    <div className="flex items-center justify-between px-3 py-3 sm:px-6 sm:py-4 lg:px-8 lg:py-5 border-b border-white/5 bg-slate-950/30 backdrop-blur-md z-20">
                        {/* Title Section */}
                        <div className="flex flex-col min-w-0">
                            <h1 className="text-base sm:text-xl md:text-2xl font-black text-white uppercase tracking-tight flex items-center gap-2 sm:gap-3 drop-shadow-md truncate">
                                <span className="truncate">{tournamentName || 'TORNEO'}</span>
                                {tournamentStartDate && (
                                    <span className="hidden sm:inline-flex text-[10px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full tracking-wider flex-shrink-0">
                                        {formatDate(tournamentStartDate)} - {formatDate(tournamentEndDate)}
                                    </span>
                                )}
                            </h1>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-1.5 sm:gap-3 flex-shrink-0">
                            <ActionButton onClick={reset} icon={RotateCcw} label="Inicio" />
                            <ActionButton onClick={() => navigate('playerSetup')} icon={Users} label="Jugadores" />
                            <ActionButton onClick={() => navigate('teamsTable')} icon={Table2} label="Tabla" />
                            <ActionButton onClick={() => generatePDF(tournamentTeams)} icon={FileText} label="PDF" />
                        </div>
                    </div>

                    {/* Team Header & Navigation Center */}
                    <div className="flex items-center justify-between px-3 py-2 sm:px-6 sm:py-3 lg:px-8 lg:py-4 relative z-10">
                        <ActionButton onClick={prevTeam} icon={ChevronLeft} />

                        <div className="flex-1 flex flex-col items-center justify-center min-w-0 px-2">
                            <span className="text-slate-500 text-[10px] font-bold uppercase tracking-[0.3em] mb-1">
                                Equipo {currentIndex + 1} / {tournamentTeams.length}
                            </span>
                            {isEditMode ? (
                                <input
                                    type="text"
                                    value={currentTeam.name}
                                    onChange={(e) => handleTeamNameChange(e.target.value)}
                                    className="text-xl sm:text-3xl lg:text-5xl font-black text-white uppercase tracking-tighter text-center bg-white/10 border border-white/20 rounded-xl px-2 py-1 sm:px-4 sm:py-2 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/30 max-w-full sm:max-w-md w-full"
                                />
                            ) : (
                                <h2 className="text-2xl sm:text-4xl lg:text-6xl font-black text-white uppercase tracking-tighter drop-shadow-2xl bg-gradient-to-b from-white to-slate-400 bg-clip-text text-transparent truncate max-w-full">
                                    {currentTeam.name}
                                </h2>
                            )}
                        </div>

                        <ActionButton onClick={nextTeam} icon={ChevronRight} />
                    </div>

                    {/* Pitch Container */}
                    <div className="flex-1 flex items-center justify-center p-2 sm:p-4 lg:p-6 min-h-0 relative">
                        <div className={`
                            relative w-full h-full max-w-[850px] aspect-[4/3] rounded-xl sm:rounded-2xl lg:rounded-[2.5rem] overflow-hidden
                            bg-[#0B0F15] shadow-2xl border border-white/5 ring-1 ring-white/5
                         `}>
                            {/* Abstract Field Pattern */}
                            <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:24px_24px] mix-blend-overlay"></div>

                            {/* Subtle Gradient Overlay */}
                            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 via-transparent to-emerald-500/5"></div>

                            {/* Standard White Lines (Glassy) */}
                            <div className="absolute inset-3 sm:inset-4 lg:inset-6 border lg:border-2 border-white/10 rounded-xl lg:rounded-2xl pointer-events-none"></div>
                            <div className="absolute top-1/2 w-full h-px lg:h-0.5 bg-white/10 pointer-events-none"></div>
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 sm:w-24 sm:h-24 lg:w-32 lg:h-32 border lg:border-2 border-white/10 rounded-full pointer-events-none bg-[#0B0F15]/50 backdrop-blur-sm"></div>

                            {/* Players */}
                            {currentTeam.starters.map((p, idx) => (
                                <FieldSlot key={`slot-${idx}`} index={idx} player={p}>
                                    <DraggablePlayer
                                        id={`starter-${idx}`}
                                        player={p}
                                        isEditMode={isEditMode}
                                        onClick={() => setSwapModal({ player: p, teamIndex: currentIndex, origin: 'field', idx })}
                                        onCaptainClick={() => handleCaptainToggle('field', idx)}
                                        isCaptain={p.isCaptain}
                                    />
                                </FieldSlot>
                            ))}
                        </div>
                    </div>
                </div>

                {/* --- RIGHT COLUMN: Sidebar (Clean Cards) --- */}
                <div className={`w-full lg:w-80 xl:w-96 max-h-[35vh] lg:max-h-none bg-slate-950/50 border-t lg:border-t-0 lg:border-l border-white/5 backdrop-blur-2xl flex flex-col z-30 shadow-2xl overflow-hidden`}>

                    {/* Header */}
                    <div className="p-3 sm:p-4 lg:p-6 border-b border-white/5">
                        <h3 className="text-xs font-black text-white uppercase tracking-widest flex items-center gap-2 opacity-80">
                            <Shield size={14} className="text-emerald-500" /> Estadísticas
                        </h3>
                    </div>

                    <div className="flex-1 flex flex-col p-3 sm:p-4 lg:p-6 gap-3 sm:gap-4 lg:gap-6 overflow-y-auto custom-scrollbar">
                        {/* Stats Grid */}
                        <div className="grid grid-cols-2 gap-2 sm:gap-4">
                            <div className="bg-white/5 border border-white/5 p-3 sm:p-5 rounded-xl sm:rounded-2xl flex flex-col items-center justify-center transition hover:bg-white/10">
                                <span className="text-2xl sm:text-4xl font-black text-emerald-400 drop-shadow-lg">{currentTeam.stats.score}</span>
                                <span className="text-[10px] uppercase tracking-wider text-slate-500 font-bold mt-1">Valoración</span>
                            </div>
                            <div className="bg-white/5 border border-white/5 p-3 sm:p-5 rounded-xl sm:rounded-2xl flex flex-col items-center justify-center transition hover:bg-white/10">
                                <span className="text-2xl sm:text-4xl font-black text-white drop-shadow-lg">{currentTeam.stats.avgAge}</span>
                                <span className="text-[10px] uppercase tracking-wider text-slate-500 font-bold mt-1">Edad Prom.</span>
                            </div>
                        </div>

                        {/* Squad Details */}
                        <div className="bg-white/5 border border-white/5 rounded-xl sm:rounded-2xl p-3 sm:p-6 shadow-sm">
                            <div className="space-y-4">
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-slate-400 font-medium">Titulares</span>
                                    <span className="bg-slate-800/80 text-white px-3 py-1 rounded-lg text-xs font-bold border border-white/5">{currentTeam.starters.filter(p => !p.vacante).length}</span>
                                </div>
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-slate-400 font-medium">Suplentes</span>
                                    <span className="bg-slate-800/80 text-white px-3 py-1 rounded-lg text-xs font-bold border border-white/5">{currentTeam.bench.length}</span>
                                </div>
                            </div>
                        </div>

                        {/* Bench */}
                        <div className="flex-1 flex flex-col min-h-0">
                            <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2 ml-1">
                                <User size={12} className="text-emerald-500" /> Suplentes Dispersos
                            </h3>
                            <BenchDroppableArea>
                                <div className="flex flex-col gap-3">
                                    {currentTeam.bench.length === 0 ? (
                                        <div className="flex flex-col items-center justify-center py-10 text-slate-600">
                                            <span className="text-xs font-bold tracking-widest opacity-50">VACÍO</span>
                                        </div>
                                    ) : (
                                        currentTeam.bench.map((sub, idx) => (
                                            <BenchPlayer
                                                key={`bench-${currentIndex}-${sub.id || idx}`}
                                                id={`bench-${sub.id}`}
                                                player={sub}
                                                isEditMode={isEditMode}
                                                onClick={() => setSwapModal({ player: sub, teamIndex: currentIndex, origin: 'bench', idx })}
                                                onCaptainClick={() => handleCaptainToggle('bench', idx)}
                                                isCaptain={sub.isCaptain}
                                            />
                                        ))
                                    )}
                                </div>
                            </BenchDroppableArea>
                        </div>
                    </div>

                    {/* Footer Actions */}
                    <div className="p-3 sm:p-4 lg:p-6 border-t border-white/5 bg-black/20">
                        <Button
                            onClick={handleToggleEditMode}
                            icon={isEditMode ? Save : Pencil}
                            className={`w-full py-3 sm:py-4 text-xs
                                ${isEditMode
                                    ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-900 shadow-[0_0_20px_rgba(16,185,129,0.4)]'
                                    : 'bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10'
                                }
                            `}
                        >
                            {isEditMode ? 'Guardar Cambios' : 'Modificar Equipo'}
                        </Button>
                    </div>
                </div>

                {/* Swap Modal */}
                <SwapPlayerModal
                    isOpen={!!swapModal}
                    onClose={() => setSwapModal(null)}
                    player={swapModal?.player}
                    currentTeamId={currentTeam.id}
                    teams={tournamentTeams}
                    onSwap={handleTeamSwap}
                />

                <DragOverlay dropAnimation={null} />
            </div>
        </DndContext>
    );
}
