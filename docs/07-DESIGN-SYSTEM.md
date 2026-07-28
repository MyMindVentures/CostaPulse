# CostaPulse — Design System

## Purpose

This document defines the binding visual and interaction principles for CostaPulse. Actual tokens and components remain implemented in source code.

## Brand character

CostaPulse must feel like an international premium Mediterranean lifestyle and experiences brand rooted in the Costa Blanca: sun, sea, white coastal architecture, warm stone, sand, teak, bamboo, linen, rope, salt air and relaxed southern hospitality.

The visual language is:

- premium, editorial and cinematic;
- warm, natural and sun-soaked;
- coastal, refined and adventurous;
- subtly bohemian, never rustic or improvised;
- international, timeless and suitable for expansion beyond Spain.

Never generic SaaS, corporate blue, neon, cartoonish, tropical-tiki, cheap beach-club, overly nautical, glassmorphism-heavy or default shadcn.

## Token source of truth

Brand CSS variables in `src/app/globals.css` are authoritative. Semantic shadcn tokens alias these values. Do not introduce a second palette.

| Token                                  | Role                                                   |
| -------------------------------------- | ------------------------------------------------------ |
| `--navy`, `--navy-deep`, `--navy-soft` | Primary surfaces, headings and shell                   |
| `--turquoise`, `--turquoise-deep`      | Water-inspired accents, links, active and focus states |
| `--coral`, `--coral-dark`              | Primary CTA and destructive state                      |
| `--gold`                               | Restrained premium highlight                           |
| `--sand`, `--white`, `--panel`         | Page and card surfaces                                 |
| `--ink`, `--muted`                     | Primary and secondary text                             |
| `--border`                             | Borders and inputs                                     |
| `--shadow`                             | Elevation                                              |
| `--shell-nav-height`                   | Layout chrome                                          |

Current palette references:

- Navy `#061B2C`
- Deep navy `#02101F`
- Turquoise `#18B7BD`
- Coral `#EB674D`
- Coral dark `#CF4F38`
- Gold `#E4B967`
- Sand `#F6EFE4`
- Warm white `#FFFDF8`
- Panel `#F3F5F3`
- Ink `#102A35`
- Muted `#667981`

Consume colors through variables or semantic Tailwind classes such as `bg-primary`, `text-navy` and `bg-card`. Dark navy and warm sand or ivory dominate; turquoise, coral and gold are accents.

## Typography

- Headings use the existing editorial serif stack: elegant, spacious and cinematic.
- Body text and controls use the existing Manrope/Inter stack.
- Use confident headlines with controlled line lengths and generous whitespace.
- Avoid ultra-bold SaaS typography, condensed display fonts and scripts.
- Never add a font without explicit approval.

## Materials and texture

Express the Mediterranean feeling through photography, spacing, tone and subtle material references rather than literal decoration.

Preferred cues include sun-faded linen, bamboo, teak, natural rope, pale stone, whitewashed walls, warm terraces, coastal cliffs, clear blue water, sunset light, natural shadows and authentic human moments.

Do not add fake wood textures, obvious bamboo patterns, shells, anchors, waves, palm icons or decorative beach illustrations.

## Component principles

- Reuse `src/components/ui` and `src/components/shared` before creating anything new.
- Cards use warm-white or deep-navy surfaces, subtle borders, restrained shadows and existing radius tokens.
- Buttons use coral for the primary action and navy or warm neutrals for secondary actions. Keep one obvious primary action per section.
- Inputs require clear labels, a visible turquoise focus ring and complete validation states.
- Use one consistent icon library and stroke style; never use emoji as interface icons.
- Badges stay compact and editorial; use gold or turquoise only when semantically meaningful.
- Variants must be typed and intentional rather than copied components.
- Status color must never be the only carrier of meaning.
- New reusable patterns belong in the shared or design-system layer and should be documented in Storybook.

## Layout and composition

- Build mobile-first with shared containers, spacing and grid patterns.
- Prefer generous negative space, asymmetrical editorial compositions and image-led sections.
- Alternate immersive dark sections with warm sand and ivory sections where appropriate.
- Maintain a calm visual rhythm without overcrowded cards, badges or competing calls to action.
- Minimum interactive target size is 44 × 44 CSS pixels.
- Prevent horizontal overflow, clipped content and cramped layouts.

## Public experience UI

Prioritize immersive, authentic imagery, clear value, transparent pricing, host credibility, availability and a confident booking call to action. Avoid generic stock-tourism clichés and low-quality placeholders.

## Admin UI

The admin interface should feel like a premium Mediterranean operations platform:

- compact but readable data presentation;
- meaningful metrics rather than decorative cards;
- clear status systems;
- fast filtering and quick actions;
- desktop-first operational density with strong tablet support.

## Motion

Motion should feel smooth, calm and premium, like water or a sea breeze. Use subtle fades, reveals and restrained parallax only when they improve the experience. Avoid bouncy, flashy or high-frequency animation and always respect `prefers-reduced-motion`.

## Accessibility

Meet WCAG 2.2 AA for contrast, keyboard use, focus visibility and screen-reader behavior. Protect readability and touch targets across all supported viewports.

## Non-negotiable implementation rules

1. No arbitrary Tailwind colors, radii, shadows or one-off CSS when a token or established pattern exists.
2. No page-specific visual language; every surface must feel native to CostaPulse.
3. Do not copy components to create visual variants.
4. No new palette, font, icon style, gradient language or visual trend without explicit approval.
5. Compare every completed frontend change against this document, `src/app/globals.css`, existing shared components and relevant Storybook stories.
6. When uncertain, choose the more refined, natural, calm and timeless option.
7. CostaPulse must never look like a local hobby website or generic booking template.

## Change discipline

A lasting change to visual language, tokens or component behavior must be reflected here and in the implemented design system. Page-specific experiments do not justify separate documentation files.
