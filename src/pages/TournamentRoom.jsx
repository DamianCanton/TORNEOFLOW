import { useState } from 'react';
import useAppStore from '../store';
import { ChevronLeft, ChevronRight, RotateCcw, FileText, Pencil, Save, ArrowRightLeft, Table2, User, Shield, Users, Shirt, Crown } from 'lucide-react';
import { generatePDF } from '../utils/pdfGenerator';
import { recalculateTeamStats } from '../utils/tournamentMaker';
import { DndContext, useDraggable, useDroppable, DragOverlay, closestCenter, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';

// --- Components ---

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
            {label && <span className="font-semibold text-xs uppercase tracking-wider">{label}</span>}
        </button>
    );
}

function DraggablePlayer({ player, id, isEditMode, onClick, onCaptainClick, isCaptain }) {
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
            <div className={`relative flex items-center justify-center transition-all duration-300 hover:scale-110 hover:drop-shadow-[0_0_15px_rgba(255,255,255,0.15)]
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
            <div className={`mt-2 px-3 py-1 rounded-full flex flex-col items-center leading-none pointer-events-none
               bg-slate-950/60 backdrop-blur-md border ${isCaptain ? 'border-amber-500/30' : 'border-white/10'} shadow-[0_4px_10px_rgba(0,0,0,0.5)]
            `}>
                <span className="text-[10px] sm:text-xs font-bold text-slate-100 whitespace-nowrap tracking-tight flex items-center gap-1">
                    {player.vacante ? '?' : player.name}
                    {isCaptain && <span className="text-amber-400 text-[8px] font-black">(C)</span>}
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

function FieldSlot({ index, player, children }) {
    const { setNodeRef, isOver } = useDroppable({
        id: `slot-${index}`,
        data: { index }
    });

    return (
        <div ref={setNodeRef} className={`absolute transform -translate-x-1/2 -translate-y-1/2 w-16 h-16 rounded-full transition-all duration-300 ${isOver ? 'bg-emerald-500/20 scale-125 ring-2 ring-emerald-400/50 shadow-[0_0_20px_rgba(16,185,129,0.3)]' : ''}`} style={{ top: player.top, left: player.left }}>
            {children}
        </div>
    );
}

function BenchPlayer({ player, id, isEditMode, onClick, onCaptainClick, isCaptain }) {
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

function BenchDroppableArea({ children }) {
    const { setNodeRef, isOver } = useDroppable({
        id: 'bench-zone'
    });
    return (
        <div ref={setNodeRef} className={`rounded-xl transition-all duration-300 p-2 min-h-[120px] bg-black/20 border-2 ${isOver ? 'border-dashed border-emerald-500/50 bg-emerald-500/5' : 'border-transparent'}`}>
            {children}
        </div>
    );
}

// --- Main Layout ---

export default function TournamentRoom() {
    const { tournamentTeams, setTournamentTeams, reset, navigate, tournamentName, tournamentStartDate, tournamentEndDate } = useAppStore();

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
                starters[slotIdx] = {
                    ...player,
                    role: targetSlot.role, top: targetSlot.top, left: targetSlot.left,
                    isOutOfPosition: player.position !== 'POLI' && player.position !== targetSlot.role
                };
            }
        } else if (activeData.origin === 'field') {
            const sIdx = parseInt(activeId.replace('starter-', ''));
            if (isNaN(sIdx) || sIdx < 0 || sIdx >= starters.length) return;
            const player = starters[sIdx];
            if (overId.startsWith('slot-')) {
                const targetIdx = parseInt(overId.split('-')[1]);
                if (sIdx === targetIdx) return;
                const targetPlayer = starters[targetIdx];
                starters[targetIdx] = { ...player, top: targetPlayer.top, left: targetPlayer.left, role: targetPlayer.role };
                starters[sIdx] = { ...targetPlayer, top: player.top, left: player.left, role: player.role };
            } else if (overId === 'bench-zone') {
                if (!player.vacante) {
                    starters[sIdx] = { name: 'FALTA UNO', vacante: true, role: player.role, top: player.top, left: player.left };
                    bench.push({ ...player, top: undefined, left: undefined, role: undefined, isOutOfPosition: undefined });
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

    return (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <div className="h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-[#0a0a0a] to-black flex flex-col lg:flex-row overflow-hidden text-slate-200 select-none font-sans antialiased">

                {/* --- LEFT COLUMN: Main Content --- */}
                <div className="flex-1 flex flex-col min-w-0 relative">

                    {/* Decorative Top Glow */}
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[80%] h-32 bg-emerald-500/10 blur-[100px] pointer-events-none z-0"></div>

                    {/* Top Bar: Navigation & Info */}
                    <div className="flex items-center justify-between px-8 py-5 border-b border-white/5 bg-slate-950/30 backdrop-blur-md z-20">
                        {/* Title Section */}
                        <div className="flex flex-col">
                            <h1 className="text-xl sm:text-2xl font-black text-white uppercase tracking-tight flex items-center gap-3 drop-shadow-md">
                                {tournamentName || 'TORNEO'}
                                {tournamentStartDate && (
                                    <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full tracking-wider">
                                        {formatDate(tournamentStartDate)} - {formatDate(tournamentEndDate)}
                                    </span>
                                )}
                            </h1>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-3">
                            <ActionButton onClick={reset} icon={RotateCcw} label="Inicio" />
                            <ActionButton onClick={() => navigate('teamsTable')} icon={Table2} label="Tabla" />
                            <ActionButton onClick={() => generatePDF(tournamentTeams)} icon={FileText} label="PDF" />
                        </div>
                    </div>

                    {/* Team Header & Navigation Center */}
                    <div className="flex items-center justify-between px-8 py-4 relative z-10">
                        <ActionButton onClick={prevTeam} icon={ChevronLeft} />

                        <div className="flex-1 flex flex-col items-center justify-center">
                            <span className="text-slate-500 text-[10px] font-bold uppercase tracking-[0.3em] mb-1">
                                Equipo {currentIndex + 1} / {tournamentTeams.length}
                            </span>
                            {isEditMode ? (
                                <input
                                    type="text"
                                    value={currentTeam.name}
                                    onChange={(e) => handleTeamNameChange(e.target.value)}
                                    className="text-3xl sm:text-5xl font-black text-white uppercase tracking-tighter text-center bg-white/10 border border-white/20 rounded-xl px-4 py-2 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/30 max-w-md"
                                />
                            ) : (
                                <h2 className="text-4xl sm:text-6xl font-black text-white uppercase tracking-tighter drop-shadow-2xl bg-gradient-to-b from-white to-slate-400 bg-clip-text text-transparent">
                                    {currentTeam.name}
                                </h2>
                            )}
                        </div>

                        <ActionButton onClick={nextTeam} icon={ChevronRight} />
                    </div>

                    {/* Pitch Container */}
                    <div className="flex-1 flex items-center justify-center p-6 min-h-0 relative">
                        <div className={`
                            relative w-full h-full max-w-[850px] aspect-[4/3] rounded-[2.5rem] overflow-hidden
                            bg-[#0B0F15] shadow-2xl border border-white/5 ring-1 ring-white/5
                         `}>
                            {/* Abstract Field Pattern */}
                            <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:24px_24px] mix-blend-overlay"></div>

                            {/* Subtle Gradient Overlay */}
                            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 via-transparent to-emerald-500/5"></div>

                            {/* Standard White Lines (Glassy) */}
                            <div className="absolute inset-6 border lg:border-2 border-white/10 rounded-2xl pointer-events-none"></div>
                            <div className="absolute top-1/2 w-full h-px lg:h-0.5 bg-white/10 pointer-events-none"></div>
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 border lg:border-2 border-white/10 rounded-full pointer-events-none bg-[#0B0F15]/50 backdrop-blur-sm"></div>

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
                <div className={`w-full lg:w-96 bg-slate-950/50 border-l border-white/5 backdrop-blur-2xl flex flex-col z-30 shadow-2xl`}>

                    {/* Header */}
                    <div className="p-6 border-b border-white/5">
                        <h3 className="text-xs font-black text-white uppercase tracking-widest flex items-center gap-2 opacity-80">
                            <Shield size={14} className="text-emerald-500" /> Estadísticas
                        </h3>
                    </div>

                    <div className="flex-1 flex flex-col p-6 gap-6 overflow-y-auto custom-scrollbar">
                        {/* Stats Grid */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-white/5 border border-white/5 p-5 rounded-2xl flex flex-col items-center justify-center transition hover:bg-white/10">
                                <span className="text-4xl font-black text-emerald-400 drop-shadow-lg">{currentTeam.stats.score}</span>
                                <span className="text-[10px] uppercase tracking-wider text-slate-500 font-bold mt-1">Valoración</span>
                            </div>
                            <div className="bg-white/5 border border-white/5 p-5 rounded-2xl flex flex-col items-center justify-center transition hover:bg-white/10">
                                <span className="text-4xl font-black text-white drop-shadow-lg">{currentTeam.stats.avgAge}</span>
                                <span className="text-[10px] uppercase tracking-wider text-slate-500 font-bold mt-1">Edad Prom.</span>
                            </div>
                        </div>

                        {/* Squad Details */}
                        <div className="bg-white/5 border border-white/5 rounded-2xl p-6 shadow-sm">
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
                    <div className="p-6 border-t border-white/5 bg-black/20">
                        <button
                            onClick={() => setIsEditMode(!isEditMode)}
                            className={`w-full py-4 rounded-xl font-bold uppercase tracking-wide text-xs flex items-center justify-center gap-2 transition-all duration-300
                                ${isEditMode
                                    ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-900 shadow-[0_0_20px_rgba(16,185,129,0.4)]'
                                    : 'bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10'
                                }
                            `}
                        >
                            {isEditMode ? <Save size={18} /> : <Pencil size={18} />}
                            <span>{isEditMode ? 'Guardar Cambios' : 'Modificar Equipo'}</span>
                        </button>
                    </div>
                </div>

                {/* Swap Modal */}
                {swapModal && (
                    <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-[100] p-6">
                        <div className="bg-slate-900 border border-white/10 p-6 rounded-3xl max-w-sm w-full shadow-2xl relative overflow-hidden">
                            {/* Decorative glow */}
                            <div className="absolute -top-10 -right-10 w-32 h-32 bg-emerald-500/20 blur-3xl rounded-full pointer-events-none"></div>

                            <h3 className="text-xl font-black text-white mb-2 uppercase relative z-10">Mover Jugador</h3>
                            <p className="text-slate-400 text-sm mb-6 relative z-10">Elige destino para <span className="text-emerald-400 font-bold">{swapModal.player.name}</span></p>

                            <div className="flex flex-col gap-2 max-h-60 overflow-y-auto custom-scrollbar relative z-10">
                                {tournamentTeams.map(t => t.id !== currentTeam.id && (
                                    <button
                                        key={t.id}
                                        onClick={() => handleTeamSwap(t.id)}
                                        className="p-4 text-left bg-white/5 hover:bg-emerald-500/20 border border-white/5 hover:border-emerald-500/50 rounded-xl text-slate-200 hover:text-white transition-all duration-200 font-semibold text-sm group"
                                    >
                                        <div className="flex items-center justify-between">
                                            <span>{t.name}</span>
                                            <ArrowRightLeft size={16} className="opacity-0 group-hover:opacity-100 transition-opacity text-emerald-400" />
                                        </div>
                                    </button>
                                ))}
                            </div>
                            <button
                                onClick={() => setSwapModal(null)}
                                className="mt-6 w-full py-3 text-slate-500 hover:text-white text-xs font-black uppercase tracking-widest transition"
                            >
                                Cancelar
                            </button>
                        </div>
                    </div>
                )}

                <DragOverlay dropAnimation={null} />
            </div>
        </DndContext>
    );
}
