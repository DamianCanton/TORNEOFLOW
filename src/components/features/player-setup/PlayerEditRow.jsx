import { Trash2 } from 'lucide-react';

const POSITION_LABELS = ['1','2','3','4','5','6','7','8','9','10','11','Poli','DT','Supl'];

const LABEL_TO_CODE = {
    '1':'ARQ', '2':'DEF', '3':'DEF', '4':'DEF',
    '5':'MED', '6':'DEF', '7':'MED', '8':'MED',
    '9':'DEL', '10':'MED', '11':'DEL',
    'Poli':'POLI', 'DT':'DT', 'Supl':'SUPL',
};

const CODE_TO_LABEL = {
    'ARQ':'1', 'DEF':'2', 'MED':'5', 'DEL':'9',
    'POLI':'Poli', 'DT':'DT', 'SUPL':'Supl',
};

const inputBase = "bg-black/30 border border-white/10 rounded-lg text-sm text-white px-2 py-1.5 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/30 w-full";
const selectBase = "bg-black/30 border border-white/10 rounded-lg text-sm text-white px-1.5 py-1.5 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/30 w-full appearance-none cursor-pointer [&>option]:bg-slate-900 [&>option]:text-white";

export default function PlayerEditRow({ player, index, onChange, onRemove }) {
    const handleChange = (field, value) => {
        if (field === 'quality' || field === 'responsibility' || field === 'age' || field === 'number') {
            const num = value === '' ? '' : Number(value);
            onChange(field, num);
        } else if (field === 'position') {
            onChange('position', LABEL_TO_CODE[value]);
            onChange('positionLabel', value);
        } else if (field === 'altPosition') {
            if (value === '') {
                onChange('altPosition', null);
                onChange('altPositionLabel', null);
            } else {
                onChange('altPosition', LABEL_TO_CODE[value]);
                onChange('altPositionLabel', value);
            }
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
                    value={player.positionLabel || CODE_TO_LABEL[player.position] || 'Poli'}
                    onChange={(e) => handleChange('position', e.target.value)}
                    className={`${selectBase} w-24`}
                >
                    {POSITION_LABELS.map(label => (
                        <option key={label} value={label}>{label}</option>
                    ))}
                </select>
            </td>

            {/* Alt Position */}
            <td className="px-1.5 py-2 hidden sm:table-cell">
                <select
                    value={player.altPositionLabel || CODE_TO_LABEL[player.altPosition] || ''}
                    onChange={(e) => handleChange('altPosition', e.target.value)}
                    className={`${selectBase} w-24`}
                >
                    <option value="">-</option>
                    {POSITION_LABELS.map(label => (
                        <option key={label} value={label}>{label}</option>
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
