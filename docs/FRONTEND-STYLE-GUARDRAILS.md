# CostaPulse Frontend Style Guardrails

Binding for every page and component. Do not deviate unless the current task explicitly changes the design system.

## Brand character

CostaPulse must feel like an international premium Mediterranean lifestyle brand rooted in the Costa Blanca: sun, sea, white coastal architecture, warm stone, sand, teak, bamboo, linen, rope, salt air and relaxed southern hospitality.

The visual language is:

- premium, editorial and cinematic;
- warm, natural and sun-soaked;
- coastal, refined and adventurous;
- subtly bohemian, never rustic or improvised;
- international, timeless and suitable for expansion beyond Spain.

Never generic SaaS, corporate-blue, neon, cartoonish, tropical-tiki, cheap beach-club, overly nautical, glassmorphism-heavy or default shadcn.

## Colors

Use existing tokens only — never introduce a second palette or arbitrary brand hex values.

- Navy `#061B2C`: navigation, cinematic overlays, dark sections and premium contrast.
- Deep navy `#02101F`: strongest dark surfaces and night-sea depth.
- Turquoise `#18B7BD`: Mediterranean water, focus, links and restrained active accents.
- Coral `#EB674D`: sun-warmed primary CTA; use sparingly and with clear hierarchy.
- Coral dark `#CF4F38`: destructive states only.
- Gold `#E4B967`: sunset, warm sunlight and small premium highlights; never large backgrounds.
- Sand `#F6EFE4`: sun-bleached page background.
- Warm white `#FFFDF8`: limestone, linen and card surfaces.
- Panel `#F3F5F3`: soft neutral sections.
- Ink `#102A35`: body text.
- Muted `#667981`: secondary text.

Consume colors through CSS variables or Tailwind semantic classes (`bg-primary`, `text-navy`, `bg-card`, etc.). Dark navy and warm sand/ivory should dominate; turquoise, coral and gold are accents, not equal competing colors.

## Typography

- Headings: existing editorial serif stack; elegant, spacious and cinematic, as in a premium travel magazine.
- Body and controls: Manrope/Inter stack; modern, highly readable and understated.
- Use large confident headlines with controlled line lengths and generous whitespace.
- Avoid ultra-bold SaaS typography, condensed display fonts and decorative script fonts.
- Never add a new font without explicit approval.

## Materials and visual texture

Express the Mediterranean feeling through photography, spacing, tone and subtle material references — not through literal decoration.

Preferred cues:

- sun-faded linen, bamboo, teak, natural rope and pale stone;
- whitewashed walls, warm terraces, coastal cliffs and clear blue water;
- soft sunset light, natural shadows and authentic human moments;
- restrained organic shapes and tactile surfaces.

Do not add fake wood textures, obvious bamboo patterns, shells, anchors, waves, palm icons or decorative beach illustrations. Avoid visual clichés.

## Components

- Reuse `src/components/ui` and `src/components/shared` before creating anything new.
- Cards: warm-white or deep-navy surface, subtle border, restrained shadow and existing radius tokens.
- Buttons: coral primary, navy or warm-neutral secondary; one obvious primary action per section.
- Inputs: clear labels, visible turquoise focus ring and complete validation/error states.
- Icons: one consistent library and stroke style; no emoji as interface icons.
- Badges and labels: compact, editorial and restrained; gold or turquoise only when semantically meaningful.
- Images: premium, authentic and cinematic; real Mediterranean people, places, boats, beaches, food and experiences. Never low-quality placeholders or generic stock-tourism clichés.

## Layout and composition

- Mobile-first; use shared container, spacing and grid patterns.
- Prefer generous negative space, asymmetrical editorial compositions and strong image-led sections.
- Alternate immersive dark cinematic sections with warm sand and ivory content sections.
- Maintain a calm visual rhythm; do not overcrowd pages with cards, badges or competing CTAs.
- Minimum interactive target: 44 × 44 CSS pixels.
- No horizontal overflow, clipped content or cramped mobile layouts.

## Motion

- Motion must feel smooth, slow and premium, like water or a sea breeze.
- Use subtle fades, reveals and restrained parallax only when they improve the experience.
- Avoid bouncy, flashy, playful or high-frequency animation.
- Respect `prefers-reduced-motion`.

## Non-negotiable implementation rules

1. No arbitrary Tailwind colors, radii, shadows or one-off CSS when a token or established pattern exists.
2. No page-specific visual language; every component must look native to CostaPulse.
3. Do not copy components to create visual variants; use typed variants on shared primitives.
4. No new palette, font, icon style, gradient language or visual trend without explicit approval.
5. Meet WCAG 2.2 AA for contrast, focus, keyboard and screen-reader behavior.
6. Before completion, compare the result against this file, `src/app/globals.css`, existing shared components and relevant Storybook stories.
7. When uncertain, choose the more refined, natural, calm and timeless option.
8. CostaPulse must always look premium enough for an international Mediterranean hospitality and experiences brand — never like a local hobby website or generic booking template.
