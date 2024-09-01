export const getWeekdayNumber = (): number => {
  // Get current date in UTC
  const now = new Date();

  // Adjust time to GMT+6
  const utcOffset = now.getTimezoneOffset(); // Offset in minutes
  const gmt6Time = new Date(now.getTime() + (utcOffset + 6 * 60) * 60000);

  // Get day of the week (0 = Sunday, 1 = Monday, ..., 6 = Saturday)
  const day = gmt6Time.getUTCDay();

  // Convert to the required format
  if (day === 0 || day === 6) {
    return 0; // Saturday or Sunday
  }
  return day - 1; // Shift to make Monday = 0
}