/**
 * Kept apart from the matrix components so those files only export components -
 * mixing the two breaks fast refresh.
 */

/*THE GROUP_CODE OF [DOC].[MatrixLookup] - ONE PER SELECT OF THE ROW FORM*/
export const LOOKUP_GROUP = {
  scannedCopy: 'SCANNED_COPY',
  dueDate: 'DUE_DATE',
  milestone: 'MILESTONE',
  expiry: 'EXPIRY',
  source: 'SOURCE',
}

/**
 * The cell address, rebuilt exactly the way [DOC].[vw_MatrixColumn] builds it so a
 * checkbox drawn from a column can be looked up against a cell read from the proc.
 */
export const buildColumnKey = ({ main_id, sub_id, option_id }) => {
  let key = `M${main_id}`;

  if (sub_id !== null && sub_id !== undefined) key += `_S${sub_id}`;
  if (option_id !== null && option_id !== undefined) key += `_O${option_id}`;

  return key;
}

/**
 * The two-row header of the workbook: an axis spans its columns on the top row and
 * each column labels itself underneath. The proc already returns them in order, so
 * this only has to break the flat list on a change of axis.
 */
export const groupColumnsByAxis = (columns) => {
  const axes = [];

  columns.forEach((column) => {
    const last = axes[axes.length - 1];

    if (last && last.mainId === column.main_id) {
      last.columns.push(column);
      return;
    }

    axes.push({
      mainId: column.main_id,
      axisName: column.axis_name,
      columns: [column],
    });
  });

  return axes;
}

/**
 * The rows broken into the workbook's section bands (BASIC REQUIREMENTS, PROOF OF
 * INCOME, ...). The proc orders by section already, so a change of label_id opens
 * a new band - which keeps two sections that share a name apart.
 */
export const groupRowsBySection = (rows) => {
  const sections = [];

  rows.forEach((row) => {
    const last = sections[sections.length - 1];

    if (last && last.labelId === row.label_id) {
      last.rows.push(row);
      return;
    }

    sections.push({
      labelId: row.label_id,
      section: row.section || 'UNFILED',
      rows: [row],
    });
  });

  return sections;
}

/**
 * A lookup of the ticked cells, keyed by row and column. A column with no entry is
 * simply unticked - the proc only returns the cells that were answered.
 */
export const buildCellIndex = (cells) => {
  const index = new Map();

  cells.forEach((cell) => {
    index.set(`${cell.hdr_id}|${cell.column_key}`, Boolean(cell.is_applicable));
  });

  return index;
}

/*THE FLAT LOOKUP ROWS, NARROWED TO ONE GROUP AND SHAPED FOR A MANTINE SELECT*/
export const toSelectData = (lookups, group) =>
  lookups
    .filter((lookup) => lookup.group_code === group)
    .map((lookup) => ({ value: String(lookup.id), label: lookup.value }));

export const readError = (error) =>
  error?.response?.data?.message || error?.message || 'Something went wrong.';
