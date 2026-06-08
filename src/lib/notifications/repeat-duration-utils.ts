const REPEAT_DURATION_REGEX = /^\s*(?:(\d+)\s*h)?\s*(?:(\d+)\s*m)?\s*$/i;

export const parseRepeatDuration = (value: string): number | null => {
  const match = REPEAT_DURATION_REGEX.exec(value);
  if (!match) {
    return null;
  }

  const hoursRaw = match[1];
  const minutesRaw = match[2];

  if (hoursRaw === undefined && minutesRaw === undefined) {
    return null;
  }

  const hours = hoursRaw ? Number.parseInt(hoursRaw, 10) : 0;
  const minutes = minutesRaw ? Number.parseInt(minutesRaw, 10) : 0;

  if (Number.isNaN(hours) || Number.isNaN(minutes)) {
    return null;
  }

  return hours * 60 + minutes;
};
