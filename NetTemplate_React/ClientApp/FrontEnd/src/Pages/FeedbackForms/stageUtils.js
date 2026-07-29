import { FILL_GOOD, FILL_WARN } from './excelStyles';

// Resolve a response's status (stage id or stage title, depending on what the
// API returns) to the stage title. Returns null when the response has no status.
export const stageTitle = (status, stages = []) => {
  if (status === null || status === undefined || status === '') return null;
  const match = stages.find(
    (stage) => String(stage.id) === String(status) || stage.title === status
  );
  return match ? match.title : String(status);
};

// Excel-style fill for the Status column: DONE is green, everything else
// (ONGOING, Pending) is yellow.
export const stageFill = (title) => {
  if (!title) return;

  return title?.toUpperCase() === 'DONE' ? FILL_GOOD : FILL_WARN;
}
