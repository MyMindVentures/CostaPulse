function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

export function buildBookingPaymentReceivedHtml(input: {
  greeting: string;
  intro: string;
  rows: Array<{ label: string; value: string }>;
  outro: string;
}): string {
  const rowsHtml = input.rows
    .map(
      (row) =>
        `<tr><td style="padding:4px 12px 4px 0;color:#5b6570;vertical-align:top;">${escapeHtml(row.label)}</td><td style="padding:4px 0;color:#0f172a;font-weight:600;">${escapeHtml(row.value)}</td></tr>`
    )
    .join("");

  return [
    `<p>${escapeHtml(input.greeting)}</p>`,
    `<p>${escapeHtml(input.intro)}</p>`,
    `<table role="presentation" cellpadding="0" cellspacing="0" style="border-collapse:collapse;margin:16px 0;">${rowsHtml}</table>`,
    `<p>${escapeHtml(input.outro)}</p>`
  ].join("\n");
}
