import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export const generatePDF = (teams) => {
    const doc = new jsPDF();
    const date = new Date().toLocaleDateString('es-AR');

    // Title
    doc.setFontSize(22);
    doc.setTextColor(47, 79, 79); // Dark Slate Gray
    doc.text('TORNEO FLOW - Equipos', 105, 20, { align: 'center' });

    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Generado el: ${date}`, 105, 30, { align: 'center' });

    let finalY = 40;

    teams.forEach((team) => {
        // Prepare Data
        const rows = [];

        // 1. DT (Coach)
        const dt = team.starters.find(p => p.role === 'DT');
        if (dt) {
            rows.push(['DT', dt.name, 'TÉCNICO']);
        }

        // 2. Starters (Sorted by role logic roughly)
        const roleOrder = ['ARQ', 'CEN', 'LAT', 'VOL', 'MED', 'DEL'];
        const starters = team.starters
            .filter(p => p.role !== 'DT' && !p.vacante)
            .sort((a, b) => roleOrder.indexOf(a.role) - roleOrder.indexOf(b.role));

        starters.forEach(p => {
            rows.push([p.role, p.name, 'TITULAR']);
        });

        // 2a. Vacancies
        team.starters.filter(p => p.vacante && p.role !== 'DT').forEach(p => {
            rows.push([p.role, 'VACANTE', '-']);
        });

        // 3. Bench
        team.bench.forEach(p => {
            rows.push([p.position || p.role, p.name, 'SUPLENTE']);
        });

        // Draw Table
        autoTable(doc, {
            startY: finalY,
            head: [
                [{ content: `EQUIPO: ${team.name.toUpperCase()} (Promedio Edad: ${team.stats.avgAge})`, colSpan: 3, styles: { halign: 'center' } }],
                ['Posición', 'Nombre', 'Detalle']
            ],
            body: rows,
            theme: 'grid',
            headStyles: {
                fillColor: [16, 185, 129], // Emerald 500
                textColor: 255,
                fontSize: 12,
                fontStyle: 'bold',
                halign: 'center'
            },
            columnStyles: {
                0: { cellWidth: 30, fontStyle: 'bold' },
                1: { cellWidth: 'auto' },
                2: { cellWidth: 40, fontStyle: 'italic' }
            },
            styles: {
                fontSize: 10,
                cellPadding: 3
            },
            didParseCell: function (data) {
                if (data.section === 'body' && data.row.raw[2] === 'TÉCNICO') {
                    data.cell.styles.fillColor = [224, 231, 255]; // Indigo 100
                    data.cell.styles.textColor = [49, 46, 129]; // Indigo 900
                    data.cell.styles.fontStyle = 'bold';
                }
                if (data.section === 'body' && data.row.raw[2] === 'SUPLENTE') {
                    data.cell.styles.textColor = [100, 100, 100];
                }
            },
            margin: { top: 20 }
        });

        finalY = doc.lastAutoTable.finalY + 10;

        // Add new page if not enough space for next team (heuristic)
        if (finalY > 250) {
            doc.addPage();
            finalY = 20;
        }
    });

    doc.save(`torneo-flow-equipos-${Date.now()}.pdf`);
};
