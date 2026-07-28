# CostaPulse — DevOps

## Purpose

This document contains durable development, deployment and infrastructure knowledge for CostaPulse. It is a memory aid and technical runbook, not a store for live operational business data.

## Environments

Document and maintain clear separation between:

- Local development
- Preview or staging
- Production

Each environment must have explicit configuration, database targets, secrets and deployment ownership.

## Environment variables

- Keep a complete `.env.example` without real secrets.
- Store production secrets only in approved secret stores or deployment platforms.
- Never commit service-role keys, Stripe secrets, webhook secrets or private credentials.
- Document the purpose, required environment and rotation impact of each variable.

## Git workflow

- Keep changes small and atomic.
- Use GitHub Issues for concrete work.
- Use clear branches and pull requests when the workflow requires review.
- Do not mix unrelated refactors and features.
- Record database changes through migrations.
- Prefer reversible changes and explicit rollback notes for risky releases.

## Validation before merge or deployment

Run the checks supported by the repository, including:

- Dependency installation integrity
- Formatting
- Linting
- Type checking
- Unit and integration tests
- Production build
- Database migration validation
- Security-sensitive workflow checks

Agents must report checks they could not run and must not claim successful validation without evidence.

## Deployment principles

- Deploy code and database changes in a safe order.
- Avoid frontend releases that depend on undeployed schema or backend contracts.
- Use backward-compatible transitions for risky changes.
- Verify environment variables before deployment.
- Confirm health after release.
- Keep rollback steps known before high-impact changes.

## Supabase

- Treat migrations as authoritative.
- Review RLS and grants with every new table, view or function.
- Regenerate database types after schema changes.
- Keep local, preview and production projects clearly identified.
- Verify storage bucket policies as part of deployments.

## Hosting and infrastructure

Record confirmed infrastructure here as it is implemented, including Vercel, Supabase, VPS services, Docker stacks, reverse proxies, domains, DNS, backups and monitoring. Do not preserve abandoned experiments as if they are current architecture.

## Backups and recovery

- Document what is backed up, where, how often and how restoration is tested.
- Include database, storage and critical configuration.
- Keep recovery instructions practical and current.
- Do not store backup contents in this documentation directory.

## Monitoring and troubleshooting

Document stable procedures for checking deployment failures, application errors, webhook failures, database health and infrastructure status. Temporary incidents belong in Issues; durable lessons belong here.

## AI coding agents

`AGENTS.md` is the binding entry point for Cursor, Codex and other coding agents. It should direct agents to the relevant numbered documentation and prohibit new loose documentation files.
