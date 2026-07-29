# CostaPulse — Product Scope

## Purpose

This document defines what CostaPulse does from a product perspective. It describes product domains, user roles, user flows and business rules without duplicating implementation details.

## Public platform

Visitors can discover experiences and professional services, browse destinations, marinas, beaches and coastal areas, view experience and team profiles, check availability, choose variants, participants and add-ons, complete bookings and payments, and access confirmations, vouchers and relevant account information.

## Geographic product model

CostaPulse must support multiple curated regions without hardcoding the product to a single town or coastline.

The initial consumer launch corridor is the Spanish coast between Málaga and Jávea. Within that corridor, CostaPulse should support distinct destination and operational location types, including:

- regions and coastal corridors;
- cities and coastal towns;
- marinas and ports;
- beaches, coves and launch points;
- meeting points and operational service areas.

The first launch priority is to identify and present the best locations for Kevin's own services:

- premium private yacht charters departing from carefully selected marinas;
- paddleboard mentoring at attractive, safe and operationally suitable beaches or bays;
- kayak mentoring at scenic coastal locations with suitable access and conditions.

Future consumer expansion may include the Balearic Islands and Canary Islands. Expansion must remain curated, brand-consistent and operationally credible. The platform must not assume that every region offers the same activities, seasons, logistics or visual context.

Location, destination and region relationships should remain data-driven so the frontend can represent current and future areas without duplicating routes, components or business logic for each geography.

## Experience domain

An experience can include public content and media, variants, locations, availability, capacity rules, pricing, add-ons, hosts, team members, requirements, policies, languages, itinerary and highlights.

The principal founder-led consumer experience categories are:

- private yacht charters;
- paddleboard mentoring;
- kayak mentoring;
- related curated coastal and hospitality experiences that meet the CostaPulse quality standard.

CostaPulse is curated rather than crowded. Product decisions should favour a smaller set of credible, high-quality experiences over anonymous marketplace volume.

## Private yacht charter domain

Private yacht charters are a core CostaPulse proposition and are initially founder-led by Kevin.

The product should be capable of representing:

- departure marina and embarkation point;
- charter area, route and possible coastal highlights;
- duration and charter variant;
- yacht or vessel context where provided by the backend;
- guest capacity;
- skipper or host identity;
- menus, add-ons and hospitality options;
- operational requirements, weather policy and confirmation flow;
- imagery that communicates the real marina, coastline and onboard experience.

Charter pages should present premium personal service and maritime competence, not resemble anonymous boat-rental listings.

## Paddleboard and kayak domain

Paddleboard and kayak experiences are mentoring-led coastal experiences rather than equipment-only rentals.

The product should be capable of representing:

- beach, bay, cove or launch location;
- meeting point and access information;
- experience level and physical or swimming requirements;
- duration, group size and mentoring format;
- weather, sea-state and cancellation considerations;
- included equipment and safety information;
- host credibility and local knowledge.

Location selection should reflect scenic value, safety, access and real operational suitability.

## Professional maritime services domain

CostaPulse includes professional B2B maritime services as a distinct product domain within the same brand.

The first professional geographic focus is Western European harbour towage, especially:

- Rotterdam;
- Amsterdam;
- the Scheldt region;
- other selected Western European ports as the service expands.

Professional services may include:

- harbour tug captain assignments;
- ASD tug operations;
- training captain engagements;
- ship-handling mentoring;
- maritime consultancy;
- professional credential presentation and controlled sharing;
- assignment availability and inquiry flows.

Professional service pages may use more technical terminology, operational evidence and credential detail than leisure experience pages. They must still use the CostaPulse design system and should feel like a premium maritime service within the wider brand, not a separate corporate website.

Professional services are generally inquiry- or quote-led unless the verified backend explicitly supports direct booking.

## Partner discovery domain

The public partner experience helps visitors discover active CostaPulse partners by location and category. Map markers and partner cards are synchronized representations of the same selected partner, while partner details and nearby experiences remain part of the real navigated flow.

Public partner presentation must not expose internal notes, unrestricted analytics, private customer data or operational controls. The public experience remains editorial and discovery-led rather than an internal dashboard.

## Partner and referral domain

CostaPulse supports local partners through referral links, QR codes and attributed campaigns. A partner may recommend CostaPulse to a customer, the customer may complete an eligible booking, and configured rewards can then bring the customer back to the referring partner while also creating value for the provider, team and wider CostaPulse network.

Core product principles:

- every referral has a server-authoritative partner identity;
- attribution is measurable and tied to the verified booking flow;
- voucher percentages, validity, eligibility and redemption rules come from the application contract, not frontend constants;
- one participant's benefit should create measurable value for the other roles;
- partners receive only the minimum customer and booking information needed for their role;
- historical attribution and issued reward snapshots remain auditable.

This shared-value model reduces dependence on isolated paid marketing by connecting customers, partners, providers, team members and CostaPulse through measurable reciprocal benefits.

## Customer domain

Customers can manage a profile, bookings, participants, payments, refunds, reviews, vouchers, waivers, confirmations and communication preferences.

## Booking stories and previous adventures

Completed experiences may expose approved booking-story media as public social proof on the related experience page. Public stories use only published, authorized media returned by the backend. Admin users manage story records, media ordering and cover selection through the approved admin workflow.

## Crew and team platform

The crew platform is a premium authenticated environment for team members and maritime crew. Planned capabilities include personal profiles, assignments, certifications and sign-on/sign-off records.

Sign-on/sign-off information may include vessel, yacht or ship, role, joining place, leaving place, start date, end date and related assignment details. These records are live data and remain in the database.

## Admin platform

The admin environment manages application content and workflows, including experiences, destinations, locations, media, bookings, availability, customers, partners, team members, professional services, reviews, finance views and system administration.

The existing Founder Dashboard is an established application surface. New work must upgrade it incrementally, preserve working routes and functionality, and add only verified sections or capabilities. It must not be rebuilt as a generic dashboard.

For the current dashboard phase, the primary workspaces are:

- Founder, represented by the existing super-administrator access;
- Partner, restricted to the authenticated partner's own profile, referrals, attributed results, vouchers, payouts, promotional material and permitted business or financial details.

## Role and capability model

CostaPulse uses role-based access combined with ownership and assignment rules. One authenticated user may hold multiple roles.

| Role                | Primary purpose                      | Typical scope                                                        |
| ------------------- | ------------------------------------ | -------------------------------------------------------------------- |
| Guest               | Browse and begin public journeys     | Published public content only                                        |
| Customer            | Book and manage personal experiences | Own profile, participants and bookings                               |
| Experience Provider | Deliver and manage owned experiences | Own provider profile, experiences, availability and related bookings |
| Team Member         | Perform assigned work                | Assigned experiences, shifts and bookings                            |
| Partner             | Refer customers and track rewards    | Own partner profile, campaigns and attributed results                |
| Operations Staff    | Coordinate delivery                  | Operational bookings, capacity, resources and incidents              |
| Customer Support    | Assist customers                     | Support-relevant customer, booking and communication data            |
| Finance Manager     | Reconcile money flows                | Payments, refunds, settlements and finance reporting                 |
| Content Manager     | Manage public content                | Experiences, profiles, media, SEO and reviews                        |
| Administrator       | Manage most platform functions       | Broad non-super-admin access                                         |
| Super Administrator | Control security-critical settings   | Full platform authority with safeguards                              |

### Guest

May view published experiences, profiles, availability, prices, reviews and referral landing pages; begin a booking; register; sign in; and submit permitted public forms. Cannot access private accounts, internal notes, private meeting points or dashboards.

### Customer

May manage their own profile, preferences, participants and bookings; pay; access confirmations and vouchers; request cancellation or rescheduling; accept waivers; contact support; and review completed bookings. Cannot access another customer's records, alter server-calculated prices, issue refunds or change capacity.

### Experience Provider

May manage their own provider profile, assigned experiences, schedules, availability, permitted media, operational bookings, team assignments and provider-facing financial information. Cannot access unrelated providers, unrestricted refunds, platform commissions, security settings or unrelated partner data.

### Team Member

May view their own profile, assignments, required participant and safety information, meeting points and delivery details; update permitted availability; check in customers; record progress and incidents; and mark assigned work complete. Cannot access unrelated bookings, full customer histories, payments, pricing or platform administration.

### Partner

May manage their own partner profile and locations, view referral codes and QR materials, and see attributed visits, conversions, rewards and settlements at the minimum necessary detail. Cannot view full customer profiles, modify booking prices, attribute unrelated bookings or create arbitrary vouchers.

### Operations Staff

May coordinate operational bookings, schedules, capacity, providers, team, vessels, vehicles, equipment, meeting points, notifications, closures, attendance and incidents. Cannot grant administrator roles or alter security-critical and unrestricted financial settings.

### Customer Support

May search relevant customers and bookings, review communication history, send approved support messages, add support notes, initiate approved cancellation or rescheduling flows and escalate refunds. Cannot access raw payment credentials, payouts, security roles or audit deletion.

### Finance Manager

May view and reconcile transactions, initiate or approve policy-compliant refunds, manage disputes, settlements, commissions, invoices, taxes and financial exports. Cannot manage security roles or access unrelated operational data beyond financial necessity.

### Content Manager

May create, localize, publish, unpublish and merchandise experiences and public content; manage media, SEO, FAQs, profiles and review moderation. Cannot access payments, refunds, payouts or security roles.

### Administrator

May manage most users, roles below super administrator, experiences, availability, bookings, operations, approved financial workflows, vouchers, campaigns, content, analytics and non-critical integration settings. Cannot grant super-administrator access, expose raw secrets or disable audit controls.

### Super Administrator

May perform all administrator actions plus manage security-critical roles, global authorization, legal and retention settings, exceptional financial corrections and emergency interventions. MFA, re-authentication, strong audit events and limited account usage are mandatory safeguards.

## Ownership and scope rules

- Customers access records through ownership or explicit participant authorization.
- Providers access records through ownership or assignment to the relevant experience.
- Team members access records through direct assignment, scheduled departure or explicitly delegated provider scope.
- Partners access only data attributed to their own codes and campaigns, minimized to necessary fields.
- Staff access may be narrowed by region, location, provider or department.
- Role alone never grants access when ownership or assignment is also required.

## Capability design

Capabilities should remain granular, for example `booking.read.own`, `booking.read.assigned`, `booking.refund.approve`, `experience.edit.own`, `experience.publish`, `availability.manage.own`, `partner.analytics.read.own`, `user.role.assign` and `audit.read`.

## Scope discipline

- Product behavior belongs here.
- Authorization enforcement belongs in database, backend and security documentation.
- Live records and operational data belong in Supabase.
- Concrete work belongs in GitHub Issues.
