# CostaPulse — Product Scope

## Purpose

This document defines what CostaPulse does from a product perspective. It describes product domains, user roles, user flows and business rules without duplicating implementation details.

## Public platform

The public platform allows visitors to:

- Discover experiences and services.
- View detailed experience profiles.
- View team and host profiles.
- Check availability.
- Select variants, participants and add-ons.
- Complete bookings and payments.
- Access booking confirmations, vouchers and relevant account information.

## Experience domain

An experience can include:

- Public content and media
- One or more variants
- Locations
- Availability
- Capacity rules
- Pricing
- Add-ons
- Hosts or team members
- Requirements
- Policies
- Languages
- Itinerary and highlights

## Partner and referral domain

CostaPulse supports local partners through referral links and QR codes. A referred customer can complete a booking and, when the configured conditions are met, receive a partner voucher. Attribution, voucher percentages and redemption rules are controlled by the application.

## Customer domain

Customers can have:

- A profile
- Booking history
- Participants
- Payments and refunds
- Reviews
- Vouchers
- Waivers and required confirmations
- Communication preferences

## Crew and team platform

The crew platform is a premium authenticated environment for team members and maritime crew. Planned capabilities include personal profiles, assignments, certifications and sign-on/sign-off records.

Sign-on/sign-off information may include vessel, yacht or ship, role, joining place, leaving place, start date, end date and related assignment details. These records are live data and must remain in the database.

## Admin platform

The admin environment manages application content and workflows, including experiences, media, bookings, availability, customers, partners, team members, reviews, finance views and system administration.

## Roles

Expected roles include customer, experience provider, team member, partner, operations staff, customer support, finance manager, content manager, administrator and super administrator.

## Scope discipline

- Product behavior belongs here.
- Technical implementation belongs in the architecture, database, backend and frontend documents.
- Live records and operational data belong in Supabase.
- Concrete work belongs in GitHub Issues.
