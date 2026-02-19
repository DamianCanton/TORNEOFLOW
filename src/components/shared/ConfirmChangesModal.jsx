import { X, Pencil, Trash2, AlertTriangle } from 'lucide-react';
import Button from '../ui/Button';

const FIELD_LABELS = {
    name: 'Nombre',
    number: 'Nro',
    position: 'Posición',
    altPosition: 'Pos. Alt.',
    quality: 'Calidad',
    responsibility: 'Responsabilidad',
    age: 'Edad'
};

/**
 * Compara los jugadores originales con los editados y devuelve un resumen de cambios.
 */
export function getChangesSummary(original, edited) {
    const changes = [];

    // Jugadores eliminados
    const editedIds = new Set(edited.map(p => p.id));
    const removed = original.filter(p => !editedIds.has(p.id));
    removed.forEach(p => {
        changes.push({ type: 'removed', player: p.name });
    });

    // Jugadores editados
    const originalMap = new Map(original.map(p => [p.id, p]));
    edited.forEach(editedPlayer => {
        const orig = originalMap.get(editedPlayer.id);
        if (!orig) return;

        const fields = Object.keys(FIELD_LABELS);
        const diffs = [];

        fields.forEach(field => {
            const oldVal = orig[field] ?? '';
            const newVal = editedPlayer[field] ?? '';
            if (String(oldVal) !== String(newVal)) {
                diffs.push({
                    field: FIELD_LABELS[field],
                    from: oldVal === '' || oldVal === null ? '-' : oldVal,
                    to: newVal === '' || newVal === null ? '-' : newVal
                });
            }
        });

        if (diffs.length > 0) {
            changes.push({ type: 'edited', player: editedPlayer.name, diffs });
        }
    });

    return changes;
}

export default function ConfirmChangesModal({ isOpen, onClose, onConfirm, changes }) {
    if (!isOpen) return null;

    const hasChanges = changes.length > 0;
    const editedCount = changes.filter(c => c.type === 'edited').length;
    const removedCount = changes.filter(c => c.type === 'removed').length;

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
            <div className="bg-slate-900 border border-white/10 p-6 rounded-3xl max-w-md w-full shadow-2xl relative overflow-hidden">
                {/* Decorative glow */}
                <div className="absolute -top-10 -right-10 w-32 h-32 bg-emerald-500/20 blur-3xl rounded-full pointer-events-none"></div>

                {/* Header */}
                <div className="flex items-start justify-between mb-4 relative z-10">
                    <div>
                        <h3 className="text-lg font-black text-white uppercase">Confirmar cambios</h3>
                        <p className="text-slate-400 text-xs mt-1">
                            {hasChanges
                                ? `${editedCount > 0 ? `${editedCount} editado${editedCount !== 1 ? 's' : ''}` : ''}${editedCount > 0 && removedCount > 0 ? ' · ' : ''}${removedCount > 0 ? `${removedCount} eliminado${removedCount !== 1 ? 's' : ''}` : ''}`
                                : 'No se detectaron cambios'
                            }
                        </p>
                    </div>
                    <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-white/10 text-slate-500 hover:text-white transition-all">
                        <X size={16} />
                    </button>
                </div>

                {/* Changes list */}
                <div className="max-h-72 overflow-y-auto custom-scrollbar space-y-2 relative z-10 mb-6">
                    {!hasChanges && (
                        <div className="flex items-center gap-3 py-6 justify-center text-slate-500">
                            <AlertTriangle size={16} />
                            <span className="text-sm">No hay modificaciones para aplicar</span>
                        </div>
                    )}

                    {changes.map((change, i) => (
                        <div
                            key={i}
                            className={`p-3 rounded-xl border ${change.type === 'removed'
                                    ? 'bg-red-500/5 border-red-500/10'
                                    : 'bg-white/5 border-white/5'
                                }`}
                        >
                            <div className="flex items-center gap-2 mb-1">
                                {change.type === 'removed' ? (
                                    <Trash2 size={12} className="text-red-400" />
                                ) : (
                                    <Pencil size={12} className="text-emerald-400" />
                                )}
                                <span className="text-sm font-bold text-white">{change.player}</span>
                                {change.type === 'removed' && (
                                    <span className="text-[10px] font-bold text-red-400 uppercase tracking-wider">Eliminado</span>
                                )}
                            </div>

                            {change.diffs && (
                                <div className="ml-5 space-y-0.5">
                                    {change.diffs.map((diff, j) => (
                                        <p key={j} className="text-xs text-slate-400">
                                            <span className="text-slate-500">{diff.field}:</span>{' '}
                                            <span className="text-red-400/70 line-through">{diff.from}</span>
                                            {' → '}
                                            <span className="text-emerald-400">{diff.to}</span>
                                        </p>
                                    ))}
                                </div>
                            )}
                        </div>
                    ))}
                </div>

                {/* Action buttons */}
                <div className="flex flex-col gap-2 relative z-10">
                    <Button
                        onClick={onConfirm}
                        disabled={!hasChanges}
                        className="w-full py-3 text-sm"
                    >
                        Confirmar y generar
                    </Button>
                    <button
                        onClick={onClose}
                        className="w-full py-3 text-slate-500 hover:text-white text-xs font-black uppercase tracking-widest transition"
                    >
                        Cancelar
                    </button>
                </div>
            </div>
        </div>
    );
}
