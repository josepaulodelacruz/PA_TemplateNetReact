// Shared Excel-sheet styling for the HomeBuyer Feedback tables.
// All colors come from Mantine's scheme-aware CSS variables so the
// tables adapt to light and dark themes.

export const FILL_GOOD = {
  backgroundColor: 'var(--mantine-color-teal-light)',
  color: 'var(--mantine-color-teal-light-color)',
};

export const FILL_WARN = {
  backgroundColor: 'var(--mantine-color-yellow-light)',
  color: 'var(--mantine-color-yellow-light-color)',
};

export const FILL_BAD = {
  backgroundColor: 'var(--mantine-color-red-light)',
  color: 'var(--mantine-color-red-light-color)',
};

// Excel-style conditional formatting for 1-5 satisfaction scores
export const scoreFill = (score) => {
  if (score >= 4) return FILL_GOOD;
  if (score === 3) return FILL_WARN;
  return FILL_BAD;
};

// Conditional formatting for text answers (e.g. "Definitely Yes", "Not yet")
export const answerFill = (answer) => {
  switch ((answer ?? '').toLowerCase()) {
    case 'definitely yes':
    case 'yes':
      return FILL_GOOD;
    case 'probably yes':
    case 'not sure':
    case 'not yet':
      return FILL_WARN;
    case 'probably not':
    case 'definitely not':
    case 'no':
      return FILL_BAD;
    default:
      return {};
  }
};

export const excelCell = {
  border: '1px solid var(--mantine-color-default-border)',
  fontSize: 13,
  padding: '4px 8px',
  whiteSpace: 'nowrap',
};

export const excelHeader = {
  ...excelCell,
  backgroundColor: 'var(--mantine-color-default-hover)',
  fontWeight: 600,
  textAlign: 'center',
  textTransform: 'uppercase',
  fontSize: 12,
};

// Gray corner / row-number cells, like Excel's row headers
export const excelRowNumber = {
  ...excelCell,
  backgroundColor: 'var(--mantine-color-default-hover)',
  color: 'var(--mantine-color-dimmed)',
  textAlign: 'center',
  fontSize: 12,
  width: 36,
};

export const excelTextCell = {
  ...excelCell,
  whiteSpace: 'normal',
  minWidth: 240,
};
