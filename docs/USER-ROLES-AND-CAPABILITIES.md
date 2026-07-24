# CostaPulse User Roles & Capabilities

## Purpose

This document defines the user roles, permissions, ownership rules, and access-control principles for CostaPulse.

The objective is to provide a clear foundation for:

- Product design
- Supabase Row Level Security
- Backend authorization
- Admin dashboards
- Partner and provider portals
- Audit logging
- Future team growth

CostaPulse should use role-based access control combined with ownership-based rules. A role determines the general permission level, while ownership and assignment determine which specific records a user may access or modify.

## Authorization Principles

1. Deny access by default.
2. Grant only the minimum permissions required for each role.
3. Never trust role or ownership claims sent by the browser.
4. Enforce permissions on the server and in the database.
5. Use Supabase Row Level Security for all exposed tables.
6. Separate platform administration from operational work.
7. Record sensitive actions in an audit log.
8. Avoid giving providers access to customer or financial data unrelated to their own bookings.
9. Never expose payment credentials, internal notes, or private operational data to guests.
10. Allow a user to hold multiple roles where the business requires it.

## Core Roles

The initial role set is:

- Guest
- Customer
- Experience Provider
- Team Member
- Partner
- Operations Staff
- Customer Support
- Finance Manager
- Content Manager
- Administrator
- Super Administrator

A single authenticated user may hold more than one role. For example, a provider may also be a partner, or an administrator may also perform operations duties.

## Role Summary

| Role | Primary Purpose | Access Scope |
|---|---|---|
| Guest | Browse and discover CostaPulse | Public content only |
| Customer | Book and manage personal experiences | Own profile and bookings |
| Experience Provider | Deliver and manage assigned experiences | Own provider profile, experiences, and bookings |
| Team Member | Perform assigned operational work | Assigned experiences and bookings only |
| Partner | Refer customers and track rewards | Own partner data and attributed bookings |
| Operations Staff | Coordinate bookings and delivery | Operational records across the platform |
| Customer Support | Assist customers and resolve issues | Customer and booking support data |
| Finance Manager | Handle payments, refunds, and settlements | Financial and reconciliation data |
| Content Manager | Manage public content and merchandising | Experiences, profiles, media, and SEO |
| Administrator | Manage most platform operations and settings | Broad platform access |
| Super Administrator | Control security-critical and platform-wide settings | Full access |

## 1. Guest

A guest is an unauthenticated visitor.

### Capabilities

- View published experience listings
- View published provider and team profiles
- Browse categories, locations, and search results
- View public availability
- View public pricing
- View verified public reviews
- View partner referral landing pages
- Start a booking journey
- Register or sign in
- Submit permitted public forms
- Accept cookies and privacy preferences

### Restrictions

- Cannot create a confirmed booking without providing required customer details
- Cannot access customer accounts
- Cannot view private meeting points
- Cannot view internal provider information
- Cannot see operational notes
- Cannot access partner, provider, or admin dashboards
- Cannot submit a verified review

## 2. Customer

A customer is an authenticated person who books or participates in an experience.

### Profile Capabilities

- View and update their own profile
- Manage contact information
- Manage preferred language
- Manage communication preferences
- Store participant details where permitted
- Request account deletion
- View privacy and consent history

### Booking Capabilities

- Create a booking
- Select dates, participants, and add-ons
- Pay for a booking
- View their own booking history
- View booking status
- Access confirmed meeting-point information
- Download invoices, vouchers, or confirmations linked to their booking
- Cancel or request rescheduling within policy
- Add required guest information
- Accept waivers or terms
- Contact support regarding their own booking
- Submit a review for a completed booking

### Restrictions

- Cannot view another customer's bookings or profile
- Cannot modify server-calculated prices
- Cannot change booking status directly
- Cannot issue refunds
- Cannot change capacity or availability
- Cannot view provider payout data
- Cannot view internal notes
- Cannot submit a review for an incomplete or unrelated booking

## 3. Experience Provider

An experience provider is a business or independent professional responsible for one or more CostaPulse experiences.

### Profile Capabilities

- View and update their own provider profile
- Manage public biography and operational details subject to moderation
- Upload and manage permitted media
- Manage languages, qualifications, and service areas
- Manage assigned team members when explicitly authorized

### Experience Capabilities

- View experiences they own or are assigned to
- Create draft experience proposals
- Edit permitted experience fields
- Manage schedules and availability
- Manage capacity within approved limits
- Manage blackout dates
- Manage add-ons where authorized
- View operational requirements and policies
- Submit changes for review or publication

### Booking Capabilities

- View bookings for their own experiences
- View customer information required to deliver the experience
- Accept or decline pending bookings where manual confirmation applies
- Assign eligible team members
- Update operational booking status
- Mark attendance, completion, or no-show
- Add internal provider notes
- Contact customers through approved communication channels
- Report incidents or service issues

### Financial Capabilities

- View their own gross booking value where configured
- View provider fees, commissions, and payout status related to their own services
- View settlement statements
- Submit payout details through an approved secure flow

### Restrictions

- Cannot view bookings belonging to other providers
- Cannot modify customer payments directly
- Cannot issue refunds unless explicitly delegated
- Cannot change platform commission rates
- Cannot publish content without moderation unless granted publishing rights
- Cannot access partner rewards unrelated to their own account
- Cannot access platform-wide analytics or settings
- Cannot delete audit logs

## 4. Team Member

A team member is a guide, skipper, monitor, host, driver, photographer, or other person assigned to deliver an experience.

### Capabilities

- View their own team profile
- View assigned shifts, experiences, and bookings
- View operational details required for delivery
- View participant names and relevant safety information
- View confirmed meeting points
- Update availability for assignment
- Accept or reject assignments when enabled
- Check in customers
- Mark operational progress
- Add delivery notes
- Report incidents
- Mark an assigned experience as completed

### Restrictions

- Cannot view all provider bookings by default
- Cannot view complete customer account histories
- Cannot view payment details
- Cannot change prices
- Cannot issue refunds
- Cannot edit provider financial details
- Cannot publish or delete experiences
- Cannot manage unrelated team members
- Cannot access platform administration

## 5. Partner

A partner is a hotel, restaurant, bar, rental business, golf club, tourism office, accommodation provider, or other local business that refers customers to CostaPulse.

### Profile Capabilities

- View and update their own partner profile
- Manage public business information subject to approval
- Manage partner locations
- View assigned referral codes and QR campaigns
- Download approved QR materials

### Referral Capabilities

- View referral visits and conversions attributed to their account
- View eligible attributed bookings at the permitted level of detail
- View customer voucher status without unnecessary personal data
- View reward or commission calculations
- View settlement status
- Export partner reports where enabled

### Restrictions

- Cannot view full customer profiles
- Cannot see payment card details
- Cannot modify booking prices
- Cannot manually attribute unrelated bookings
- Cannot create arbitrary vouchers or rewards
- Cannot change commission agreements
- Cannot access another partner's data
- Cannot view provider payout information
- Cannot manage experiences unless they hold a separate provider role

## 6. Operations Staff

Operations staff coordinate day-to-day delivery across the platform.

### Booking Capabilities

- View operational bookings across providers
- Confirm, reassign, reschedule, or cancel bookings within policy
- Manage availability and operational capacity
- Assign providers, team members, vessels, vehicles, or equipment
- View contact details required for operations
- Send operational notifications
- Manage meeting points
- Record incidents and disruptions
- Apply weather or safety closures
- Mark attendance, completion, and no-show
- Add internal operational notes

### Resource Capabilities

- Manage assignable operational resources
- View resource availability
- Prevent double booking
- Block resources for maintenance
- Manage operational checklists

### Restrictions

- Cannot change financial configuration
- Cannot edit platform-wide security settings
- Cannot alter commission contracts unless separately authorized
- Cannot permanently delete financial records
- Cannot grant administrator roles

## 7. Customer Support

Customer support assists customers before and after booking.

### Capabilities

- Search customers and bookings
- View booking history required for support
- View communication history
- Send approved support messages
- Add internal support notes
- Initiate cancellation or rescheduling workflows
- Apply approved goodwill vouchers within defined limits
- Escalate refund requests
- Record complaints and resolutions
- Handle account access issues

### Restrictions

- Cannot see full payment credentials
- Cannot approve unrestricted refunds
- Cannot edit provider payout data
- Cannot change commission rules
- Cannot publish content
- Cannot change user roles
- Cannot delete audit records

## 8. Finance Manager

The finance manager handles payments, refunds, partner rewards, provider payouts, taxes, and reconciliation.

### Capabilities

- View payment and transaction records
- View booking financial breakdowns
- Initiate or approve refunds within policy
- Manage partial refunds
- Review failed or disputed payments
- Reconcile Stripe transactions
- Manage provider settlements
- Manage partner settlements
- View commission calculations
- Export financial reports
- Manage invoice and tax metadata
- Add finance notes
- Freeze payouts during disputes

### Restrictions

- Cannot edit experience content unless separately authorized
- Cannot manage security roles
- Cannot access private operational data beyond financial necessity
- Cannot delete completed payment records
- Cannot bypass audit requirements

## 9. Content Manager

The content manager controls public-facing content, merchandising, and search visibility.

### Capabilities

- Create and edit experiences
- Manage localized content
- Manage categories, tags, and locations
- Manage experience and profile media
- Review provider-submitted content
- Publish, unpublish, archive, and schedule content
- Manage featured experiences
- Manage homepage and landing-page content
- Manage SEO metadata
- Manage FAQs and policy content
- Moderate public reviews
- Manage promotional campaigns without changing financial rules

### Restrictions

- Cannot access payment details
- Cannot issue refunds
- Cannot manage provider payouts
- Cannot change security roles
- Cannot view customer data beyond what is necessary for content moderation
- Cannot edit audit logs

## 10. Administrator

An administrator manages most business and platform operations.

### Capabilities

- Manage customers, providers, partners, and team members
- Assign non-super-admin roles
- Manage experiences and availability
- Manage bookings and operations
- Manage approved refund and settlement workflows
- Manage vouchers, referral rules, and campaigns
- Manage content and moderation
- View platform analytics
- Configure operational settings
- View audit logs
- Suspend accounts
- Resolve disputes
- Manage integration settings that are not security-critical

### Restrictions

- Cannot grant or remove Super Administrator access
- Cannot access raw secrets or private keys
- Cannot disable audit logging
- Cannot permanently erase protected financial records
- Cannot bypass security controls without an auditable emergency process

## 11. Super Administrator

A super administrator has full platform-level authority.

### Capabilities

- All administrator capabilities
- Grant and revoke administrator and super-administrator roles
- Manage global authorization policies
- Manage security-critical integration settings
- Manage legal and compliance configuration
- Perform emergency account and access interventions
- Access complete audit and security records
- Manage data-retention and deletion workflows
- Approve exceptional financial corrections
- Configure platform-wide commission and payout rules

### Restrictions and Safeguards

- Super Administrator access must be limited to a very small number of trusted users
- Multi-factor authentication must be mandatory
- Sensitive actions should require re-authentication
- Critical changes should generate immediate audit events
- Highly sensitive actions may require four-eyes approval
- Super Administrator accounts should not be used for routine daily operations

## Capability Matrix

Legend:

- Yes: permitted by role
- Own: limited to owned or assigned records
- Limited: permitted under defined workflow or threshold
- No: not permitted

| Capability | Guest | Customer | Provider | Team Member | Partner | Operations | Support | Finance | Content | Admin | Super Admin |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| View published experiences | Yes | Yes | Yes | Yes | Yes | Yes | Yes | Yes | Yes | Yes | Yes |
| Manage own profile | No | Own | Own | Own | Own | Yes | Limited | Limited | Limited | Yes | Yes |
| Create booking | Limited | Yes | No | No | No | Yes | Limited | No | No | Yes | Yes |
| View bookings | No | Own | Own | Assigned | Attributed | Yes | Yes | Financial | Limited | Yes | Yes |
| Manage availability | No | No | Own | Limited | No | Yes | No | No | Limited | Yes | Yes |
| Assign team/resources | No | No | Own | No | No | Yes | No | No | No | Yes | Yes |
| Change booking status | No | Limited | Own | Assigned | No | Yes | Limited | Limited | No | Yes | Yes |
| Issue refunds | No | No | No | No | No | Limited | Request | Yes | No | Yes | Yes |
| View payouts | No | No | Own | No | Own | Limited | No | Yes | No | Yes | Yes |
| Manage partner rewards | No | No | No | No | Own view | Limited | No | Yes | No | Yes | Yes |
| Publish experiences | No | No | Limited | No | No | No | No | No | Yes | Yes | Yes |
| Moderate reviews | No | Own submission | No | No | No | No | Limited | No | Yes | Yes | Yes |
| Manage users | No | No | Own team limited | No | No | Limited | Limited | No | No | Yes | Yes |
| Assign admin roles | No | No | No | No | No | No | No | No | No | Limited | Yes |
| View audit logs | No | No | Own limited | No | No | Limited | Limited | Finance limited | Content limited | Yes | Yes |
| Manage security policy | No | No | No | No | No | No | No | No | No | No | Yes |

## Ownership Rules

Role checks alone are not sufficient. Most records also require ownership or assignment checks.

### Customer Ownership

A customer may access a booking when:

- `booking.customer_id = auth.uid()`
- or the user is explicitly linked as an authorized booking participant with account access

### Provider Ownership

A provider may access an experience or booking when:

- The provider owns the experience
- The provider organization is assigned to the experience
- The booking is linked to an experience belonging to that provider

### Team Assignment

A team member may access a booking when:

- They are assigned directly to the booking
- They are assigned to the scheduled departure
- Their provider grants approved operational access

### Partner Attribution

A partner may access referral data when:

- The referral code belongs to their partner account
- The attributed booking is linked to that referral code
- The returned data is limited to the minimum necessary fields

### Staff Scope

Internal staff may have:

- Global scope
- Regional scope
- Location scope
- Provider scope
- Department scope

The system should support scoped staff permissions so access can be narrowed as the business grows.

## Recommended Permission Model

Use three layers:

### 1. Roles

Examples:

```text
customer
provider
team_member
partner
operations
support
finance
content_manager
admin
super_admin
```

### 2. Capabilities

Examples:

```text
booking.read.own
booking.read.assigned
booking.read.all
booking.create
booking.reschedule
booking.cancel
booking.refund.request
booking.refund.approve
experience.create
experience.edit.own
experience.publish
availability.manage.own
availability.manage.all
partner.analytics.read.own
partner.settlement.manage
user.role.assign
security.policy.manage
```

### 3. Record Scope

Examples:

```text
own
assigned
provider
partner
location
region
all
```

This model is more flexible than hard-coding all logic directly around role names.

## Suggested Database Tables

```text
user_profiles
roles
capabilities
user_roles
role_capabilities
user_scopes
provider_memberships
partner_memberships
team_assignments
booking_assignments
audit_logs
```

### Example Structure

#### `roles`

```text
id
key
name
description
is_system_role
created_at
```

#### `capabilities`

```text
id
key
description
created_at
```

#### `user_roles`

```text
id
user_id
role_id
organization_id
scope_type
scope_id
valid_from
valid_until
assigned_by
created_at
```

#### `role_capabilities`

```text
role_id
capability_id
conditions
```

#### `audit_logs`

```text
id
actor_user_id
action
resource_type
resource_id
before_data
after_data
ip_address
user_agent
created_at
```

## Supabase Implementation Guidance

### Authentication

Use Supabase Auth for identity.

Authentication answers:

> Who is the user?

Authorization answers:

> What is the user allowed to do with this record?

Do not rely exclusively on JWT role metadata for permissions that change frequently. Database-backed role and membership checks are safer for dynamic authorization.

### Row Level Security

Enable RLS on all tables exposed through the Supabase API.

Example conceptual policy for customers reading their own bookings:

```sql
create policy "customers can read own bookings"
on public.bookings
for select
using (customer_id = auth.uid());
```

Example conceptual policy for assigned team members:

```sql
create policy "team members can read assigned bookings"
on public.bookings
for select
using (
  exists (
    select 1
    from public.booking_assignments ba
    where ba.booking_id = bookings.id
      and ba.user_id = auth.uid()
  )
);
```

Complex privileged actions should use secure server-side functions or backend endpoints rather than broad direct-table write access.

### Service Role

The Supabase service-role key:

- Must never be exposed to the browser
- Must only be used in trusted server environments
- Bypasses RLS and therefore requires explicit authorization checks in application code
- Should be limited to workflows that genuinely require elevated access

## Sensitive Data Boundaries

### Customer Data

Providers and team members should only receive data necessary to deliver the experience.

Potentially permitted:

- Customer name
- Contact method
- Number of participants
- Relevant ages
- Relevant medical, dietary, mobility, or safety information
- Language preference
- Booking-specific notes

Normally restricted:

- Complete booking history
- Unrelated addresses
- Full account profile
- Payment credentials
- Internal support notes
- Fraud or risk scoring

### Financial Data

Only finance-authorized users should access:

- Provider bank or payout details
- Full settlement data
- Commission contracts
- Payment disputes
- Tax records
- Internal margin data

Providers and partners should see only their own approved financial summaries.

### Internal Notes

Use separate note types:

- Customer-visible note
- Provider-visible operational note
- Internal operations note
- Support note
- Finance note
- Security or risk note

Never store all notes in one universally visible field.

## Approval Workflows

Certain actions should require approval or dual control.

Recommended examples:

- Large refunds
- Manual price overrides
- Retroactive referral attribution
- Provider payout changes
- Commission changes
- Super Administrator assignment
- Permanent account deletion
- Exceptional financial corrections
- Publication of high-risk experiences

## Temporary and Delegated Access

Support temporary roles and assignments using:

- `valid_from`
- `valid_until`
- Scoped provider, location, or booking access
- Explicit assignment source
- Automatic expiration

Examples:

- Temporary guide for one booking
- Seasonal operations employee
- External accountant with finance read-only access
- Photographer with access to one event
- Support contractor restricted to one region

## Account Statuses

Roles and account status should be separate concepts.

Suggested statuses:

```text
invited
active
pending_verification
suspended
restricted
deactivated
deleted
```

A user may hold a valid role but still be prevented from acting because their account is suspended or pending verification.

## Provider and Team Verification

Providers and operational team members may require verification before performing sensitive actions.

Suggested verification fields:

- Identity verified
- Contact verified
- Business verified
- Qualifications verified
- Insurance verified
- Licence verified
- Background or compliance review completed
- Verification expiry date

Capabilities such as accepting bookings or being assigned as skipper should depend on current verification state where legally or operationally required.

## Audit Requirements

Audit the following actions at minimum:

- Role assignments and removals
- Account suspensions
- Booking status changes
- Manual booking creation
- Price overrides
- Refunds
- Payout changes
- Referral attribution changes
- Voucher creation and cancellation
- Content publication
- Review moderation
- Access to highly sensitive records
- Security setting changes

Audit records should be immutable for normal users and administrators.

## Initial MVP Recommendation

For the first production version, implement these roles first:

1. Customer
2. Provider
3. Team Member
4. Partner
5. Operations Staff
6. Administrator
7. Super Administrator

Finance, Support, and Content Manager may initially be administrator capability groups, but they should be separated before the internal team expands or external staff receive access.

## Product Rules

1. Customers only see their own personal and booking data.
2. Providers only see the experiences and bookings they own or manage.
3. Team members only see assignments needed for delivery.
4. Partners only see referral performance linked to their own codes and locations.
5. Internal operational access must be scoped whenever possible.
6. Financial permissions must remain separate from content and operations permissions.
7. Security-critical access must remain separate from routine administration.
8. Every sensitive action must be attributable to a specific authenticated user.
9. Frontend visibility does not replace backend authorization.
10. No user interface should imply a permission that the database does not enforce.

## Final Recommendation

CostaPulse should implement capability-based RBAC on top of Supabase Auth and Row Level Security.

The role system must support:

- Multiple roles per user
- Organization and provider memberships
- Record ownership
- Assignment-based access
- Geographic or operational scopes
- Temporary access
- Verification requirements
- Auditable privileged actions

This structure is suitable for the initial CostaPulse platform while remaining flexible enough to support multiple providers, partners, internal teams, locations, and future marketplace growth.
