/** RFC-4180-ish CSV builder with UTF-8 BOM so Excel renders Arabic correctly. */

function escapeCell(value: string | number | null | undefined): string {
  if (value === null || value === undefined) return "";
  const s = String(value);
  if (/[",\n\r]/.test(s)) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

export function buildCsv(headers: string[], rows: (string | number | null)[][]): string {
  const lines = [headers.map(escapeCell).join(",")];
  for (const row of rows) {
    lines.push(row.map(escapeCell).join(","));
  }
  // BOM guarantees Arabic opens correctly in Excel.
  return "\uFEFF" + lines.join("\r\n");
}
