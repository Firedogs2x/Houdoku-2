/**
 * Format a date string to MM/DD/YYYY format using local time.
 * If no date is provided, returns an empty string.
 * @param isoDate Date string (e.g., 2026-01-09T00:00:00Z)
 * @returns formatted date string (e.g., 01/09/2026) or empty string
 */
export const formatDateMMDDYYYY = (isoDate?: string): string => {
  if (!isoDate) return '';

  try {
    const date = new Date(isoDate);
    if (Number.isNaN(date.getTime())) return '';
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const year = date.getFullYear();
    return `${month}/${day}/${year}`;
  } catch {
    return '';
  }
};
