/** 605 -> "10h 5m"; 60 -> "1h 0m"; 45 -> "45m" (omit "0h" prefix) */
export function formatDuration(totalMinutes: number): string {
  const minutes = Math.round(totalMinutes);
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;

  if (hours === 0) return `${mins}m`;
  return `${hours}h ${mins}m`;
}

/** 1 -> "day"; anything else -> "days" */
export function pluralizeDay(n: number): string {
  return n === 1 ? "day" : "days";
}

/** 1 -> "1 day"; 5 -> "5 days" */
export function formatDaysRemaining(n: number): string {
  return `${n} ${pluralizeDay(n)}`;
}

/** 1234 -> "1,234" */
export function formatNumber(n: number): string {
  return new Intl.NumberFormat("en-US").format(Math.round(n));
}

/** e.g. formatPacePerDay(18, "pages") -> "18 pages/day" */
export function formatPacePerDay(value: number, unitLabel: string): string {
  return `${formatNumber(value)} ${unitLabel}/day`;
}

/** 45 -> "45 min/day"; 90 -> "1h 30m/day" (switches to hour/minute format above 59 min) */
export function formatMinutesPacePerDay(value: number): string {
  if (Math.round(value) > 59) return `${formatDuration(value)}/day`;
  return formatPacePerDay(value, "min");
}

/** "2026-10-27" -> "October 27, 2026" (parsed as a local calendar date, not UTC) */
export function formatReleaseDate(releaseDateISO: string): string {
  const [year, month, day] = releaseDateISO.split("-").map(Number);
  const date = new Date(year, month - 1, day);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

const NUMBER_WORDS = [
  "zero", "one", "two", "three", "four", "five", "six",
  "seven", "eight", "nine", "ten", "eleven", "twelve",
];

/** 0-12 -> spelled out ("four"); above that, falls back to the digit. */
export function numberWord(n: number): string {
  return NUMBER_WORDS[n] ?? String(n);
}

/** (4, 7) -> "four of seven remain"; (5, 5) -> "all five remain"; (0, 5) -> "none remain" */
export function formatSeriesStatus(unreadCount: number, totalCount: number): string {
  if (totalCount === 0) return "no books yet";
  if (unreadCount === 0) return "none remain";
  if (unreadCount === totalCount) return `all ${numberWord(totalCount)} remain`;
  return `${numberWord(unreadCount)} of ${numberWord(totalCount)} remain`;
}
