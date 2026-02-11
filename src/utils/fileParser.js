import { read, utils, writeFile } from 'xlsx';
import { normalizePosition, isInjured } from './parser';

export const downloadTemplate = () => {
    const headers = ['Nombre', 'Posicion', 'Calidad', 'Responsabilidad', 'Edad', 'Lesionado'];
    const exampleRows = [
        ['Emiliano Martínez', 'ARQ', 9, 8, 31, 'No'],
        ['Cuti Romero',       'DEF', 9, 7, 26, 'No'],
        ['Enzo Fernández',    'MED', 9, 8, 23, 'No'],
        ['Julián Álvarez',    'DEL', 9, 8, 24, 'No'],
        ['Rodrigo De Paul',   'POLI', 8, 9, 29, 'No'],
        ['Lionel Scaloni',    'DT',  8, 10, 46, 'No'],
    ];

    const ws = utils.aoa_to_sheet([headers, ...exampleRows]);
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
                const normalized = jsonData.map(normalizeKeys).filter(p => p.name && String(p.name).trim() !== '');
                resolve(normalized);
            } catch (err) {
                reject(err);
            }
        };
        reader.onerror = (err) => reject(err);
        reader.readAsArrayBuffer(file);
    });
};

const normalizeKeys = (row) => {
    const normalized = {};
    Object.keys(row).forEach(key => {
        const lowerKey = key.toLowerCase().trim();
        const val = row[key];

        if (['nombre', 'name', 'jugador'].some(k => lowerKey.includes(k))) normalized.name = val;
        else if (['posicion', 'position', 'rol', 'puesto'].some(k => lowerKey.includes(k))) normalized.position = normalizePosition(val);
        else if (['calidad', 'quality', 'nivel'].some(k => lowerKey.includes(k))) normalized.quality = parseInt(val) || 5;
        else if (['responsabilidad', 'responsibility', 'resp'].some(k => lowerKey.includes(k))) normalized.responsibility = parseInt(val) || 3;
        else if (['edad', 'age'].some(k => lowerKey.includes(k))) normalized.age = parseInt(val) || 25;
        else if (['lesionado', 'injured', 'estado'].some(k => lowerKey.includes(k))) normalized.injured = isInjured(val);
    });
    return normalized;
};
