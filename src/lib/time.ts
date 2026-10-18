/**
 * Time and Timezone utilities for Asia/Taipei (UTC+8)
 */

export const TAIPEI_TIMEZONE = 'Asia/Taipei';

/**
 * Returns current date formatted as YYYY-MM-DD in Asia/Taipei timezone.
 */
export function getTaipeiDateString(date: Date = new Date()): string {
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: TAIPEI_TIMEZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
  return formatter.format(date);
}

/**
 * Gets the current month and day in Asia/Taipei
 */
export function getTaipeiMonthDay(date: Date = new Date()): { month: number; day: number; year: number } {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: TAIPEI_TIMEZONE,
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
  }).formatToParts(date);

  let year = date.getFullYear();
  let month = date.getMonth() + 1;
  let day = date.getDate();

  for (const part of parts) {
    if (part.type === 'year') year = parseInt(part.value, 10);
    if (part.type === 'month') month = parseInt(part.value, 10);
    if (part.type === 'day') day = parseInt(part.value, 10);
  }

  return { month, day, year };
}

/**
 * Calculates remaining milliseconds and formatted string (HH:MM:SS) until next 00:00 Asia/Taipei
 */
export function getTimeUntilTaipeiMidnight(now: Date = new Date()): {
  hours: number;
  minutes: number;
  seconds: number;
  totalMs: number;
  formatted: string;
} {
  // Convert current time to Taipei time representation
  const taipeiNowStr = now.toLocaleString('en-US', { timeZone: TAIPEI_TIMEZONE });
  const taipeiNow = new Date(taipeiNowStr);

  const taipeiMidnight = new Date(taipeiNow);
  taipeiMidnight.setDate(taipeiMidnight.getDate() + 1);
  taipeiMidnight.setHours(0, 0, 0, 0);

  const diffMs = Math.max(0, taipeiMidnight.getTime() - taipeiNow.getTime());

  const totalSeconds = Math.floor(diffMs / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  const pad = (n: number) => n.toString().padStart(2, '0');
  const formatted = `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;

  return {
    hours,
    minutes,
    seconds,
    totalMs: diffMs,
    formatted,
  };
}

/**
 * Checks whether an event/festival is currently active in Asia/Taipei
 */
export function isFestivalActive(
  range?: {
    startMonth: number;
    startDay: number;
    endMonth: number;
    endDay: number;
  },
  now: Date = new Date()
): boolean {
  if (!range) return true; // Permanent pack is always active

  const { month, day } = getTaipeiMonthDay(now);

  const currentScore = month * 100 + day;
  const startScore = range.startMonth * 100 + range.startDay;
  const endScore = range.endMonth * 100 + range.endDay;

  // Handles normal ranges within the same year (e.g. 10-20 to 11-05)
  if (startScore <= endScore) {
    return currentScore >= startScore && currentScore <= endScore;
  }

  // Handles year-wrap ranges (e.g. New Year 12-31 to 01-10)
  return currentScore >= startScore || currentScore <= endScore;
}
