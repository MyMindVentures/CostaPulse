# CostaPulse — Architecture

## Purpose

This document records the durable technical architecture and major architectural decisions for CostaPulse.

## Core stack

- Next.js and React for the web applications
- TypeScript across the application
- Supabase for PostgreSQL, authentication, storage and backend capabilities
- Stripe for payments
- GitHub for source control, issues and project knowledge
- Vercel and/or documented infrastructure for deployment

## Source-of-truth boundaries

- Supabase is the source of truth for schema, permissions and live application data.
- SQL migrations are the source of truth for database evolution.
- Source code is the source of truth for implemented behavior.
- `/docs` explains the architecture, conventions and intent.
- GitHub Issues describe work to be performed.

## Required implementation order

1. Inspect the existing database, migrations and generated types.
2. Design or change the database deliberately.
3. Implement secured backend logic.
4. Build the frontend on top of the confirmed contracts.
5. Validate integration, permissions and failure states.

Agents must never guess a table, field, route, role or backend contract.

## Application boundaries

### Public web application

Responsible for discovery, experience presentation, public team profiles, availability selection and customer booking flows.

### Authenticated customer and crew areas

Responsible for user-specific information and workflows. Access must be enforced server-side, not only by hidden frontend controls.

### Admin application

Responsible for content and workflow management. Privileged mutations must use secured server-side functions or actions.

### Backend layer

Responsible for business invariants, payment orchestration, booking state changes, voucher issuance, notifications, auditing and other sensitive multi-table workflows.

### Data layer

Responsible for relational integrity, row-level security, durable history, snapshots and efficient read models.

## Architectural rules

- Prefer one clear implementation over parallel alternatives.
- Reuse established components and utilities.
- Keep privileged credentials server-side.
- Do not place sensitive multi-table mutations in browser code.
- Enforce authorization through RLS and secured backend entry points.
- Preserve historical booking data through snapshots where appropriate.
- Use idempotency for payment and externally triggered workflows.
- Record major architectural changes in this document.

## Decision log

Add concise entries below when a lasting architectural choice is made.

### ADR-001 — Repository as project knowledge base

CostaPulse keeps durable project information, technical memory and DevOps guidance in the repository. Notion and loose documentation files are not part of the official knowledge system.

### ADR-002 — Limited documentation set

The `/docs` directory is limited to ten numbered documents. Existing files must be expanded instead of creating topic-specific note files.
