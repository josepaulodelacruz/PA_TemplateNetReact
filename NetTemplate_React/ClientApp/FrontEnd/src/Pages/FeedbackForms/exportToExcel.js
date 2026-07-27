import * as XLSX from 'xlsx-js-style';

// Excel's classic conditional-formatting fills (green / yellow / red)
export const EXCEL_FILLS = {
  good: {
    fill: { patternType: 'solid', fgColor: { rgb: 'C6EFCE' } },
    font: { color: { rgb: '006100' } },
  },
  warn: {
    fill: { patternType: 'solid', fgColor: { rgb: 'FFEB9C' } },
    font: { color: { rgb: '9C6500' } },
  },
  bad: {
    fill: { patternType: 'solid', fgColor: { rgb: 'FFC7CE' } },
    font: { color: { rgb: '9C0006' } },
  },
};

// 4-5 green, 3 yellow, 1-2 red; no fill for blank/non-numeric answers
export const scoreExcelFill = (score) => {
  const value = Number(score);
  if (!value || Number.isNaN(value)) return null;
  if (value >= 4) return EXCEL_FILLS.good;
  if (value === 3) return EXCEL_FILLS.warn;
  return EXCEL_FILLS.bad;
};

// DONE green, everything else (ONGOING / Pending) yellow
export const stageExcelFill = (title) =>
  title?.toUpperCase() === 'DONE' ? EXCEL_FILLS.good : EXCEL_FILLS.warn;

const HEADER_STYLE = {
  font: { bold: true },
  fill: { patternType: 'solid', fgColor: { rgb: 'F2F2F2' } },
  alignment: { horizontal: 'center' },
};

// Shared Excel export for the HomeBuyer Feedback tables.
// columns: [{ header, value | key, width?, style? }] — `value` is a function of
// the row, `key` reads the row property directly, and `style` is an optional
// function of the row returning an xlsx-js-style cell style (see EXCEL_FILLS).
const exportToExcel = ({ fileName, sheetName = 'Responses', columns, rows }) => {
  const data = rows.map((row) => {
    const record = {};
    columns.forEach((column) => {
      const value = column.value ? column.value(row) : row[column.key];
      record[column.header] = value ?? '';
    });
    return record;
  });

  const worksheet = XLSX.utils.json_to_sheet(data, {
    header: columns.map((column) => column.header),
  });
  worksheet['!cols'] = columns.map((column) => ({ wch: column.width ?? 16 }));

  columns.forEach((column, columnIndex) => {
    // Header row styling
    const headerCell = worksheet[XLSX.utils.encode_cell({ r: 0, c: columnIndex })];
    if (headerCell) headerCell.s = HEADER_STYLE;

    // Conditional cell styling
    if (!column.style) return;
    rows.forEach((row, rowIndex) => {
      const style = column.style(row);
      if (!style) return;
      const cell = worksheet[XLSX.utils.encode_cell({ r: rowIndex + 1, c: columnIndex })];
      if (cell) cell.s = style;
    });
  });

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
  XLSX.writeFile(workbook, fileName);
};

export default exportToExcel;
