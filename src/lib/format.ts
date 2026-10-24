/**
 * Formatting helpers — English UI copy with standard Western digits (0-9).
 */

const enDate = new Intl.DateTimeFormat("en-US", {
  day: "numeric",
  month: "long",
  year: "numeric",
});

const enDateShort = new Intl.DateTimeFormat("en-US", {
  day: "numeric",
  month: "short",
});

const enWeekday = new Intl.DateTimeFormat("en-US", {
  weekday: "long",
});

/** "March 5, 2026" */
export function formatDateEn(iso: string | Date): string {
  const d = typeof iso === "string" ? new Date(iso + (iso.length === 10 ? "T00:00:00" : "")) : iso;
  return enDate.format(d);
}

/** "Mar 5" */
export function formatDateEnShort(iso: string): string {
  return enDateShort.format(new Date(iso + "T00:00:00"));
}

/** "Saturday, Mar 5" */
export function formatDayEn(iso: string): string {
  const d = new Date(iso + "T00:00:00");
  return `${enWeekday.format(d)}, ${enDateShort.format(d)}`;
}

/** Today as YYYY-MM-DD (local time). */
export function todayIso(): string {
  const d = new Date();
  const m = `${d.getMonth() + 1}`.padStart(2, "0");
  const day = `${d.getDate()}`.padStart(2, "0");
  return `${d.getFullYear()}-${m}-${day}`;
}

/** Weight display: trims trailing zeros → "102.5", "90" */
export function formatWeight(w: number): string {
  return Number(w.toFixed(2)).toString();
}

/** How many whole days since an ISO date. */
export function daysSince(iso: string): number {
  const then = new Date(iso + "T00:00:00").getTime();
  const now = new Date(todayIso() + "T00:00:00").getTime();
  return Math.round((now - then) / 86_400_000);
}

/** Greeting by local hour — in English. */
export function greetingEn(): string {
  const h = new Date().getHours();
  if (h < 5) return "Late night";
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  if (h < 21) return "Good evening";
  return "Late night";
}

interface MotivationInput {
  totalPrs: number;
  streakWeeks: number;
  lastPrDate: string | null;
  trainedThisWeek: boolean;
}

/** A dynamic, encouraging motivational line that adapts to recent activity. */
export function motivationalLine(input: MotivationInput): string {
  const { totalPrs, streakWeeks, lastPrDate, trainedThisWeek } = input;
  if (lastPrDate && daysSince(lastPrDate) <= 3) {
    return "Beast mode! You smashed a PR in the last few days — iron never lies.";
  }
  if (lastPrDate && daysSince(lastPrDate) <= 7) {
    return "Golden week! Your last PR is still echoing in the gym.";
  }
  if (totalPrs === 0) {
    return "Every champion started from zero. Log your first PR today and begin the legend.";
  }
  if (streakWeeks >= 4) {
    return `${streakWeeks} weeks of strict discipline — your body is rebuilding itself.`;
  }
  if (trainedThisWeek) {
    return "You trained this week. Next step: lift more than last time.";
  }
  return "Iron is waiting. Your next PR is closer than you think — go get it.";
}

/** Counters/quantities always render with standard Western numerals. */
export function formatCount(n: number | string): string {
  return String(n);
}

/** Relative "since" label in English. */
export function sinceLabelEn(iso: string): string {
  const d = daysSince(iso);
  if (d <= 0) return "Today";
  if (d === 1) return "Yesterday";
  if (d === 2) return "2 days ago";
  if (d <= 10) return `${d} days ago`;
  if (d < 30) return `${d} days ago`;
  const weeks = Math.floor(d / 7);
  if (weeks < 5) return weeks === 1 ? "1 week ago" : `${weeks} weeks ago`;
  const months = Math.floor(d / 30);
  return months === 1 ? "1 month ago" : `${months} months ago`;
}

/** Compute consecutive weekly training streak ending this week (or last). */
export function weeklyStreak(dates: string[]): number {
  if (dates.length === 0) return 0;
  const weeks = new Set(dates.map((d) => weekKey(d)));
  let streak = 0;
  const cursor = new Date(todayIso() + "T00:00:00");
  // If nothing logged this week yet, streak may continue from last week.
  if (!weeks.has(weekKey(todayIso()))) {
    cursor.setDate(cursor.getDate() - 7);
  }
  while (weeks.has(weekKey(toIso(cursor)))) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 7);
  }
  return streak;
}

function toIso(d: Date): string {
  const m = `${d.getMonth() + 1}`.padStart(2, "0");
  const day = `${d.getDate()}`.padStart(2, "0");
  return `${d.getFullYear()}-${m}-${day}`;
}

/** Monday-based week identifier. */
function weekKey(iso: string): string {
  const d = new Date(iso + "T00:00:00");
  const day = (d.getDay() + 6) % 7; // Monday = 0
  d.setDate(d.getDate() - day);
  return toIso(d);
}
