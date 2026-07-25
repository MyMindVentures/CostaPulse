# Booking Stories Frontend — Coding Agent Instructions

Inspect the current CostaPulse repository and Supabase project through MCP before changing code.

The backend for Booking Stories / Previous Adventures already exists. Do not redesign the database, create migrations, change RLS policies, modify storage configuration, or duplicate backend logic.

Supabase is the single source of truth.

## Goal

Build the complete frontend flow for showing footage from previously completed bookings on each Experience Detail Page, and provide the admin interface required to manage those booking stories.

Follow this order:

1. Inspect existing architecture.
2. Inspect Supabase types and RPCs.
3. Build reusable frontend data layer.
4. Build admin management interface.
5. Build public Experience Detail Page section.
6. Build fullscreen story viewer.
7. Validate responsive behavior, accessibility and integration.

## Existing backend

Inspect and use the actual Supabase schema and generated types.

Expected existing tables:

- `booking_stories`
- `booking_story_media`
- `bookings`
- `experiences`
- `reviews`
- `media_assets`

Expected existing RPCs:

- `admin_create_booking_story`
- `admin_update_booking_story`
- `admin_attach_booking_story_media`
- `admin_set_booking_story_cover`
- `admin_publish_booking_story`
- `admin_archive_booking_story`
- `admin_remove_booking_story_media`
- `get_public_experience_booking_stories`

Expected storage bucket:

- `booking-footage`

Never guess RPC parameter names or response structures. Inspect them through Supabase MCP and generated database types first.

## Architecture rules

- Use the existing Next.js App Router architecture.
- Reuse the existing global CostaPulse layout, background, navbar, typography and design tokens.
- Reuse existing cards, buttons, dialogs, drawers, forms, upload components, skeletons and status badges.
- Do not duplicate existing components or data-fetching utilities.
- Keep Supabase server-side access in the established server/client utility structure.
- Use server components for initial public reads where appropriate.
- Use client components only for interactive carousel, modal, upload and sorting behavior.
- Use secured RPCs for every admin mutation.
- Never perform privileged direct table mutations from the browser.
- Never expose the service-role key.
- Do not expose booking references, customer emails, phone numbers, participant data or internal metadata publicly.
- Preserve existing authentication and role guards.
- Admin features must only be available to permitted content-management and administrator roles.

## Part 1 — Frontend data layer

Create typed reusable services for booking stories.

Public service:

```ts
getPublicExperienceBookingStories({
  experienceSlug,
  limit,
  offset,
})
```

This must call:

```text
get_public_experience_booking_stories
```

Admin services must wrap the existing RPCs for:

- creating a story;
- updating story details;
- attaching media;
- removing media;
- setting the cover;
- publishing;
- archiving.

Provide clear typed success and error handling.

Do not use `any`.

Map database responses into stable frontend view models instead of spreading raw Supabase records throughout components.

## Part 2 — Admin Booking Stories

Add a Booking Stories workspace inside the existing admin dashboard.

Preferred route:

```text
/admin/booking-stories
```

Also integrate story management into the booking detail page where appropriate.

### Admin overview

Show:

- completed bookings without a story;
- draft stories;
- published stories;
- archived stories;
- experience;
- booking date;
- public guest name;
- media count;
- consent status;
- publication status;
- featured status;
- last updated date.

Add:

- search;
- experience filter;
- status filter;
- consent filter;
- pagination;
- empty states;
- loading skeletons;
- error states.

Primary action:

```text
Create Story
```

Only completed bookings should be eligible.

### Story editor

Build a dedicated page or large detail workspace.

Suggested route:

```text
/admin/booking-stories/[storyId]
```

Sections:

#### Story details

Fields:

- title;
- subtitle;
- description;
- guest display name;
- country code;
- guest quote;
- featured;
- display order.

Do not display private customer information as the suggested public name without making the distinction clear.

#### Consent

Show and manage:

- consent status;
- consent source;
- consent received date;
- warning when consent is missing.

Publishing must remain disabled until backend requirements are satisfied.

Display backend validation errors clearly.

#### Media manager

Support:

- uploading images and videos;
- selecting existing eligible media assets where supported;
- upload progress;
- retry after failure;
- image and video previews;
- drag-and-drop ordering;
- captions;
- media-role selection;
- cover selection;
- removing media;
- primary media indication.

Use the existing `booking-footage` bucket and existing media finalization flow. Inspect how the repository currently uploads and registers `media_assets`; reuse that implementation.

Do not create storage records manually if the existing admin media workflow already handles them.

Media roles:

- cover;
- gallery;
- highlight;
- video;
- thumbnail.

Show file validation before upload.

Respect the actual bucket MIME types and size limits returned by Supabase.

#### Preview

Provide a preview using the same reusable public card and story viewer components used on the Experience Detail Page.

Avoid creating a separate visual implementation for admin preview.

#### Publication controls

Actions:

- Save draft;
- Publish;
- Archive;
- Preview.

Show publication blockers such as:

- booking not completed;
- consent not granted;
- no media;
- no cover;
- invalid cover relation.

Use the backend response as the authority for validation.

## Part 3 — Experience Detail Page section

Add a premium section to every Experience Detail Page.

Suggested heading:

```text
Previous Adventures
```

Suggested supporting text:

```text
Real moments from recent CostaPulse guests.
```

Only render the section when published booking stories exist.

Use:

```text
get_public_experience_booking_stories
```

Do not query private booking tables for this public section.

### Horizontal story rail

Create reusable components such as:

```text
ExperienceBookingStories
BookingStoryCard
BookingStoryRail
```

Requirements:

- horizontally scrollable cards;
- visible but subtle custom scrollbar;
- previous and next arrow controls on desktop;
- touch swipe on mobile;
- scroll snapping;
- keyboard navigation;
- accessible labels;
- no layout shift;
- lazy-loaded media;
- skeleton loading state.

Do not implement automatic infinite movement.

Additional pages can be fetched when the user approaches the end if pagination is needed.

### Story card

Each card can show:

- cover image or muted video preview;
- story title;
- public guest display name;
- country;
- experience date;
- published rating;
- guest quote excerpt;
- image count;
- video count;
- featured label when applicable;
- “View Story” action.

Do not show empty metadata rows.

Desktop interaction:

- subtle hover scale;
- overlay gradient;
- muted video preview only when performance-safe;
- pause preview when no longer visible.

Mobile interaction:

- no hover-dependent information;
- all important metadata must remain visible or accessible.

## Part 4 — Fullscreen story viewer

Build a reusable fullscreen dialog or route-based modal.

Suggested component:

```text
BookingStoryViewer
```

Requirements:

- large active media area;
- previous/next controls;
- swipe navigation;
- thumbnail strip where useful;
- image and video support;
- video controls;
- keyboard navigation;
- Escape to close;
- focus trap;
- restored focus after closing;
- media counter;
- captions;
- guest quote;
- published review;
- experience date;
- guest display name and country;
- CTA to book the same experience.

Suggested CTA:

```text
Book this experience
```

The CTA should scroll to or open the existing booking flow. Do not create a second booking implementation.

Avoid Instagram-style timed progression. Users must control navigation, especially for videos.

## Part 5 — Responsive design

Desktop:

- wide premium cards;
- arrow navigation;
- multiple partially visible cards;
- refined hover states.

Tablet:

- touch-friendly;
- cards remain readable;
- admin editor remains usable.

Mobile:

- horizontal swipe;
- approximately one card plus a preview of the next card;
- fullscreen viewer;
- minimum 44px touch targets;
- no tiny text;
- no hidden essential actions.

## Visual direction

Match the existing CostaPulse premium Mediterranean identity:

- deep navy background;
- warm ivory and sand surfaces;
- aqua operational accents;
- restrained gold highlights;
- high-quality gradients;
- generous spacing;
- premium editorial media presentation;
- subtle borders and shadows.

Avoid:

- generic SaaS cards;
- bright social-media styling;
- excessive glassmorphism;
- heavy animations;
- oversized rounded corners;
- visually noisy controls.

## Performance

- Use `next/image` for supported public images.
- Preserve width and height ratios.
- Use blurhash or existing placeholders where available.
- Lazy-load non-primary images and videos.
- Do not preload every video.
- Pause videos outside the viewport.
- Avoid fetching all story media for every experience globally.
- Keep initial public payload compact.
- Revoke or refresh signed URLs according to the existing application strategy.
- Prevent duplicate RPC requests.
- Avoid client-side waterfalls.

## Accessibility

- Correct dialog semantics.
- Keyboard-operable carousel.
- Visible focus states.
- Descriptive alt text.
- Captions connected to the correct media.
- Buttons must have accessible labels.
- Respect `prefers-reduced-motion`.
- Do not depend only on color for status.
- Ensure sufficient contrast.

## Required reusable components

Prefer creating or extending:

```text
BookingStoryCard
BookingStoryRail
BookingStoryViewer
BookingStoryMedia
BookingStoryStatusBadge
BookingStoryEditor
BookingStoryMediaManager
BookingStoryConsentPanel
```

Keep components focused and composable.

## Validation

Before completing:

1. Run TypeScript type checking.
2. Run linting.
3. Build the application.
4. Test a completed booking without a story.
5. Test creating a draft.
6. Test uploading image and video media.
7. Test setting the cover.
8. Test publishing without consent and confirm it fails safely.
9. Test successful publication after all requirements are met.
10. Test the public experience page.
11. Test keyboard navigation.
12. Test mobile swipe.
13. Test empty and error states.
14. Confirm no private booking or customer data enters the public payload.
15. Confirm no database migration or backend schema modification was made.

At the end, report:

- files created;
- files changed;
- reused components;
- RPCs used;
- routes added;
- validation commands run;
- remaining issues or assumptions.
