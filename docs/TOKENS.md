# Design tokens

Binding visual policy: [`docs/FRONTEND-STYLE-GUARDRAILS.md`](FRONTEND-STYLE-GUARDRAILS.md).

Source of truth: brand CSS variables in [`src/app/globals.css`](../src/app/globals.css).

## Brand tokens

| Token                                  | Role                              |
| -------------------------------------- | --------------------------------- |
| `--navy`, `--navy-deep`, `--navy-soft` | Primary surfaces, headings, shell |
| `--turquoise`, `--turquoise-deep`      | Accents, focus ring alias         |
| `--coral`, `--coral-dark`              | Primary CTA / destructive         |
| `--gold`                               | Highlight accent                  |
| `--sand`, `--white`, `--panel`         | Page and card backgrounds         |
| `--ink`, `--muted`                     | Text                              |
| `--border`                             | Borders / inputs                  |
| `--shadow`                             | Elevation                         |
| `--shell-nav-height`                   | Layout chrome                     |

## Semantic aliases (shadcn)

`--background`, `--foreground`, `--primary`, `--ring`, `--destructive`, etc. alias the brand tokens above. Do not introduce a second palette or default purple/neutral theme.

## Usage

- Prefer Tailwind theme colors wired via `@theme inline` (`bg-primary`, `text-navy`, …).
- New visual patterns belong in `src/components/ui` or `src/components/shared`, not one-off page CSS.
- Document primitives in Storybook (`npm run storybook`).

See `.cursor/rules/design-system.mdc`.
