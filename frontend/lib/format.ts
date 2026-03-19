export function formatPercent(value: number | undefined) {
  return `${Math.round((value ?? 0) * 100)}%`;
}

export function formatDecimal(value: number | undefined, digits = 2) {
  return Number(value ?? 0).toFixed(digits);
}

export function formatLocalDateTime(value: string | undefined) {
  if (!value) {
    return "--";
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return value;
  }

  return `${parsed.getFullYear()}/${parsed.getMonth() + 1}/${parsed.getDate()} ${String(parsed.getHours()).padStart(2, "0")}:${String(parsed.getMinutes()).padStart(2, "0")}`;
}

export function formatLocalDate(value: string | undefined) {
  if (!value) {
    return "--";
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return value;
  }

  return `${parsed.getMonth() + 1}/${parsed.getDate()}`;
}

export function formatLocalClock(value: string | undefined) {
  if (!value) {
    return "--";
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return value;
  }

  return `${String(parsed.getHours()).padStart(2, "0")}:${String(parsed.getMinutes()).padStart(2, "0")}`;
}
