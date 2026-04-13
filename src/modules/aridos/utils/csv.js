function escapeCsvValue(value) {
  const raw = String(value ?? "");
  if (/[",;\n\r]/.test(raw)) {
    return `"${raw.replace(/"/g, '""')}"`;
  }
  return raw;
}

export function buildCsv(rows = []) {
  if (!rows.length) return "";

  const headers = Object.keys(rows[0]);
  const lines = [headers.map(escapeCsvValue).join(";")];

  rows.forEach((row) => {
    lines.push(headers.map((key) => escapeCsvValue(row[key])).join(";"));
  });

  return lines.join("\n");
}

export function downloadCsv(filename, rows = []) {
  const csv = buildCsv(rows);
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);

  link.href = url;
  link.download = filename;
  link.click();

  URL.revokeObjectURL(url);
}