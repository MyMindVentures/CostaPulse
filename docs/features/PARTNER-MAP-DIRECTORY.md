# Partner Map Directory

## Purpose

The public Partner page is an interactive map directory where visitors can discover all active CostaPulse partners and see the measurable CostaPulse activity generated at each location.

The page is not primarily a partner profile page or an internal analytics dashboard. It is a public discovery experience combining:

- an interactive map with partner markers;
- synchronized partner cards;
- public social-proof metrics;
- category and location filters;
- navigation to partner details and directions.

The central interaction rule is:

> A partner card and its map marker are two synchronized representations of the same selected partner.

## Public route

Recommended route:

```text
/partners
```

Optional partner detail route:

```text
/partners/[slug]
```

The map directory remains the primary Partner page. A detail page may be added separately without replacing the directory.

## User goals

A visitor should be able to:

1. See all active public CostaPulse partners on one map.
2. Understand where each partner is located.
3. Browse partners through an accessible card list.
4. Select a card and immediately locate the matching marker.
5. Select a marker and immediately locate the matching card.
6. See how many valid QR scans and attributed experience bookings a partner generated.
7. Filter partners by category, area and public performance signals.
8. Open a partner profile or start directions.

## Page structure

### Introductory header

Show a compact page introduction with aggregated public statistics:

- number of active public partners;
- total valid QR scans;
- total attributed qualifying bookings.

Suggested copy direction:

```text
Discover our local partners

Explore trusted CostaPulse partners and see where travellers discovered their next Costa Blanca experience.
```

The metrics support discovery and social proof. They must not make the page feel like an internal analytics dashboard.

### Desktop layout

Use a split layout:

```text
┌──────────────────────────┬───────────────────────────────┐
│ Scrollable partner list  │ Sticky interactive map        │
│                          │                               │
│ Partner card             │ Marker                        │
│ Partner card             │ Marker      Marker            │
│ Partner card             │                               │
└──────────────────────────┴───────────────────────────────┘
```

Recommended proportions:

- partner list: approximately 40%;
- map: approximately 60%;
- map remains sticky while the card list scrolls.

### Mobile layout

Provide a clear `Map` / `List` view switch.

Both modes must preserve:

- active filters;
- selected partner;
- current map position where practical;
- URL state where practical.

Do not render an unusably small split view on mobile.

## Partner card

Each public partner card should support:

- cover image or logo;
- partner name;
- category;
- city or area;
- valid QR scan count;
- attributed qualifying booking count;
- scan-to-booking conversion rate;
- most-booked CostaPulse experience when available;
- optional featured or top-partner badge;
- `View on map` action;
- `Get directions` action;
- optional partner-detail action.

Example information hierarchy:

```text
La Plata Casa Matilde
Restaurant · Torre del Mar

142 QR scans
18 experience bookings
12.7% scan-to-booking conversion

Most booked: Sunset Paddle Experience
```

Use localized number formatting. Percentages must be derived from the same validated metric definitions used by the backend read model.

## Card and marker synchronization

### Selecting or hovering a card

- highlight the corresponding marker;
- enlarge or otherwise emphasize the marker without causing layout instability;
- centre the map on the partner when the user explicitly selects the card;
- open the marker popup after explicit selection;
- do not aggressively recenter on every incidental hover;
- preserve user-controlled zoom where practical.

### Selecting a marker

- select the matching partner card;
- scroll the card list to the card;
- add a clear selected state to the card;
- open the partner popup or detail preview;
- update the URL selection state when practical.

### URL state

Recommended query parameter:

```text
/partners?partner=<partner-slug>
```

Filters may also be represented in query parameters so that a filtered map state can be shared and restored.

## Marker design

Supported visual states:

- default partner;
- selected partner;
- featured partner;
- new partner;
- top-performing public partner;
- marker cluster.

Keep differentiation restrained. Avoid an aggressive heatmap or dashboard-like severity colours.

The selected marker must remain clearly distinguishable in high-density areas.

## Marker popup

The marker popup should show:

- partner name;
- category;
- city or area;
- valid QR scan count;
- attributed qualifying booking count;
- most-booked experience when available;
- partner-detail action;
- directions action.

Suggested social-proof copy:

```text
18 CostaPulse bookings started here
```

Do not expose customer identities, individual bookings, revenue, commission, voucher codes or internal notes.

## Filters and sorting

Support filters for:

- all partners;
- partner category;
- city, area or region;
- featured partners.

Support sorting by:

- most QR scans;
- most attributed bookings;
- highest conversion rate;
- newest partners;
- alphabetical order.

Filtering must update both the card list and visible markers from the same result set.

After a filter change:

- clear the selection only when the selected partner is no longer part of the result set;
- fit map bounds around the filtered partners when appropriate;
- do not continuously reset zoom after subsequent manual map interaction.

## Public metric definitions

### Valid QR scan

A valid QR scan is a persisted, non-test partner referral scan accepted by the backend according to the referral tracking rules.

The public count must exclude, where the schema supports detection:

- test events;
- invalid or malformed referral events;
- known duplicate events outside accepted counting rules;
- blocked or fraudulent events;
- deleted or excluded attribution records.

The exact canonical definition must be implemented in the secured database read layer, not recreated in React.

### Attributed qualifying booking

An attributed qualifying booking is a booking linked to the partner through the canonical referral and attribution flow and having an approved public status.

Qualifying statuses should be based on the existing booking domain and may include statuses equivalent to:

- confirmed;
- paid;
- completed.

Exclude statuses equivalent to:

- cancelled;
- expired;
- failed payment;
- abandoned hold;
- test booking.

Do not hardcode status assumptions in the frontend. The secured read model defines the canonical public count.

### Conversion rate

```text
attributed qualifying bookings / valid QR scans × 100
```

Rules:

- return `0` or `null` consistently when there are no valid scans;
- avoid client-side division when the backend already returns the canonical value;
- apply one documented rounding rule across cards, popups and totals.

### Most-booked experience

The most-booked experience is the published CostaPulse experience with the highest number of qualifying bookings attributed to the partner.

Return no value when:

- no qualifying bookings exist;
- the related experience is not publicly displayable;
- the relationship cannot be safely exposed.

## Privacy and public-data boundary

The public Partner page may expose:

- partner identity and public profile information;
- public address and coordinates;
- category and area;
- public media;
- aggregated QR scan count;
- aggregated qualifying booking count;
- aggregated conversion rate;
- publicly displayable most-booked experience.

The page must never expose:

- revenue;
- commissions;
- payout status;
- customer data;
- individual referral records;
- individual booking records;
- voucher codes;
- internal partner notes;
- fraud signals;
- private contact details;
- unpublished partners or experiences.

## Data contract

The frontend must consume a secured public read model instead of joining analytics tables in the browser.

Recommended conceptual contract:

```text
public_partner_map
- partner_id
- slug
- name
- category
- short_description
- latitude
- longitude
- city
- area
- address
- cover_image_url
- logo_url
- qr_scan_count
- attributed_booking_count
- conversion_rate
- most_booked_experience_slug
- most_booked_experience_name
- is_featured
- published_at
```

The actual implementation may be a PostgreSQL view, materialized view or secured RPC, depending on the current CostaPulse schema and performance requirements.

Only return partners that are:

- active;
- publicly visible;
- valid for the current publication window;
- equipped with valid latitude and longitude.

The response should also provide aggregate totals or a separate secured aggregate read model for:

```text
partner_count
qr_scan_count
attributed_booking_count
```

## Database and backend requirements

Before implementation:

1. Inspect the current Supabase schema, generated types, partner records, referral tracking, booking attribution, media model and RLS policies.
2. Treat Supabase as the single source of truth.
3. Do not guess table or column names from this document.
4. Add or update schema only through migrations.
5. Implement the public metric definitions once in the database read layer.
6. Ensure RLS or function security exposes only the intended aggregate public data.
7. Add appropriate indexes for partner status, publication state, coordinates, referral partner relation, attribution relation and qualifying booking status where required.
8. Validate that aggregate queries do not leak restricted rows through counts or joins.

The canonical partner flow is conceptually:

```text
partner → referral/QR scan → attributed booking → optional voucher
```

The public page reads only safe partner information and aggregated activity from this flow.

## Media requirements

Partner media must follow the existing canonical CostaPulse media architecture.

Do not:

- hardcode Storage bucket names;
- guess filenames;
- introduce a second public partner-media management system.

Resolve public partner media through the existing published media read model using the repository's established scope and placement conventions.

Recommended conceptual placements:

```text
scope_type = partner
scope_key = <partner slug>
placement_key = card | marker | hero | gallery
```

Use stored alt text, focal point and publication state.

## Frontend architecture

Recommended feature structure, adjusted to the actual repository after inspection:

```text
src/features/partners/
├── map/
│   ├── PartnerMap.tsx
│   ├── PartnerMarker.tsx
│   ├── PartnerMarkerPopup.tsx
│   └── PartnerMapView.tsx
├── directory/
│   ├── PartnerDirectory.tsx
│   ├── PartnerCard.tsx
│   ├── PartnerFilters.tsx
│   └── PartnerViewToggle.tsx
├── schemas/
├── types/
└── index.ts
```

Server-side data access should use the existing repository and view-model conventions, for example:

```text
src/server/repositories/partners.ts
src/lib/view-models/partner-map.ts
```

Names are recommendations only. Reuse the actual current conventions discovered in the repository.

## Mapping implementation

Use the mapping library already installed in the repository.

When no mapping library exists:

1. document the selected library and rationale;
2. confirm compatibility with Next.js App Router and server rendering boundaries;
3. keep map-only code inside an appropriate client component;
4. avoid exposing private API keys;
5. load map code lazily where beneficial.

Required map behaviour:

- initial bounds fit all visible filtered partners;
- selected marker can be centred without resetting intentional zoom unnecessarily;
- marker clustering is enabled when density requires it;
- map remains usable with touch, mouse and keyboard-supported controls;
- empty results show a meaningful map/list state;
- missing or invalid coordinates are excluded and logged through appropriate diagnostics.

## Loading, empty and error states

### Loading

- render partner-card skeletons;
- reserve stable space for the map;
- avoid flashing an incorrect default location;
- make filters unavailable only as long as necessary.

### No partners configured

Show a calm branded empty state explaining that partner locations are being added.

### No filter results

Show:

- a clear no-results message;
- an action to reset filters;
- an empty map state without stale markers.

### Partial data

Partners may lack:

- media;
- scans;
- bookings;
- a most-booked experience;
- a public detail page.

Use safe fallbacks without hiding the partner.

### Error

- present a recoverable public error state;
- provide a retry action where appropriate;
- do not expose database or integration details;
- report technical errors through the existing diagnostics system.

## Accessibility

- partner cards are keyboard focusable and selectable;
- selected state is not communicated by colour alone;
- marker actions have accessible labels;
- popup content follows a logical focus order;
- Map/List switching is implemented as an accessible control;
- filter controls have explicit labels;
- counts have understandable screen-reader text;
- motion respects reduced-motion preferences;
- the indexable partner list remains usable without interacting with the map.

## SEO

The route should provide:

- localized page title and description;
- canonical URL;
- Open Graph metadata;
- indexable server-rendered partner list or equivalent progressive fallback;
- structured data for public partner/location information where accurate and supported;
- stable links to partner detail pages when those pages exist.

Do not depend on the client-rendered map as the only discoverable content.

## Visual direction

The page should feel like a premium Mediterranean travel directory:

- deep navy foundation;
- warm ivory and sand surfaces;
- aqua interaction accents;
- restrained gold for featured status;
- generous spacing;
- strong partner imagery;
- subtle transitions;
- soft borders;
- clear selected states.

Avoid:

- a generic analytics-dashboard appearance;
- oversized metric tiles;
- aggressive heatmaps;
- excessive marker animations;
- visual noise that competes with discovery.

## Analytics events

Track public product interactions through the existing analytics integration, using non-sensitive identifiers:

- partners_page_viewed;
- partner_filter_changed;
- partner_card_selected;
- partner_marker_selected;
- partner_directions_clicked;
- partner_detail_clicked;
- partner_map_list_mode_changed.

Do not include customer data or private partner analytics in event properties.

## Acceptance criteria

### Data

- Only active, public partners with valid coordinates are returned.
- QR scan, booking and conversion metrics come from one secured canonical read layer.
- Cancelled, failed, expired and test bookings are excluded from public counts.
- No revenue, commission, customer or voucher data is exposed.
- Partner media uses the existing published media architecture.

### Interaction

- Selecting a card selects and reveals the correct marker.
- Selecting a marker selects and scrolls to the correct card.
- Filters update the map and list from the same dataset.
- Selected partner state is preserved in the URL where practical.
- Mobile users can switch between a complete map and list experience.
- User-controlled zoom is not repeatedly reset.
- Clustering works when marker density requires it.

### Quality

- Loading, empty, partial-data and error states are implemented.
- Keyboard navigation and accessible labels are present.
- The page remains indexable without relying solely on the map.
- Responsive behaviour is validated on desktop, tablet and mobile.
- The implementation reuses existing CostaPulse components and architectural conventions.
- Database, backend and frontend are delivered as one complete userflow.

## Required implementation order

1. Inspect the current Supabase schema and repository conventions.
2. Confirm public metric definitions and privacy boundaries.
3. Add or update migrations, indexes, RLS and secured read models.
4. Add validated server repository queries and view models.
5. Build the public route and server-rendered directory foundation.
6. Build synchronized map, cards, markers and popup interactions.
7. Add filters, sorting, URL state and mobile Map/List switching.
8. Add loading, empty, partial-data and error states.
9. Add accessibility, SEO and analytics.
10. Test the complete public flow and data exposure boundary.

## Cursor implementation brief

```text
Inspect the current CostaPulse Supabase project, generated types, partner tables, referral tracking, booking attribution, media architecture, RLS policies and existing reusable UI components before changing code. Supabase is the single source of truth. Do not guess or redesign the schema.

Implement the public /partners page as a premium interactive partner map directory.

Build in this order:
1. Database and secured public read model for active public partners, valid QR scans, attributed qualifying bookings, conversion rate, most-booked public experience and aggregate page totals.
2. Server repository queries, Zod validation and typed partner-map view models.
3. Server-rendered public route and indexable partner list.
4. Responsive synchronized partner-card list and interactive map.
5. Filters, sorting, URL selection state, marker clustering and mobile Map/List switching.
6. Loading, empty, partial-data, error, accessibility, SEO and analytics states.

Core synchronization:
- Selecting a card highlights and centres its marker and opens its popup.
- Selecting a marker selects and scrolls to its matching card.
- Card list and markers always use the same filtered dataset.
- Do not aggressively recenter or reset zoom after manual map interaction.

Public partner cards and popups may show name, category, location, public media, valid QR scans, attributed qualifying bookings, conversion rate and the most-booked public experience. Never expose revenue, commission, customer data, individual referrals, individual bookings, voucher codes, internal notes or unpublished records.

Reuse the current mapping library, global navbar, page background, typography, cards, badges, filters, skeletons, buttons, repository layer, view-model conventions and canonical media architecture. Do not hardcode Storage paths or build client-side analytics joins.

Visual direction: premium Mediterranean travel directory using the established CostaPulse deep navy, warm ivory, sand, aqua and restrained gold design language. Social-proof metrics support discovery but must not dominate the page.

Validate desktop, tablet and mobile behaviour and run the repository quality gates before completion.
```