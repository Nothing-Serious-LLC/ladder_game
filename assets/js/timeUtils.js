// LADDER – shared time utilities for game-day calculations
// Eastern Time zone with 3 AM reset rules are centralized here so every file stays in sync.

/**
 * Return the game-day (YYYY-MM-DD) string in America/New_York timezone.
 * Game day rolls over at 3 AM ET instead of midnight.
 */
export function getGameDayString(date = new Date()) {
  // Get Eastern time components using Intl.DateTimeFormat
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/New_York',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  });
  
  const parts = formatter.formatToParts(date);
  const etYear = parseInt(parts.find(p => p.type === 'year').value);
  const etMonth = parseInt(parts.find(p => p.type === 'month').value) - 1; // 0-indexed  
  const etDay = parseInt(parts.find(p => p.type === 'day').value);
  const etHour = parseInt(parts.find(p => p.type === 'hour').value);
  
  // Create a date object for the current ET day
  let gameDay = new Date(etYear, etMonth, etDay);
  
  // If before 3am ET, the game day is actually the previous day
  if (etHour < 3) {
    gameDay.setDate(gameDay.getDate() - 1);
  }
  
  // Format as YYYY-MM-DD
  const year = gameDay.getFullYear();
  const month = String(gameDay.getMonth() + 1).padStart(2, '0');
  const day = String(gameDay.getDate()).padStart(2, '0');
  
  return `${year}-${month}-${day}`;
}

/**
 * Calculate puzzle number (days since launch) obeying ET 3 AM rollover.
 * @param {string} launchDateStr – launch date in YYYY-MM-DD (midnight ET)
 */
export function getPuzzleNumber(launchDateStr = '2025-07-28') {
  // Get today's game day (accounting for 3am ET rollover)
  const todayGameDay = getGameDayString();
  
  // Simple date string comparison - both are YYYY-MM-DD format
  const launchDate = new Date(launchDateStr + 'T12:00:00Z'); // Use UTC noon to avoid timezone issues
  const currentGameDate = new Date(todayGameDay + 'T12:00:00Z');
  
  // Calculate difference in days
  const msPerDay = 24 * 60 * 60 * 1000;
  const diffDays = Math.round((currentGameDate - launchDate) / msPerDay);
  
  return diffDays + 1; // Launch day is puzzle #1
}

// Quick sanity in dev environment (will be stripped by minifiers)
if (typeof window !== 'undefined' && window.location && window.location.hostname === 'localhost') {
  console.assert(getGameDayString().length === 10, 'getGameDayString format check');
}
