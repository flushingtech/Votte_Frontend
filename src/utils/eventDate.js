// event_date comes from a plain Postgres DATE column — it has no time-of-day
// or timezone of its own. The API serializes it as a midnight UTC instant,
// but *which* midnight depends on whatever timezone the answering server
// process happens to run in (local dev is America/New_York, Vercel is UTC),
// so the exact instant isn't reliable — only the calendar date embedded in
// it is. Always read that date via UTC fields/timeZone, never local ones:
// local extraction silently rolls the date back a day for any browser west
// of the server's zone (which was Oct-16-shows-as-Friday-for-Oct-17 bug).

export function formatEventDate(dateString, options = {}) {
  return new Date(dateString).toLocaleDateString('en-US', { ...options, timeZone: 'UTC' });
}

export function eventDateWeekday(dateString, format = 'long') {
  return formatEventDate(dateString, { weekday: format });
}

export function eventDateDay(dateString) {
  return new Date(dateString).getUTCDate();
}

export function eventDateMonthShort(dateString) {
  return formatEventDate(dateString, { month: 'short' });
}

// A Date at UTC midnight for "today," so comparisons against event_date
// (`eventDateUTC(e) >= todayUTCMidnight()`) land on the right side of the
// upcoming/past boundary regardless of the browser's own timezone.
export function todayUTCMidnight() {
  const now = new Date();
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
}

// Re-anchor an event_date string to UTC midnight so it compares cleanly
// against todayUTCMidnight() even if the server serialized it with a
// non-zero UTC time component.
export function eventDateUTC(dateString) {
  const d = new Date(dateString);
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
}
