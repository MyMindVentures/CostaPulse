# CostaPulse Premium Stack

## Purpose

CostaPulse is a premium booking platform for authentic Costa Blanca experiences, yacht charters, watersports, concierge services, local partners, and adventure tourism.

This document defines the recommended production stack and the architectural principles for building a fast, scalable, secure, multilingual, and conversion-focused platform.

## Recommended Technology Stack

### Application Framework

- **Next.js** with the App Router
- **React**
- **TypeScript** with strict mode enabled
- Server Components by default
- Client Components only where browser interactivity is required

### Styling and UI

- **Tailwind CSS**
- **shadcn/ui** for accessible component primitives
- **Radix UI** where lower-level control is required
- **Lucide React** for interface icons
- **Framer Motion** for restrained premium animations
- Centralized design tokens for colors, typography, spacing, radii, shadows, and motion

### Backend and Database

- **Supabase**
  - PostgreSQL database
  - Authentication
  - Row Level Security
  - Storage
  - Realtime where operationally useful
  - Edge Functions for secure server-side workflows
- **Drizzle ORM** or the typed Supabase client for database access
- Database migrations committed to the repository

### Payments

- **Stripe**
  - Checkout or Payment Element
  - Payment Intents
  - Refund handling
  - Webhooks
  - Stripe Connect when experience providers or partners must receive payouts
- Webhook events must be idempotent and recorded before processing
- Booking confirmation must depend on verified payment state, not browser redirects

### Forms and Validation

- **React Hook Form**
- **Zod** for shared client and server validation
- Server Actions or API route handlers for trusted mutations
- Bot and abuse protection on public forms

### Content and Localization

- **next-intl** for multilingual routing and translations
- Initial languages:
  - English
  - Spanish
  - Dutch
  - French
  - German
- Translation keys must remain separate from page components
- Localized metadata, slugs, structured data, and transactional emails

### Search and Discovery

Start with PostgreSQL search and indexed filtering.

Add **Algolia** or **Typesense** only when the experience catalogue, locations, filtering complexity, or traffic justifies a dedicated search service.

Core filters may include:

- Location
- Date
- Category
- Duration
- Price
- Group size
- Language
- Accessibility
- Instant confirmation
- Weather dependency

### Maps and Location

- **Mapbox** or **Google Maps Platform**
- PostGIS through Supabase when geographic querying becomes important
- Store coordinates independently from formatted addresses
- Avoid exposing private meeting-point coordinates before a booking is confirmed when appropriate

### Media

- Next.js Image for optimized delivery
- Supabase Storage or Cloudinary for source assets
- Responsive image sizes and modern formats
- Video hosted through Mux, Vimeo, or another streaming service instead of the application repository
- Descriptive alt text and controlled focal points for experience imagery

### Email and Notifications

- **Resend** for transactional email
- React Email for reusable templates
- Optional WhatsApp integration for operational updates and guest communication
- Notification events should be queued or retried when delivery fails

Transactional messages include:

- Booking received
- Payment confirmed
- Booking accepted or declined
- Meeting-point instructions
- Booking reminder
- Reschedule or cancellation
- Refund confirmation
- Partner voucher
- Review request

### Analytics and Monitoring

- **PostHog** for product analytics, funnels, feature flags, and session insights
- **Google Analytics 4** where marketing attribution requires it
- **Google Search Console** for search visibility
- **Sentry** for frontend and backend error monitoring
- **Vercel Analytics** and Speed Insights for deployment-level performance visibility

Tracking must respect user consent and applicable privacy requirements.

### Hosting and Delivery

- **Vercel** for the Next.js application
- Supabase managed infrastructure for database, authentication, and storage
- Preview deployment for every pull request
- Separate preview, staging, and production environments
- Environment variables managed outside the repository

## Core Platform Domains

### Experiences

Each experience should support:

- Name and localized content
- Category and tags
- Provider or team member
- Locations and meeting points
- Media gallery
- Pricing model
- Duration
- Capacity and minimum participants
- Included and excluded items
- Requirements and restrictions
- Cancellation policy
- Weather policy
- Availability rules
- Add-ons
- Reviews
- SEO metadata
- Publication status

### Profiles

Provider and team-member profiles may include:

- Name and role
- Professional biography
- Languages
- Qualifications and certificates
- Experience specialisms
- Media
- Reviews
- Associated experiences
- Availability context
- Verification status

### Availability

The availability engine should support:

- Fixed departure times
- Flexible start times
- Capacity per slot
- Resource-based availability
- Seasonal schedules
- Blackout dates
- Preparation and buffer time
- Manual closures
- Minimum booking notice
- Maximum advance booking period
- Time-zone-safe storage and display

Store all canonical timestamps in UTC and render them in the relevant local time zone.

### Bookings

Recommended lifecycle:

1. Draft
2. Availability held
3. Awaiting payment
4. Paid
5. Pending provider confirmation
6. Confirmed
7. Completed
8. Cancelled
9. Refunded or partially refunded
10. No-show

Every state transition should be auditable.

### Partner QR Referral Program

Each hospitality or local partner receives a unique referral identity and QR code.

The system should:

- Attribute the visitor to the partner
- Preserve attribution through the booking journey
- Generate the agreed customer reward after payment and confirmation
- Record the partner benefit or commission
- Prevent duplicate or fraudulent reward claims
- Give administrators clear reporting and reconciliation tools

Suggested entities:

- Partner
- Partner location
- Referral code
- QR campaign
- Referral visit
- Attributed booking
- Customer voucher
- Partner reward
- Settlement

### Reviews

- Reviews linked only to completed bookings
- Moderation status
- Public reply from CostaPulse or provider
- Rating breakdown where useful
- Verified-booking label
- Abuse and duplicate controls

## Suggested Application Structure

```text
src/
  app/
    [locale]/
      experiences/
      experiences/[slug]/
      profiles/[slug]/
      booking/
      account/
      partner/
      admin/
    api/
      webhooks/
        stripe/
  components/
    ui/
    booking/
    experiences/
    profiles/
    partner/
    layout/
  features/
    auth/
    availability/
    bookings/
    payments/
    partners/
    reviews/
    vouchers/
  lib/
    supabase/
    stripe/
    validation/
    analytics/
    email/
    permissions/
  config/
  types/
  emails/
  styles/
supabase/
  migrations/
  functions/
public/
docs/
```

Organize business logic by domain instead of placing it directly inside page components.

## Data Model Overview

Likely core tables:

- users
- customer_profiles
- provider_profiles
- team_members
- experiences
- experience_translations
- experience_locations
- experience_media
- experience_addons
- availability_rules
- availability_slots
- resources
- resource_assignments
- booking_holds
- bookings
- booking_guests
- booking_items
- payments
- refunds
- partners
- partner_locations
- referral_codes
- referral_attributions
- vouchers
- partner_rewards
- reviews
- notifications
- audit_logs

Use database constraints for business-critical guarantees such as capacity, uniqueness, references, valid states, and non-negative monetary values.

## Security Principles

- Enable Row Level Security on every exposed Supabase table
- Keep service-role keys server-side only
- Never trust prices, discounts, capacity, or permission claims received from the browser
- Recalculate booking totals on the server
- Verify every Stripe webhook signature
- Use idempotency for payments, webhooks, emails, and booking creation
- Apply role-based access control for customers, providers, partners, staff, and administrators
- Store an audit trail for sensitive changes
- Rate-limit authentication and public mutation endpoints
- Sanitize user-generated content
- Protect uploaded files by MIME type, size, and authorization rules
- Use secure headers and a restrictive Content Security Policy

## Performance Standards

- Prioritize server rendering and static generation for public discovery pages
- Cache experience catalogue data safely
- Revalidate content after admin updates
- Lazy-load maps, video, review widgets, and non-critical scripts
- Optimize the booking funnel for mobile devices
- Avoid layout shifts by reserving image and component dimensions
- Keep third-party scripts minimal
- Monitor Core Web Vitals continuously

Target outcomes:

- Fast Largest Contentful Paint on mobile
- Stable layouts
- Responsive interaction during filtering and booking
- Resilient checkout under slow network conditions

## SEO Requirements

- Localized page titles and descriptions
- Canonical URLs and hreflang tags
- Clean localized slugs
- XML sitemap
- Robots configuration
- Open Graph and social sharing metadata
- Structured data for Organization, LocalBusiness, Product or Service, BreadcrumbList, FAQPage, and AggregateRating where valid
- Indexable category, location, experience, and profile pages
- No indexing of private booking, account, admin, or duplicate filter pages

## Accessibility

Target WCAG 2.2 AA.

- Keyboard-accessible interactions
- Visible focus states
- Proper labels and error messages
- Semantic headings
- Accessible dialogs, calendars, and menus
- Sufficient contrast
- Reduced-motion support
- Screen-reader-friendly booking progress
- Alternative text for meaningful media

## Testing Strategy

- **Vitest** for unit tests
- **Testing Library** for components
- **Playwright** for end-to-end tests
- Database and permission tests for Row Level Security
- Stripe webhook tests
- Booking concurrency and capacity tests

Critical end-to-end journeys:

- Browse and filter experiences
- Select date and participants
- Complete payment
- Receive confirmation
- Use partner referral attribution
- Cancel or reschedule
- Provider manages a booking
- Administrator creates and publishes an experience

## Continuous Integration

Every pull request should run:

- Formatting check
- ESLint
- TypeScript typecheck
- Unit tests
- Production build
- Database validation where practical
- Playwright smoke tests for critical routes

Recommended branch policy:

- `main` remains deployable
- Changes arrive through pull requests
- Prefer squash merging
- Require passing checks before merge
- Use conventional commit messages where practical

## Environment Strategy

Suggested environments:

- Local development
- Preview per pull request
- Staging
- Production

Typical environment variables:

```text
NEXT_PUBLIC_APP_URL=
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
STRIPE_SECRET_KEY=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
STRIPE_WEBHOOK_SECRET=
RESEND_API_KEY=
SENTRY_DSN=
NEXT_PUBLIC_POSTHOG_KEY=
NEXT_PUBLIC_POSTHOG_HOST=
MAPBOX_ACCESS_TOKEN=
```

Commit an `.env.example` containing names and explanations, never secrets.

## Development Phases

### Phase 1 — Foundation

- Next.js application shell
- Design system and responsive layout
- Localization architecture
- Supabase environments and migrations
- Authentication and roles
- Experience catalogue and profile pages
- Basic admin management

### Phase 2 — Booking Engine

- Availability rules and calendar
- Booking holds
- Participant and add-on selection
- Server-side pricing
- Stripe payment flow
- Confirmation email and account history

### Phase 3 — Partner Growth System

- Partner profiles
- Unique QR codes
- Referral attribution
- Customer vouchers
- Partner reward ledger
- Reporting and fraud controls

### Phase 4 — Operations

- Provider dashboard
- Resource assignment
- Check-in and completion workflows
- Cancellation, rescheduling, and refunds
- WhatsApp or operational notifications
- Review collection

### Phase 5 — Optimization

- Search improvements
- Funnel analytics
- Conversion experiments
- Personalized recommendations
- Advanced pricing and promotions
- Automated partner settlements
- Native or progressive web application features if justified

## Product Principles

1. The guest journey must remain simple even when the operational rules are complex.
2. Mobile conversion is the primary design constraint.
3. Trust, safety, local expertise, and transparent policies are part of the premium experience.
4. Every payment and booking transition must be recoverable and auditable.
5. Partner referrals must produce measurable value for the guest, partner, and CostaPulse.
6. Architecture should support growth without prematurely adding unnecessary services.

## Initial Stack Decision

The recommended initial production stack is:

- Next.js
- React
- TypeScript
- Tailwind CSS
- shadcn/ui
- Supabase
- Stripe
- next-intl
- React Hook Form
- Zod
- Resend
- PostHog
- Sentry
- Playwright
- Vitest
- Vercel

This stack provides a strong balance of premium user experience, rapid development, maintainability, operational reliability, and future scalability for CostaPulse.
