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
 * Format timestamp in seconds to mm:ss or hh:mm:ss format.
 * e.g. 765 -> "12:45", 512 -> "08:32", 918 -> "15:18", 401 -> "06:41"
 */
export function formatTimestamp(totalSeconds: number): string {
  if (!totalSeconds || totalSeconds <= 0) return "00:00";
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = Math.floor(totalSeconds % 60);

  const mm = minutes.toString().padStart(2, "0");
  const ss = seconds.toString().padStart(2, "0");

  if (hours > 0) {
    const hh = hours.toString().padStart(2, "0");
    return `${hh}:${mm}:${ss}`;
  }
  return `${mm}:${ss}`;
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
