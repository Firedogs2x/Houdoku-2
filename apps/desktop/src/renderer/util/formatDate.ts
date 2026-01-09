/**
 * Format an ISO date string to MM/DD/YYYY format.
 * If no date is provided, returns an empty string.
 * @param isoDate ISO date string (e.g., 2026-01-09T00:00:00Z)
 * @returns formatted date string (e.g., 01/09/2026) or empty string
 */
export const formatDateMMDDYYYY = (isoDate?: string): string => {
  if (!isoDate) return '';

  try {
    const date = new Date(isoDate);
    const month = String(date.getUTCMonth() + 1).padStart(2, '0');
    const day = String(date.getUTCDate()).padStart(2, '0');
    const year = date.getUTCFullYear();
    return `${month}/${day}/${year}`;
  } catch {
    return '';
  }
};
