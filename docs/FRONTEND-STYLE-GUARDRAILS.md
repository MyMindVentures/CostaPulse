# CostaPulse Frontend Style Guardrails

Binding for every page and component. Do not deviate unless the current task explicitly changes the design system.

## Brand character

Premium Mediterranean, warm, calm, trustworthy and adventurous. Never generic SaaS, neon, playful-cartoon, glassmorphism-heavy or default shadcn.

## Colors

Use existing tokens only — never introduce a second palette or arbitrary brand hex values.

- Navy `#061B2C`: navigation, dark sections, headings and premium contrast.
- Deep navy `#02101F`: strongest dark surfaces.
- Turquoise `#18B7BD`: focus, links, active states and restrained accents.
- Coral `#EB674D`: primary CTA only; coral dark for destructive states.
- Gold `#E4B967`: small premium highlights, never large backgrounds.
- Sand `#F6EFE4`: default page background.
- Warm white `#FFFDF8`: cards and elevated surfaces.
- Ink `#102A35`: body text; muted `#667981` for secondary text.

Consume these through CSS variables or Tailwind semantic classes (`bg-primary`, `text-navy`, `bg-card`, etc.).

## Typography

- Headings: existing editorial serif stack; elegant, compact and not overly bold.
- Body and controls: Manrope/Inter stack.
- Maintain clear hierarchy, comfortable line length and generous whitespace.
- Never add a new font without explicit approval.

## Components

- Reuse `src/components/ui` and `src/components/shared` before creating anything new.
- Cards: warm-white surface, subtle border, restrained shadow, rounded with existing radius tokens.
- Buttons: coral primary, navy/neutral secondary; one obvious primary action per section.
- Inputs: clear labels, visible turquoise focus ring and complete validation/error states.
- Icons: consistent library and stroke style; no emoji as interface icons.
- Images: premium, authentic, Mediterranean and human; never low-quality placeholders.

## Layout and motion

- Mobile-first; use the shared container, spacing and grid patterns.
- Minimum interactive target: 44 × 44 CSS pixels.
- No horizontal overflow or clipped content.
- Motion must be subtle, purposeful and respect `prefers-reduced-motion`.
- Avoid decorative gradients, blur, glass effects and excessive shadows unless already established by a shared component.

## Non-negotiable implementation rules

1. No arbitrary Tailwind colors, radii, shadows or one-off CSS when a token/pattern exists.
2. No page-specific visual language; every new component must look native to CostaPulse.
3. Do not copy components to create visual variants; use typed variants on shared primitives.
4. Meet WCAG 2.2 AA for contrast, focus, keyboard and screen-reader behavior.
5. Before completion, compare the result against this file, `src/app/globals.css`, existing shared components and relevant Storybook stories.
6. When uncertain, preserve the existing design rather than inventing a new one.
