import { Trash2 } from 'lucide-react';

const POSITIONS = ['ARQ', 'DEF', 'MED', 'DEL', 'POLI', 'DT', 'SUPL'];

const inputBase = "bg-black/30 border border-white/10 rounded-lg text-sm text-white px-2 py-1.5 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/30 w-full";
const selectBase = "bg-black/30 border border-white/10 rounded-lg text-sm text-white px-1.5 py-1.5 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/30 w-full appearance-none cursor-pointer [&>option]:bg-slate-900 [&>option]:text-white";

export default function PlayerEditRow({ player, index, onChange, onRemove }) {
    const handleChange = (field, value) => {
        if (field === 'quality' || field === 'responsibility' || field === 'age' || field === 'number') {
            const num = value === '' ? '' : Number(value);
            onChange(field, num);
        } else if (field === 'altPosition') {
            onChange(field, value === '' ? null : value);
        } else {
            onChange(field, value);
        }
    };

    return (
        <tr className="border-b border-white/5 hover:bg-white/5 transition-colors group">
            {/* Row number */}
            <td className="px-2 py-2 text-center text-xs text-slate-500 font-mono">
                {index + 1}
            </td>

            {/* Number */}
            <td className="px-1.5 py-2">
                <input
                    type="number"
                    min="1"
                    max="99"
                    value={player.number ?? ''}
                    onChange={(e) => handleChange('number', e.target.value)}
                    className={`${inputBase} w-14 text-center`}
                    placeholder="-"
                />
            </td>

            {/* Name */}
            <td className="px-1.5 py-2">
                <input
                    type="text"
                    value={player.name || ''}
                    onChange={(e) => handleChange('name', e.target.value)}
                    className={`${inputBase} min-w-[120px]`}
                    placeholder="Nombre"
                />
            </td>

            {/* Position */}
            <td className="px-1.5 py-2">
                <select
                    value={player.position || 'POLI'}
                    onChange={(e) => handleChange('position', e.target.value)}
                    className={`${selectBase} w-20`}
                >
                    {POSITIONS.map(pos => (
                        <option key={pos} value={pos}>{pos}</option>
                    ))}
                </select>
            </td>

            {/* Alt Position */}
            <td className="px-1.5 py-2 hidden sm:table-cell">
                <select
                    value={player.altPosition || ''}
                    onChange={(e) => handleChange('altPosition', e.target.value)}
                    className={`${selectBase} w-20`}
                >
                    <option value="">-</option>
                    {POSITIONS.map(pos => (
                        <option key={pos} value={pos}>{pos}</option>
                    ))}
                </select>
            </td>

            {/* Quality */}
            <td className="px-2 py-2">
                <input
                    type="number"
                    min="1"
                    max="10"
                    value={player.quality ?? 5}
                    onChange={(e) => handleChange('quality', e.target.value)}
                    className={`${inputBase} w-20 text-center`}
                />
            </td>

            {/* Responsibility */}
            <td className="px-2 py-2 hidden sm:table-cell">
                <input
                    type="number"
                    min="1"
                    max="10"
                    value={player.responsibility ?? 3}
                    onChange={(e) => handleChange('responsibility', e.target.value)}
                    className={`${inputBase} w-20 text-center`}
                />
            </td>

            {/* Age */}
            <td className="px-2 py-2">
                <input
                    type="number"
                    min="10"
                    max="60"
                    value={player.age ?? 25}
                    onChange={(e) => handleChange('age', e.target.value)}
                    className={`${inputBase} w-20 text-center`}
                />
            </td>

            {/* Remove */}
            <td className="px-1.5 py-2 text-center">
                <button
                    onClick={onRemove}
                    className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-all opacity-0 group-hover:opacity-100"
                    title="Eliminar jugador"
                >
                    <Trash2 size={14} />
                </button>
            </td>
        </tr>
    );
}
