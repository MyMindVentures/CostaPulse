import {
  Anchor,
  Droplets,
  Fuel,
  GlassWater,
  Ship,
  UsersRound,
  type LucideIcon
} from "lucide-react";

const HIGHLIGHT_ICONS: LucideIcon[] = [
  Ship,
  Droplets,
  GlassWater,
  Anchor,
  Fuel,
  UsersRound
];

type DetailHighlightsBarProps = {
  highlights: string[];
};

function splitHighlight(text: string): {
  title: string;
  subtitle: string | null;
} {
  const separators = [" — ", " - ", ": ", " with ", " for "];
  for (const separator of separators) {
    const index = text.indexOf(separator);
    if (index > 0 && index < text.length - separator.length) {
      return {
        title: text.slice(0, index).trim(),
        subtitle: text.slice(index + separator.length).trim()
      };
    }
  }

  const words = text.trim().split(/\s+/);
  if (words.length <= 3) {
    return { title: text, subtitle: null };
  }

  return {
    title: words.slice(0, 2).join(" "),
    subtitle: words.slice(2).join(" ")
  };
}

export function DetailHighlightsBar({ highlights }: DetailHighlightsBarProps) {
  if (highlights.length === 0) return null;

  return (
    <section className="xp-highlights" aria-label="Experience highlights">
      <ul>
        {highlights.map((highlight, index) => {
          const Icon = HIGHLIGHT_ICONS[index % HIGHLIGHT_ICONS.length]!;
          const { title, subtitle } = splitHighlight(highlight);

          return (
            <li key={highlight}>
              <span className="xp-highlight-icon" aria-hidden>
                <Icon size={22} />
              </span>
              <strong>{title}</strong>
              {subtitle ? <span>{subtitle}</span> : null}
            </li>
          );
        })}
      </ul>
    </section>
  );
}
