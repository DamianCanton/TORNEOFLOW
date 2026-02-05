import { useState } from 'react';
import useAppStore from '../store';
import { ChevronLeft, ChevronRight, RotateCcw, FileText, Pencil, Save, ArrowRightLeft, Table2, User, Shield, Users, Shirt } from 'lucide-react';
import { generatePDF } from '../utils/pdfGenerator';
import { recalculateTeamStats } from '../utils/tournamentMaker';
import { DndContext, useDraggable, useDroppable, DragOverlay, closestCenter, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';

// --- Theme Constants (Modern Minimalist) ---
const THEME = {
    bg: 'bg-slate-950',
    surface: 'bg-slate-900',
    border: 'border border-slate-800',
    textMain: 'text-slate-100',
    textMuted: 'text-slate-500',
    accent: 'text-emerald-500',
};

// --- Components ---

function ActionButton({ onClick, icon: Icon, label, active, danger }) {
    return (
        <button
            onClick={onClick}
            className={`
                flex items-center justify-center gap-2 px-3 py-2 rounded-lg transition-all duration-200 border
                ${active
                    ? 'bg-emerald-500/10 border-emerald-500/50 text-emerald-400'
                    : `bg-slate-800 hover:bg-slate-700 ${danger ? 'border-red-900/50 hover:border-red-500/50' : 'border-slate-700 hover:border-slate-600'}`
                }
                ${!active && (danger ? 'text-red-400 hover:text-white' : 'text-slate-400 hover:text-white')}
            `}
            title={label}
        >
            <Icon size={18} />
            {label && <span className="font-bold text-xs uppercase tracking-wide">{label}</span>}
        </button>
    );
}

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

            {/* Jersey Icon Container */}
            <div className={`relative flex items-center justify-center transition-transform duration-200 hover:scale-110
                ${isEditMode && !player.vacante ? 'cursor-grab active:cursor-grabbing' : 'cursor-default'}
            `}>
                <Shirt
                    size={player.role === 'DT' ? 52 : 44}
                    className={`
                        drop-shadow-lg
                        ${player.vacante ? 'text-slate-800 fill-slate-900' :
                            player.role === 'ARQ' ? 'text-yellow-500 fill-yellow-500' :
                                player.role === 'DT' ? 'text-indigo-500 fill-indigo-500' :
                                    player.isOutOfPosition ? 'text-orange-500 fill-orange-500' : 'text-slate-200 fill-slate-200'
                        }
                    `}
                    strokeWidth={1.5}
                />

                {/* Edit Indicator */}
                {isEditMode && !player.vacante && (
                    <div className="absolute -top-1 -right-1 bg-emerald-500 rounded-full p-0.5 border-2 border-slate-900 shadow-sm">
                        <ArrowRightLeft size={10} className="text-white" />
                    </div>
                )}
            </div>

            {/* Name Label */}
            <div className={`mt-1.5 px-2.5 py-0.5 rounded-md flex flex-col items-center leading-none pointer-events-none
               bg-black/60 backdrop-blur-sm border border-white/10 shadow-sm
            `}>
                <span className="text-[10px] sm:text-xs font-bold text-white whitespace-nowrap">{player.vacante ? '?' : player.name}</span>
                {!player.vacante && (
                    <span className={`text-[8px] font-bold uppercase tracking-widest mt-0.5
                        ${player.role === 'ARQ' ? 'text-yellow-400' :
                            player.role === 'DEF' ? 'text-blue-400' :
                                player.role === 'MED' ? 'text-emerald-400' :
                                    player.role === 'DEL' ? 'text-red-400' : 'text-slate-400'}
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
        <div ref={setNodeRef} className={`absolute transform -translate-x-1/2 -translate-y-1/2 w-14 h-14 rounded-full transition-all duration-200 ${isOver ? 'bg-emerald-500/30 scale-125 ring-2 ring-emerald-400/50' : ''}`} style={{ top: player.top, left: player.left }}>
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
        <div ref={setNodeRef} style={style} {...listeners} {...attributes} className={`
            flex items-center gap-3 p-3 rounded-lg transition-all duration-200 group
            bg-slate-800/50 border border-slate-700/50 hover:bg-slate-800 hover:border-slate-600
            ${isEditMode ? 'cursor-grab active:cursor-grabbing hover:border-emerald-500/30' : ''}
            ${isDragging ? 'opacity-50' : ''}
        `}>
            {/* Bench Jersey Preview */}
            <div className="flex-shrink-0">
                <Shirt
                    size={20}
                    className="text-slate-500 fill-slate-700"
                    strokeWidth={2}
                />
            </div>

            <div className="flex flex-col flex-1 min-w-0">
                <span className="text-slate-200 font-semibold truncate text-xs">{player.name}</span>
                <span className="text-[10px] uppercase tracking-wider text-slate-500 font-bold">{player.position}</span>
            </div>

            {isEditMode && <button onPointerDown={(e) => { e.stopPropagation(); onClick(); }} className="text-slate-600 hover:text-emerald-400 transition ml-2"><ArrowRightLeft size={14} /></button>}
        </div>
    );
}

function BenchDroppableArea({ children }) {
    const { setNodeRef, isOver } = useDroppable({
        id: 'bench-zone'
    });
    return (
        <div ref={setNodeRef} className={`rounded-xl transition-all p-2 min-h-[120px] bg-slate-950/30 border-2 ${isOver ? 'border-dashed border-emerald-500/50 bg-emerald-500/5' : 'border-transparent'}`}>
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

    return (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <div className={`h-screen ${THEME.bg} flex flex-col lg:flex-row overflow-hidden text-slate-200 select-none font-sans`}>

                {/* --- LEFT COLUMN: Main Content --- */}
                <div className="flex-1 flex flex-col min-w-0">

                    {/* Top Bar: Navigation & Info */}
                    <div className="flex items-center justify-between px-6 py-4 border-b border-slate-900 bg-slate-950 z-20">
                        {/* Title Section */}
                        <div className="flex flex-col">
                            <h1 className="text-lg sm:text-2xl font-black text-white uppercase tracking-tight flex items-center gap-3">
                                {tournamentName || 'TORNEO'}
                                {tournamentStartDate && (
                                    <span className="text-[10px] font-bold text-slate-400 bg-slate-900 border border-slate-800 px-2 py-0.5 rounded">
                                        {formatDate(tournamentStartDate)} - {formatDate(tournamentEndDate)}
                                    </span>
                                )}
                            </h1>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2">
                            <ActionButton onClick={reset} icon={RotateCcw} label="Inicio" />
                            <ActionButton onClick={() => navigate('teamsTable')} icon={Table2} label="Tabla" />
                            <ActionButton onClick={() => generatePDF(tournamentTeams)} icon={FileText} label="PDF" />
                        </div>
                    </div>

                    {/* Team Header & Navigation Center */}
                    <div className="flex items-center justify-between px-6 py-4 relative z-10">
                        <ActionButton onClick={prevTeam} icon={ChevronLeft} />

                        <div className="flex-1 flex flex-col items-center justify-center">
                            <span className="text-slate-500 text-[10px] font-bold uppercase tracking-[0.2em] mb-1">
                                Equipo {currentIndex + 1} de {tournamentTeams.length}
                            </span>
                            <h2 className="text-3xl sm:text-5xl font-black text-white uppercase tracking-tighter drop-shadow-lg">
                                {currentTeam.name}
                            </h2>
                        </div>

                        <ActionButton onClick={nextTeam} icon={ChevronRight} />
                    </div>

                    {/* Pitch Container */}
                    <div className="flex-1 flex items-center justify-center p-4 min-h-0 relative overflow-hidden">
                        <div className={`
                            relative w-full h-full max-w-[800px] aspect-[4/3] rounded-3xl overflow-hidden
                            bg-slate-900 shadow-2xl
                            border-4 border-slate-800
                         `}>
                            {/* Inner Grass Texture */}
                            <div className="absolute inset-0 bg-gradient-to-br from-emerald-600 to-emerald-800">
                                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/grass.png')] opacity-20 mix-blend-overlay"></div>
                            </div>

                            {/* Standard White Lines */}
                            <div className="absolute inset-5 border-2 border-white/40 rounded-xl pointer-events-none"></div>
                            <div className="absolute top-1/2 w-full h-0.5 bg-white/40 pointer-events-none"></div>
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 border-2 border-white/40 rounded-full pointer-events-none"></div>

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
                    </div>
                </div>

                {/* --- RIGHT COLUMN: Sidebar (Clean Cards) --- */}
                <div className={`w-full lg:w-96 bg-slate-900 border-l border-slate-800 flex flex-col z-30 shadow-xl`}>

                    {/* Header */}
                    <div className="p-6 border-b border-slate-800">
                        <h3 className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-2">
                            <Shield size={16} className="text-emerald-500" /> Estadísticas
                        </h3>
                    </div>

                    <div className="flex-1 flex flex-col p-6 gap-6 overflow-y-auto custom-scrollbar">
                        {/* Stats Grid */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl flex flex-col items-center justify-center">
                                <span className="text-3xl font-black text-emerald-400">{currentTeam.stats.score}</span>
                                <span className="text-[10px] uppercase tracking-wider text-slate-500 font-bold mt-1">Valoración</span>
                            </div>
                            <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl flex flex-col items-center justify-center">
                                <span className="text-3xl font-black text-white">{currentTeam.stats.avgAge}</span>
                                <span className="text-[10px] uppercase tracking-wider text-slate-500 font-bold mt-1">Edad Prom.</span>
                            </div>
                        </div>

                        {/* Squad Details */}
                        <div className="bg-slate-950 border border-slate-800 rounded-xl p-5">
                            <div className="space-y-3">
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-slate-400 font-medium">Titulares</span>
                                    <span className="bg-slate-800 text-white px-2 py-0.5 rounded text-xs font-bold">{currentTeam.starters.filter(p => !p.vacante).length}</span>
                                </div>
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-slate-400 font-medium">Suplentes</span>
                                    <span className="bg-slate-800 text-white px-2 py-0.5 rounded text-xs font-bold">{currentTeam.bench.length}</span>
                                </div>
                            </div>
                        </div>

                        {/* Bench */}
                        <div className="flex-1 flex flex-col min-h-0">
                            <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                                <User size={14} className="text-emerald-500" /> Suplentes
                            </h3>
                            <BenchDroppableArea>
                                <div className="flex flex-col gap-3">
                                    {currentTeam.bench.length === 0 ? (
                                        <div className="flex flex-col items-center justify-center py-8 text-slate-600">
                                            <span className="text-xs font-bold">VACÍO</span>
                                        </div>
                                    ) : (
                                        currentTeam.bench.map((sub, idx) => (
                                            <BenchPlayer
                                                key={`bench-${currentIndex}-${sub.id || idx}`}
                                                id={`bench-${sub.id}`}
                                                player={sub}
                                                isEditMode={isEditMode}
                                                onClick={() => setSwapModal({ player: sub, teamIndex: currentIndex, origin: 'bench', idx })}
                                            />
                                        ))
                                    )}
                                </div>
                            </BenchDroppableArea>
                        </div>
                    </div>

                    {/* Footer Actions */}
                    <div className="p-6 border-t border-slate-800 bg-slate-900">
                        <button
                            onClick={() => setIsEditMode(!isEditMode)}
                            className={`w-full py-3.5 rounded-lg font-bold uppercase tracking-wide text-xs flex items-center justify-center gap-2 transition-all
                                ${isEditMode
                                    ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-900/50'
                                    : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700'
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
                    <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-[100] p-6 backdrop-blur-sm">
                        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl max-w-sm w-full shadow-2xl">
                            <h3 className="text-lg font-black text-white mb-2 uppercase">Mover Jugador</h3>
                            <p className="text-slate-400 text-sm mb-6">Elige destino para <span className="text-white font-bold">{swapModal.player.name}</span></p>

                            <div className="flex flex-col gap-2 max-h-60 overflow-y-auto custom-scrollbar">
                                {tournamentTeams.map(t => t.id !== currentTeam.id && (
                                    <button
                                        key={t.id}
                                        onClick={() => handleTeamSwap(t.id)}
                                        className="p-3 text-left bg-slate-800 hover:bg-emerald-600 rounded-lg text-slate-300 hover:text-white transition font-medium text-sm"
                                    >
                                        {t.name}
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
