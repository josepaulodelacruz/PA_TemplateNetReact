/**
 * Kept apart from CategoryFields.jsx so that file only exports components -
 * mixing the two breaks fast refresh.
 */
export const SUB_TYPE = {
  boolean: 'boolean',
  string: 'string',
}

export const formatCreatedDate = (value) => {
  if (!value) return 'unknown date';

  const date = new Date(value);

  return Number.isNaN(date.getTime())
    ? 'unknown date'
    : date.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
}
