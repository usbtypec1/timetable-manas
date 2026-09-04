export const BISHKEK_UTC_OFFSET_MINUTES = 6 * 60

// Returns a Date whose UTC getters reflect the current wall-clock time in Bishkek (GMT+6, no DST)
export const getBishkekNow = (): Date => {
  const now = new Date()
  const utcOffset = now.getTimezoneOffset() // Offset in minutes
  return new Date(now.getTime() + (utcOffset + BISHKEK_UTC_OFFSET_MINUTES) * 60000)
}

export const getWeekdayNumber = (): number => {
  // Get day of the week (0 = Sunday, 1 = Monday, ..., 6 = Saturday)
  const day = getBishkekNow().getUTCDay()

  // Convert to the required format
  if (day === 0 || day === 6) {
    return 0 // Saturday or Sunday
  }
  return day - 1 // Shift to make Monday = 0
}
