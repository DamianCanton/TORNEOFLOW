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

                // Leer con header:1 para obtener arrays crudos (fila 0 = headers, resto = datos)
                const rawRows = utils.sheet_to_json(firstSheet, { header: 1, defval: '' });

                if (rawRows.length < 2) {
                    resolve([]);
                    return;
                }

                // Detectar la fila real de headers (puede haber filas de título antes)
                // Buscar la primera fila que contenga 'jugador' o 'nombre'
                const NAME_KEYWORDS = ['jugador', 'nombre', 'name', 'player'];
                let headerRowIndex = rawRows.findIndex(row =>
                    row.some(cell => NAME_KEYWORDS.some(k => cleanKey(String(cell)).includes(k)))
                );
                if (headerRowIndex === -1) headerRowIndex = 0; // fallback a primera fila

                const headerRow = rawRows[headerRowIndex].map(h => cleanKey(String(h)));
                const dataRows = rawRows.slice(headerRowIndex + 1);

                // Detectar índice de cada columna por nombre, con fallback por posición
                const colIdx = {
                    number:      findCol(headerRow, ['n','no','nro','num','numero','number','#'], 0),
                    name:        findCol(headerRow, ['jugador','nombre','name','player'],          1),
                    age:         findCol(headerRow, ['edad','age'],                                2),
                    position:    findCol(headerRow, ['pto','posicion','position','puesto','rol'],   3),
                    altPosition: findCol(headerRow, ['alt','alternativa','altposition','supl'],     4),
                };

                console.log('[fileParser] header en fila:', headerRowIndex, headerRow);
                console.log('[fileParser] índices de columnas:', colIdx);

                const normalized = dataRows
                    .map((row, index) => normalizeRow(row, colIdx, index))
                    .filter(p => p.name && String(p.name).trim() !== '');

                console.log('[fileParser] jugadores parseados:', normalized.length, normalized);
                resolve(normalized);
            } catch (err) {
                console.error('[fileParser] error:', err);
                reject(err);
            }
        };
        reader.onerror = (err) => reject(err);
        reader.readAsArrayBuffer(file);
    });
};

// Limpia un string para comparación: minúsculas, sin acentos, sin puntos ni espacios
const cleanKey = (str) =>
    str.toLowerCase().trim()
        .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
        .replace(/[.\s]/g, '');

// Busca el índice de columna por nombre; si no encuentra, usa el fallback posicional
const findCol = (headerRow, keywords, fallback) => {
    const idx = headerRow.findIndex(h => keywords.some(k => h.includes(k)));
    return idx !== -1 ? idx : fallback;
};

// Parsea una fila array usando los índices de columna detectados
const normalizeRow = (row, colIdx, index) => {
    const get = (i) => (i !== undefined && i < row.length) ? row[i] : '';

    const rawPos = get(colIdx.position);
    const rawAlt = get(colIdx.altPosition);

    return {
        number:      parseInt(get(colIdx.number)) || (index + 1),
        name:        String(get(colIdx.name)).trim(),
        age:         parseInt(get(colIdx.age)) || 25,
        position:    normalizePosition(rawPos),
        altPosition: (!rawAlt || String(rawAlt).trim() === '') ? null : normalizePosition(rawAlt),
        quality:     5,
        responsibility: 3,
    };
};
