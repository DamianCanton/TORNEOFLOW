import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export const generatePDF = (teams, tournamentName = 'TORNEO FLOW') => {
    // Create landscape PDF for horizontal layout
    const doc = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4'
    });

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const date = new Date().toLocaleDateString('es-AR');

    // Title Header
    doc.setFontSize(12);
    doc.setTextColor(50, 50, 50);
    doc.text(`EQUIPOS DEL CAMPEONATO: ${tournamentName.toUpperCase()} - ${new Date().getFullYear()}`, pageWidth / 2, 8, { align: 'center' });

    const marginX = 5;
    const availableWidth = pageWidth - (marginX * 2);

    // Determine if we need to split into two rows
    const maxTeamsPerRow = 8; // Maximum teams that look good in one row
    const needsTwoRows = teams.length > maxTeamsPerRow;

    if (needsTwoRows) {
        // Split teams into two groups
        const midPoint = Math.ceil(teams.length / 2);
        const firstRowTeams = teams.slice(0, midPoint);
        const secondRowTeams = teams.slice(midPoint);

        // Calculate available height for each table (roughly half the page minus margins)
        const tableStartY = 12;
        const availableHeight = pageHeight - tableStartY - 5;
        const tableHeight = (availableHeight / 2) - 3; // Leave gap between tables

        // Generate first row of teams
        generateTeamTable(doc, firstRowTeams, tableStartY, marginX, availableWidth, tableHeight);

        // Generate second row of teams
        const secondTableY = tableStartY + tableHeight + 4;
        generateTeamTable(doc, secondRowTeams, secondTableY, marginX, availableWidth, tableHeight);
    } else {
        // Single row - use full height
        generateTeamTable(doc, teams, 12, marginX, availableWidth, pageHeight - 20);
    }

    // Footer with date
    const footerY = pageHeight - 2;
    doc.setFontSize(5);
    doc.setTextColor(150);
    doc.text(`Generado: ${date}`, pageWidth - 5, footerY, { align: 'right' });

    doc.save(`${tournamentName.toLowerCase().replace(/\s+/g, '-')}-equipos-${Date.now()}.pdf`);
};

// Helper function to generate a team table
function generateTeamTable(doc, teams, startY, marginX, availableWidth, maxHeight) {
    // Prepare column headers (team names)
    const headers = teams.map(t => t.name.toUpperCase());

    // Find maximum number of rows needed (starters + bench)
    const maxRows = Math.max(
        ...teams.map(t => {
            const starterCount = t.starters.filter(p => !p.vacante).length;
            const benchCount = t.bench.length;
            return starterCount + benchCount;
        })
    );

    // Build data rows - each row contains one player from each team
    const tableBody = [];

    for (let rowIdx = 0; rowIdx < maxRows; rowIdx++) {
        const row = [];

        teams.forEach(team => {
            // Combine starters (excluding vacantes) and bench
            const allPlayers = [
                ...team.starters.filter(p => !p.vacante),
                ...team.bench
            ];

            if (rowIdx < allPlayers.length) {
                const player = allPlayers[rowIdx];
                const captainMark = player.isCaptain ? ' (C)' : '';
                row.push(`${rowIdx + 1} ${player.name.toUpperCase()}${captainMark}`);
            } else {
                row.push(''); // Empty cell for teams with fewer players
            }
        });

        tableBody.push(row);
    }

    // Calculate optimal column width based on number of teams
    const colWidth = Math.floor(availableWidth / teams.length);

    // Determine font size based on number of teams (more teams = smaller font)
    let fontSize = 7;
    if (teams.length > 10) fontSize = 5;
    else if (teams.length > 8) fontSize = 6;
    else if (teams.length <= 4) fontSize = 8;

    // Generate the table
    autoTable(doc, {
        startY: startY,
        head: [headers],
        body: tableBody,
        theme: 'grid',
        styles: {
            fontSize: fontSize,
            cellPadding: 0.8,
            halign: 'left',
            valign: 'middle',
            lineWidth: 0.1,
            lineColor: [200, 200, 200],
            overflow: 'linebreak',
            minCellHeight: 3.5
        },
        headStyles: {
            fillColor: [80, 80, 80], // Gray header
            textColor: 255,
            fontSize: fontSize,
            fontStyle: 'bold',
            halign: 'center',
            cellPadding: 1,
            minCellHeight: 4.5
        },
        columnStyles: (() => {
            const styles = {};
            for (let i = 0; i < teams.length; i++) {
                styles[i] = { cellWidth: colWidth };
            }
            return styles;
        })(),
        alternateRowStyles: {
            fillColor: [250, 250, 250]
        },
        didParseCell: function (data) {
            // Highlight first row (usually DT or Captain)
            if (data.section === 'body' && data.row.index === 0) {
                data.cell.styles.fontStyle = 'bold';
            }
        },
        margin: { left: marginX, right: marginX, top: startY, bottom: 2 },
        tableWidth: 'auto'
    });
}
