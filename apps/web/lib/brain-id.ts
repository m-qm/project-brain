/** Deep-link id. Same rule for /start payloads and folder names. */
export function normalizeBrainId(raw: string | null | undefined): string | null {
  const id = (raw ?? "").trim().toLowerCase();
  if (!/^[a-z0-9][a-z0-9_-]{0,63}$/.test(id)) return null;
  return id;
}
