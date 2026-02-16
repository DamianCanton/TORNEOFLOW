import { read, utils, writeFile } from 'xlsx';
import { normalizePosition } from './parser';

export const downloadTemplate = () => {
    const headers = ['Nº', 'Jugador', 'Edad', 'Pto.', 'Alt.'];
    const exampleRows = [
        [1,  'Emiliano Martínez', 31, 1,  ''],
        [2,  'Cuti Romero',       26, 3,  ''],
        [3,  'Enzo Fernández',    23, 7,  6],
        [4,  'Julián Álvarez',    24, 11, 10],
        [5,  'Rodrigo De Paul',   29, '',  ''],
        [6,  'Lionel Scaloni',    46, 'DT', ''],
    ];

    const ws = utils.aoa_to_sheet([headers, ...exampleRows]);

    ws['!cols'] = [
        { wch: 5 },
        { wch: 25 },
        { wch: 6 },
        { wch: 6 },
        { wch: 6 },
    ];

    const wb = utils.book_new();
    utils.book_append_sheet(wb, ws, "Plantilla Jugadores");

    writeFile(wb, "Plantilla_Torneo.xlsx");
};

export const parseFile = async (file) => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = new Uint8Array(e.target.result);
                const workbook = read(data, { type: 'array' });
                const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
                const jsonData = utils.sheet_to_json(firstSheet);
                const normalized = jsonData.map((row, index) => normalizeKeys(row, index)).filter(p => p.name && String(p.name).trim() !== '');
                resolve(normalized);
            } catch (err) {
                reject(err);
            }
        };
        reader.onerror = (err) => reject(err);
        reader.readAsArrayBuffer(file);
    });
};

const normalizeKeys = (row, index) => {
    const normalized = {};
    Object.keys(row).forEach(key => {
        const lowerKey = key.toLowerCase().trim();
        const val = row[key];

        // Nº (número de lista)
        if (lowerKey === 'n' || lowerKey === 'nº' || lowerKey === 'nro' || lowerKey === 'numero' || lowerKey === 'number' || lowerKey === '#') {
            normalized.number = parseInt(val) || null;
        }
        // Jugador (nombre)
        else if (['jugador', 'nombre', 'name', 'player'].some(k => lowerKey.includes(k))) {
            normalized.name = val;
        }
        // Edad
        else if (['edad', 'age'].some(k => lowerKey.includes(k))) {
            normalized.age = parseInt(val) || 25;
        }
        // Pto. (posición principal - numérico 1-11 o string)
        else if (lowerKey === 'pto' || lowerKey === 'pto.' || ['posicion', 'position', 'puesto', 'rol'].some(k => lowerKey.includes(k))) {
            normalized.position = normalizePosition(val);
        }
        // Alt. (posición alternativa - numérico 1-11 o string)
        else if (lowerKey === 'alt' || lowerKey === 'alt.' || lowerKey === 'alternativa' || lowerKey === 'alt position' || lowerKey === 'suplente') {
            normalized.altPosition = (val === null || val === undefined || String(val).trim() === '') ? null : normalizePosition(val);
        }
    });

    // Auto-asignar número si no viene
    if (!normalized.number) {
        normalized.number = index + 1;
    }

    // Defaults para campos internos
    normalized.quality = 5;
    normalized.responsibility = 3;

    return normalized;
};
