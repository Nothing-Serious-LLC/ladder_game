// LADDER – shared time utilities for game-day calculations
// Eastern Time zone with 3 AM reset rules are centralized here so every file stays in sync.

/**
 * Return the game-day (YYYY-MM-DD) string in America/New_York timezone.
 * Game day rolls over at 3 AM ET instead of midnight.
 */
export function getGameDayString(date = new Date()) {
  // Convert the supplied date (or now) to Eastern time while preserving   the same moment in time.
  const easternDate = new Date(
    date.toLocaleString('en-US', { timeZone: 'America/New_York' })
  );

  // Subtract 3 hours so that the new game day begins at 03:00 ET.
  easternDate.setHours(easternDate.getHours() - 3, 0, 0, 0);

  // Return YYYY-MM-DD.
  return easternDate.toISOString().split('T')[0];
}

/**
 * Calculate puzzle number (days since launch) obeying ET 3 AM rollover.
 * @param {string} launchDateStr – launch date in YYYY-MM-DD (midnight ET)
 */
export function getPuzzleNumber(launchDateStr = '2025-07-28') {
  const msPerDay = 86_400_000;
  const launchMidnightET = new Date(`${launchDateStr}T00:00:00-05:00`); // offset -05 covers EST; DST math handled by getGameDayString

  const todayStr = getGameDayString();
  const todayMidnightET = new Date(`${todayStr}T00:00:00-05:00`);

  const diffDays = Math.floor((todayMidnightET - launchMidnightET) / msPerDay);
  return diffDays + 1; // Launch day is puzzle #1
}

// Quick sanity in dev environment (will be stripped by minifiers)
if (typeof window !== 'undefined' && window.location && window.location.hostname === 'localhost') {
  console.assert(getGameDayString().length === 10, 'getGameDayString format check');
}
