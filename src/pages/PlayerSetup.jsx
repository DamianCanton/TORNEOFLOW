import { useState, useEffect } from 'react';
import useAppStore from '../store';
import { validateExcelPlayers } from '../utils/validators';
import { ArrowLeft, ArrowRight, Play, RefreshCw, Users } from 'lucide-react';

import Layout from '../components/ui/Layout';
import GlassCard from '../components/ui/GlassCard';
import Button from '../components/ui/Button';
import { GradientTitle, SectionTitle } from '../components/ui/Typography';
import PlayerEditTable from '../components/features/player-setup/PlayerEditTable';
import ConfirmChangesModal, { getChangesSummary } from '../components/shared/ConfirmChangesModal';

export default function PlayerSetup() {
    const {
        pendingPlayers,
        tournamentTeams,
        tournamentName,
        navigate,
        updatePendingPlayers,
        createTournament,
        addToast
    } = useAppStore();

    const [editablePlayers, setEditablePlayers] = useState([]);
    const [errors, setErrors] = useState([]);
    const [confirmModal, setConfirmModal] = useState({ open: false, changes: [] });

    useEffect(() => {
        setEditablePlayers([...pendingPlayers]);
    }, [pendingPlayers]);

    const teamsAlreadyGenerated = tournamentTeams.length > 0;

    const handlePlayerChange = (index, field, value) => {
        setEditablePlayers(prev => {
            const updated = [...prev];
            updated[index] = { ...updated[index], [field]: value };
            return updated;
        });
        if (errors.length > 0) setErrors([]);
    };

    const handlePlayerRemove = (index) => {
        setEditablePlayers(prev => prev.filter((_, i) => i !== index));
        if (errors.length > 0) setErrors([]);
    };

    const handleRequestGenerate = () => {
        const result = validateExcelPlayers(editablePlayers);
        if (!result.valid) {
            setErrors(result.errors);
            return;
        }
        setErrors([]);

        const changes = getChangesSummary(pendingPlayers, editablePlayers);
        setConfirmModal({ open: true, changes });
    };

    const handleConfirmGenerate = () => {
        setConfirmModal({ open: false, changes: [] });
        updatePendingPlayers(editablePlayers);
        createTournament();
    };

    return (
        <Layout className="flex flex-col items-center p-4 sm:p-6">
            <div className="relative z-10 w-full max-w-5xl flex flex-col gap-6 animate-fade-in">

                {/* Header */}
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate('home')}
                        className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/20 text-slate-400 hover:text-white transition-all"
                    >
                        <ArrowLeft size={16} />
                        <span className="hidden sm:inline text-xs font-bold uppercase tracking-wider">Volver</span>
                    </button>
                    <div className="flex-1 min-w-0">
                        <GradientTitle size="small">{tournamentName || 'TORNEO'}</GradientTitle>
                    </div>
                    <div className="flex items-center gap-2 bg-white/5 border border-white/5 rounded-xl px-3 py-2">
                        <Users size={14} className="text-emerald-500" />
                        <span className="text-sm font-bold text-white">{editablePlayers.length}</span>
                        <span className="text-xs text-slate-500 hidden sm:inline">jugadores</span>
                    </div>
                </div>

                {/* Main Content */}
                <GlassCard className="p-6 sm:p-8 space-y-6">
                    <SectionTitle>Configurar Jugadores</SectionTitle>

                    {/* Errors */}
                    {errors.length > 0 && (
                        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 space-y-1">
                            {errors.map((err, i) => (
                                <p key={i} className="text-red-400 text-sm">{err}</p>
                            ))}
                        </div>
                    )}

                    {/* Player Table */}
                    {editablePlayers.length > 0 ? (
                        <PlayerEditTable
                            players={editablePlayers}
                            onPlayerChange={handlePlayerChange}
                            onPlayerRemove={handlePlayerRemove}
                        />
                    ) : (
                        <div className="flex flex-col items-center justify-center py-16 text-slate-500">
                            <Users size={40} className="mb-4 opacity-30" />
                            <p className="text-sm font-bold uppercase tracking-wider">No hay jugadores cargados</p>
                        </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex flex-col gap-3 pt-4">
                        {teamsAlreadyGenerated ? (
                            <>
                                <Button
                                    onClick={() => navigate('tournament')}
                                    icon={ArrowRight}
                                    className="w-full py-4 text-sm"
                                >
                                    Volver a los equipos
                                </Button>
                                <Button
                                    onClick={handleRequestGenerate}
                                    variant="secondary"
                                    icon={RefreshCw}
                                    className="w-full py-3 text-sm"
                                >
                                    Re-balancear Equipos
                                </Button>
                            </>
                        ) : (
                            <Button
                                onClick={handleRequestGenerate}
                                disabled={editablePlayers.length === 0}
                                icon={Play}
                                className="w-full py-4 text-sm"
                            >
                                Generar Equipos
                            </Button>
                        )}
                    </div>
                </GlassCard>
            </div>

            {/* Confirmation Modal */}
            <ConfirmChangesModal
                isOpen={confirmModal.open}
                changes={confirmModal.changes}
                onClose={() => setConfirmModal({ open: false, changes: [] })}
                onConfirm={handleConfirmGenerate}
            />
        </Layout>
    );
}
