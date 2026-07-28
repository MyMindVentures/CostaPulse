# CostaPulse — Design System

## Purpose

This document defines the durable visual and interaction principles for CostaPulse. Actual tokens and components remain implemented in source code.

## Brand direction

CostaPulse should feel like a premium Mediterranean experience brand rather than a generic booking marketplace or SaaS dashboard.

Core qualities:

- Premium but approachable
- Adventurous and energetic
- Trustworthy and operationally clear
- Personal and authentic
- Mediterranean without becoming decorative or cliché

## Visual direction

- Deep navy for depth, trust and premium framing
- Warm ivory and sand tones for surfaces
- Aqua accents for active, maritime and operational states
- Restrained gold accents for premium highlights and important value indicators
- Generous spacing and strong hierarchy
- Soft borders and limited shadows
- High-quality photography with consistent treatment

Exact colors, typography scales, radii and spacing values must be defined as reusable tokens in code rather than repeated manually.

## Typography

- Use a clear, premium display treatment for major marketing headings.
- Use a highly readable interface typeface for forms, tables and operational screens.
- Maintain consistent heading, body, label and helper-text scales.
- Avoid excessive font weights and visual noise.

## Component principles

- Build reusable buttons, fields, cards, dialogs, tables, status indicators, navigation elements and feedback states.
- Variants should be intentional and limited.
- Components must support keyboard use, focus visibility and appropriate semantics.
- Status color must never be the only carrier of meaning.
- Domain-specific components should compose shared primitives.

## Public experience UI

Prioritize immersive media, clear value, transparent pricing, host credibility, availability and a confident booking call to action.

## Admin UI

The admin interface should feel like a premium Mediterranean operations platform:

- Compact but readable data presentation
- Meaningful metrics rather than decorative cards
- Clear status systems
- Fast filtering and quick actions
- Desktop-first operational density with strong tablet support

## Responsive behavior

- Design mobile experiences deliberately rather than stacking desktop layouts blindly.
- Keep primary actions visible and reachable.
- Use drawers, sheets or progressive disclosure for dense details.
- Protect readability and touch target sizes.

## Media rules

- Use authentic, high-quality Costa Blanca and activity imagery.
- Avoid inconsistent aspect ratios within repeated card systems.
- Provide meaningful alt text where imagery communicates content.
- Keep decorative images separate from essential information.

## Change discipline

A lasting change to visual language, tokens or component behavior must be reflected here and in the implemented design system. Page-specific experiments do not justify separate documentation files.
