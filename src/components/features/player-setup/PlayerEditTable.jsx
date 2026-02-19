import PlayerEditRow from './PlayerEditRow';

export default function PlayerEditTable({ players, onPlayerChange, onPlayerRemove }) {
    return (
        <div className="max-h-[60vh] overflow-y-auto overflow-x-auto custom-scrollbar rounded-xl border border-white/5">
            <table className="w-full border-collapse min-w-[700px]">
                <thead className="sticky top-0 bg-slate-950/90 backdrop-blur-xl z-10">
                    <tr className="border-b border-white/10">
                        <th className="px-2 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider text-center w-10">#</th>
                        <th className="px-1.5 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider text-center w-14">Nro</th>
                        <th className="px-1.5 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider text-left">Nombre</th>
                        <th className="px-1.5 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider text-center w-20">Pos</th>
                        <th className="px-1.5 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider text-center w-20 hidden sm:table-cell">Alt.</th>
                        <th className="px-2 py-3 text-center w-24">
                            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Cal</div>
                            <div className="text-[10px] text-slate-600 font-normal">(1 min - 10 max)</div>
                        </th>
                        <th className="px-2 py-3 text-center w-24 hidden sm:table-cell">
                            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Resp</div>
                            <div className="text-[10px] text-slate-600 font-normal">(1 min - 10 max)</div>
                        </th>
                        <th className="px-2 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider text-center w-24">Edad</th>
                        <th className="px-1.5 py-3 w-10"></th>
                    </tr>
                </thead>
                <tbody>
                    {players.map((player, index) => (
                        <PlayerEditRow
                            key={player.id}
                            player={player}
                            index={index}
                            onChange={(field, value) => onPlayerChange(index, field, value)}
                            onRemove={() => onPlayerRemove(index)}
                        />
                    ))}
                </tbody>
            </table>
        </div>
    );
}
