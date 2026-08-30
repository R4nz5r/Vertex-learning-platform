/**
 * Format duration in seconds into human-readable strings.
 * e.g., 3660 -> "1h 1m", 2700 -> "45m", 350 -> "5m 50s"
 */
export function formatDurationHoursMinutes(totalSeconds: number): string {
  if (!totalSeconds || totalSeconds <= 0) return "0m";
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);

  if (hours > 0) {
    return minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`;
  }
  return `${minutes}m`;
}

/**
 * Format duration in seconds into human-readable strings with minutes and seconds.
 * e.g., 3660 -> "1h 1m", 350 -> "5m 50s", 45 -> "45s"
 */
export function formatDurationMinutesSeconds(totalSeconds: number): string {
  if (!totalSeconds || totalSeconds <= 0) return "0m";
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = Math.floor(totalSeconds % 60);

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  if (minutes > 0) {
    return seconds > 0 ? `${minutes}m ${seconds}s` : `${minutes}m`;
  }
  return `${seconds}s`;
}

/**
 * Format student count (e.g. 18240 -> "18.2k", 2100 -> "2.1k", 850 -> "850")
 */
export function formatStudentCount(count: number): string {
  if (!count || count <= 0) return "0";
  if (count >= 1000) {
    const formatted = (count / 1000).toFixed(1).replace(/\.0$/, "");
    return `${formatted}k`;
  }
  return count.toString();
}
