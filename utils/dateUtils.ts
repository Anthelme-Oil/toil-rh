let hasTime: boolean = false;
export function DateFormat(
  date: string | Date,
  showTime?: typeof hasTime,
): string | Date {
  if (!date) {
    return "";
  }
  if (showTime) {
    return formatDateTime(date);
  }

  return formatDate(date);
}

function formatDate(date: string | Date) {
  return new Date(date).toLocaleDateString("fr-FR");
}

function formatDateTime(date: string | Date) {
  return new Date(date).toLocaleString("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}
