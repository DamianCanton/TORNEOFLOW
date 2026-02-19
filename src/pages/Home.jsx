import { useState } from 'react';
import useAppStore from '../store';
import { validateTournamentName, validateDates, validateExcelPlayers } from '../utils/validators';
import { Play, Trophy } from 'lucide-react';
import { mockPlayersSimple } from '../data/mockPlayers';

// UI Components
import Layout from '../components/ui/Layout';
import GlassCard from '../components/ui/GlassCard';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import { GradientTitle, SectionTitle } from '../components/ui/Typography';
import FileImporter from '../components/features/home/FileImporter';

export default function Home() {
    const {
        syncPlayersFromText,
        importPlayers,
        navigate,
        pendingPlayers,
        tournamentName,
        tournamentStartDate,
        tournamentEndDate,
        setTournamentName,
        setTournamentStartDate,
        setTournamentEndDate
    } = useAppStore();

    const [errors, setErrors] = useState({
        tournamentName: '',
        dates: '',
        excelPlayers: [],
        fileUpload: ''
    });

    const clearError = (field) => {
        if (field === 'excelPlayers') {
            if (errors.excelPlayers.length > 0) setErrors(prev => ({ ...prev, excelPlayers: [] }));
        } else if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: '' }));
        }
    };

    const loadDemoData = () => {
        setTournamentName('Torneo Demo');
        setTournamentStartDate(new Date().toISOString().split('T')[0]);
        const endDate = new Date();
        endDate.setMonth(endDate.getMonth() + 1);
        setTournamentEndDate(endDate.toISOString().split('T')[0]);
        syncPlayersFromText(mockPlayersSimple);
    };

    const handleCreateTournament = () => {
        const newErrors = {};

        const nameError = validateTournamentName(tournamentName);
        if (nameError) newErrors.tournamentName = nameError;

        const datesError = validateDates(tournamentStartDate, tournamentEndDate);
        if (datesError) newErrors.dates = datesError;

        const excelResult = validateExcelPlayers(pendingPlayers);
        if (!excelResult.valid) newErrors.excelPlayers = excelResult.errors;

        if (Object.keys(newErrors).length > 0) {
            setErrors(prev => ({ ...prev, ...newErrors }));
            return;
        }

        setErrors({ tournamentName: '', dates: '', excelPlayers: [], fileUpload: '' });
        navigate('playerSetup');
    };

    const handleImport = (players) => {
        const result = validateExcelPlayers(players);
        if (!result.valid) {
            setErrors(prev => ({ ...prev, excelPlayers: result.errors }));
            return;
        }
        clearError('excelPlayers');
        importPlayers(players);
    };

    const hasPendingPlayers = pendingPlayers.length > 0;

    return (
        <Layout className="flex flex-col items-center justify-center p-4 sm:p-6">
            <div className="relative z-10 w-full max-w-2xl flex flex-col gap-6 animate-fade-in">

                {/* Header */}
                <div className="text-center space-y-6">
                    <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-700 shadow-[0_0_50px_-10px_rgba(16,185,129,0.6)] mb-4">
                        <Trophy size={40} className="text-white drop-shadow-md" />
                    </div>
                    <GradientTitle size="large">TORNEO FLOW</GradientTitle>
                    <p className="text-slate-400 font-medium tracking-widest text-sm uppercase">Creador de equipos inteligente</p>
                </div>

                {/* Form Container */}
                <GlassCard className="p-10 space-y-8">
                    {/* Tournament Info Inputs */}
                    <div className="space-y-6">
                        <SectionTitle>Detalles del Torneo</SectionTitle>
                        <Input
                            label="Nombre"
                            placeholder="Ej: Copa de Verano 2024"
                            value={tournamentName}
                            onChange={(e) => { setTournamentName(e.target.value); clearError('tournamentName'); }}
                            error={errors.tournamentName}
                        />

                        <div className="grid grid-cols-2 gap-4 sm:gap-6">
                            <Input
                                label="Inicio"
                                type="date"
                                value={tournamentStartDate}
                                onChange={(e) => { setTournamentStartDate(e.target.value); clearError('dates'); }}
                                error={errors.dates}
                            />
                            <Input
                                label="Fin"
                                type="date"
                                value={tournamentEndDate}
                                onChange={(e) => { setTournamentEndDate(e.target.value); clearError('dates'); }}
                            />
                        </div>
                    </div>

                    {/* Divider */}
                    <div className="w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent my-4"></div>

                    {/* File Importer */}
                    <div className="space-y-6">
                        <SectionTitle>Agregar Jugadores</SectionTitle>
                        <FileImporter
                            onImport={handleImport}
                            onError={(msg) => setErrors(prev => ({ ...prev, fileUpload: msg }))}
                            clearError={clearError}
                            pendingPlayersCount={pendingPlayers.length}
                            errors={errors}
                        />
                    </div>

                    {/* Primary Action - Create Tournament */}
                    <Button
                        onClick={handleCreateTournament}
                        disabled={!hasPendingPlayers}
                        icon={Play}
                        className="w-full py-4 text-sm mt-12"
                    >
                        Crear Torneo
                    </Button>
                </GlassCard>
            </div>

            {/* Subtle Demo Link */}
            <button
                onClick={loadDemoData}
                className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 text-slate-600 text-[10px] font-bold uppercase tracking-widest hover:text-emerald-500 transition-colors opacity-50 hover:opacity-100"
            >
                Cargar Datos Demo
            </button>
        </Layout>
    );
}
