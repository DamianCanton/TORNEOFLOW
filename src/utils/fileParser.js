import { read, utils, writeFile } from 'xlsx';

export const downloadTemplate = () => {
    const headers = ['Nombre', 'Posicion', 'Calidad', 'Responsabilidad', 'Edad', 'Lesionado'];
    const exampleRow = ['Lionel Messi', 'DEL', 10, 10, 36, 'No'];

    const ws = utils.aoa_to_sheet([headers, exampleRow]);
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
                const normalized = jsonData.map(normalizeKeys);
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

// Duplicate helpers from parser.js to avoid circular deps or keep independent
// Ideally we should export these from parser.js but for now... 
// Actually let's just minimal copy or export from parser.js
// To avoid complexity, I'll inline a simple version here.

const normalizePosition = (val) => {
    if (!val) return 'POLI';
    const clean = String(val).toUpperCase().trim();
    if (clean.startsWith('POL')) return 'POLI';
    if (clean === 'DT' || clean.startsWith('DIR')) return 'DT';
    const valid = ['ARQ', 'CEN', 'LAT', 'MED', 'VOL', 'DEL'];
    return valid.includes(clean.substring(0, 3)) ? clean.substring(0, 3) : 'POLI';
};

const isInjured = (val) => {
    if (!val) return false;
    return /^[sy1x]/i.test(String(val).trim());
};
