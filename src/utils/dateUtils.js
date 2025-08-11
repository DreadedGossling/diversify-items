// src/utils/dateUtils.js

/**
 * Format a date string from "YYYY-MM-DD" to "DD-MM-YYYY"
 * Returns the original string if format is unexpected or empty.
 * @param {string} dateStr - Date string in "YYYY-MM-DD" format
 * @returns {string} Formatted date string "DD-MM-YYYY"
 */
export const formatDate = (dateStr) => {
  if (!dateStr) return "";
  const [year, month, day] = dateStr.split("-");
  if (!year || !month || !day) return dateStr;
  return `${day}-${month}-${year}`;
};

/**
 * Calculate the difference in whole days between today (start of day) and a target date.
 * Returns null if input dateStr is "-", "No Return", or empty.
 * Positive if targetDate is in future, negative if in past.
 * @param {string} dateStr - Date string in "YYYY-MM-DD" format
 * @returns {number|null} Number of days difference or null
 */
export const getDaysDifference = (dateStr) => {
  if (!dateStr || dateStr === "No Return" || dateStr === "-") {
    return null;
  }
  const today = new Date();
  const targetDate = new Date(dateStr + "T00:00:00");
  today.setHours(0, 0, 0, 0);
  const diffTime = targetDate - today;
  return Math.floor(diffTime / (1000 * 60 * 60 * 24));
};

/**
 * Calculate the number of whole days since the given date string until today.
 * Returns null if dateStr is empty or invalid.
 * @param {string} dateStr - Date string in "YYYY-MM-DD" format
 * @returns {number|null} Number of days since dateStr or null
 */
export function getDaysSinceDate(dateStr) {
  if (!dateStr) return null;
  const startDate = new Date(dateStr + "T00:00:00");
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const diffTime = today - startDate;
  return Math.floor(diffTime / (1000 * 60 * 60 * 24));
}
