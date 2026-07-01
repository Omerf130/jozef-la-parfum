const ISRAEL_TZ = "Asia/Jerusalem";

const DATETIME_LOCAL_RE = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})(?::(\d{2}))?$/;

function readIsraelParts(date: Date) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: ISRAEL_TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).formatToParts(date);

  const get = (type: Intl.DateTimeFormatPartTypes) =>
    Number(parts.find((p) => p.type === type)?.value ?? "0");

  return {
    year: get("year"),
    month: get("month"),
    day: get("day"),
    hour: get("hour") % 24,
    minute: get("minute"),
    second: get("second"),
  };
}

/** Parse admin `datetime-local` value as Israel wall-clock time → UTC Date. */
export function parseIsraelDateTimeLocal(value: string): Date {
  const match = value.trim().match(DATETIME_LOCAL_RE);
  if (!match) return new Date(NaN);

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const hour = Number(match[4]);
  const minute = Number(match[5]);
  const second = match[6] ? Number(match[6]) : 0;

  let guess = Date.UTC(year, month - 1, day, hour, minute, second);

  for (let i = 0; i < 5; i++) {
    const actual = readIsraelParts(new Date(guess));
    if (
      actual.year === year &&
      actual.month === month &&
      actual.day === day &&
      actual.hour === hour &&
      actual.minute === minute &&
      actual.second === second
    ) {
      return new Date(guess);
    }

    const desiredMs = Date.UTC(year, month - 1, day, hour, minute, second);
    const actualMs = Date.UTC(
      actual.year,
      actual.month - 1,
      actual.day,
      actual.hour,
      actual.minute,
      actual.second,
    );
    guess += desiredMs - actualMs;
  }

  return new Date(guess);
}

/** Format UTC Date for admin `datetime-local` in Israel time. */
export function formatIsraelDateTimeLocal(date: Date): string {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: ISRAEL_TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(date);

  const get = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((p) => p.type === type)?.value ?? "";

  const hour = String(Number(get("hour")) % 24).padStart(2, "0");
  return `${get("year")}-${get("month")}-${get("day")}T${hour}:${get("minute")}`;
}

export function parseCouponExpiresAt(value: string | null | undefined): Date | undefined | null {
  if (value === null) return null;
  if (value === undefined || value === "") return undefined;
  return parseIsraelDateTimeLocal(value);
}
