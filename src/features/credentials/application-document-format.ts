export function formatApplicationDocumentLanguage(
  languageCode: string | null,
  locale: string
): string {
  if (!languageCode) return "—";

  try {
    return (
      new Intl.DisplayNames([locale], { type: "language" }).of(languageCode) ??
      languageCode
    );
  } catch {
    return languageCode;
  }
}
