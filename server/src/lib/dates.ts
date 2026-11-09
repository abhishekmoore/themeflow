import { formatDistanceToNow } from "date-fns";

export function formatRelative(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "unknown time";
  return formatDistanceToNow(date, { addSuffix: true });
}
