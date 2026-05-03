const ilsFormatter = new Intl.NumberFormat("he-IL", {
  style: "currency",
  currency: "ILS",
  maximumFractionDigits: 0,
});

const ilsFormatterDecimal = new Intl.NumberFormat("he-IL", {
  style: "currency",
  currency: "ILS",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export function formatILS(value: number, decimals = false): string {
  if (Number.isNaN(value) || value === undefined || value === null) return "—";
  return decimals ? ilsFormatterDecimal.format(value) : ilsFormatter.format(value);
}

export function formatDateHe(input: Date | string): string {
  const d = typeof input === "string" ? new Date(input) : input;
  return new Intl.DateTimeFormat("he-IL", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(d);
}

export function formatPhoneHe(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (digits.length === 10) {
    return `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6)}`;
  }
  return phone;
}
