export function formatDate(iso: string | undefined): string {
  if (!iso) return "";
  const d = new Date(iso);
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

export function formatFullDate(iso: string | undefined): string {
  if (!iso) return "";
  return new Date(iso).toLocaleString();
}
