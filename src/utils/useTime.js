export function timeAgo(timestamp) {
  if (!timestamp) return "—";

  const ms =
    typeof timestamp.seconds === "number"
      ? timestamp.seconds * 1000
      : timestamp.toMillis?.() ?? null;

  if (!ms) return "—";

  const diff = ms - Date.now();

  const units = [
    ["year", 1000 * 60 * 60 * 24 * 365],
    ["month", 1000 * 60 * 60 * 24 * 30],
    ["week", 1000 * 60 * 60 * 24 * 7],
    ["day", 1000 * 60 * 60 * 24],
    ["hour", 1000 * 60 * 60],
    ["minute", 1000 * 60],
    ["second", 1000],
  ];

  const rtf = new Intl.RelativeTimeFormat("fr", { numeric: "auto" });

  for (const [unit, msUnit] of units) {
    if (Math.abs(diff) >= msUnit || unit === "second") {
      return rtf.format(Math.round(diff / msUnit), unit);
    }
  }
}
