# Partner Referral Ecosystem

## Purpose

The Partner Referral Ecosystem is one of the core business concepts of CostaPulse.

Its purpose is to build a scalable network of local businesses that actively promote CostaPulse Experiences while creating measurable value for all participants.

Instead of relying primarily on paid advertising, CostaPulse grows through trusted local partnerships where customers receive an exclusive reward after completing a booking.

This document defines the business rules, objectives and principles of this ecosystem.

---

# Vision

CostaPulse collaborates with restaurants, beach bars, hotels, campings, golf clubs and other local businesses.

Each partner receives a unique referral identity consisting of:

- Partner profile
- Referral code
- QR code
- Landing page
- Analytics
- Voucher integration

Every booking originating from a partner can therefore be measured and attributed.

---

# Business Objectives

The ecosystem has five primary objectives.

## 1. Measurable Marketing

Every partner becomes a measurable acquisition channel.

CostaPulse must always be able to determine:

- Referral visits
- Bookings
- Conversion rate
- Revenue generated
- Voucher value issued
- Partner performance

---

## 2. Additional Revenue For Partners

Customers who complete a successful booking through a partner receive a voucher worth **10% of the eligible booking amount**.

The voucher can only be redeemed at the originating partner.

Example:

Booking value: €450

Voucher value: €45

This stimulates customers to revisit the partner and increases local spending.

---

## 3. Better Customer Experience

Customers receive more than just an experience.

They receive an additional reward that can be enjoyed during the remainder of their holiday.

This increases booking conversion while creating additional value.

---

## 4. Strong Local Ecosystem

Partners are not traditional affiliates.

They become long-term CostaPulse partners.

The objective is to build a local ecosystem where businesses strengthen one another instead of competing.

---

## 5. Scalable Growth

Every new partner should be onboarded within minutes.

The complete referral flow should be generated automatically without manual intervention.

---

# Business Flow

```text
Partner

↓

Unique QR Code

↓

Customer scans QR

↓

Referral Visit

↓

Browse Experiences

↓

Booking

↓

Successful Payment

↓

Referral Attribution

↓

Voucher Generation

↓

Customer receives Voucher

↓

Voucher redeemed at originating Partner

↓

Partner generates additional revenue
```

---

# Core Business Rules

The following rules are fundamental and may never be violated.

- Every partner has a unique identity.
- Every QR code is unique.
- Every referral is traceable.
- Every booking can only belong to one partner attribution.
- Referral attribution is determined server-side.
- Referral attribution cannot be manipulated by the client.
- A voucher is only generated after a successful payment.
- Every voucher belongs to exactly one booking.
- Every voucher belongs to exactly one customer.
- Every voucher belongs to exactly one partner.
- A voucher may only be redeemed at the originating partner.
- Voucher redemption must always be validated server-side.
- Every sensitive action must be auditable.

---

# Success Metrics

The ecosystem should continuously measure:

- Active partners
- Referral visits
- Referral conversions
- Revenue generated
- Average booking value
- Voucher value issued
- Voucher redemption rate
- Revenue generated for partners
- Top performing partners

---

# Future Expansion

Although initially designed for restaurants and hospitality partners, the architecture must support future expansion without redesign.

Examples include:

- Hotels
- Beach clubs
- Golf clubs
- Campings
- Car rental
- Bike rental
- Watersports
- Tourist attractions
- Events
- Retail stores

The referral architecture should remain generic so that any local business can become a CostaPulse Partner.

---

# Conclusion

The Partner Referral Ecosystem is not a marketing feature.

It is one of the core business pillars of CostaPulse.

It creates a sustainable acquisition channel, measurable partner relationships, additional customer value and stronger local collaboration while reducing dependency on paid advertising.

All technical implementations related to referrals, QR codes, partner dashboards, vouchers and attribution must follow the principles defined in this document.
