## Linked issue

Closes #ISSUE_NUMBER

## Summary

Describe what changed and why.

## Architecture guardrails

- [ ] I searched for existing components, hooks, utilities and design-system primitives before creating new ones.
- [ ] I reused existing code where appropriate and did not create near-duplicates.
- [ ] Page files primarily compose the page; substantial UI sections are extracted into focused components.
- [ ] Page-specific components remain close to the feature/page; genuinely reusable components are placed in the appropriate shared/domain layer.
- [ ] Data access, authorization and business logic are kept outside presentational components.
- [ ] New abstractions have at least two real use cases, unless they are foundational design-system primitives.
- [ ] I documented which existing components were reused and which reusable components were added.

## Reuse report

**Existing components/hooks/utilities reused:**

- 

**New reusable components created:**

- 

**Why any large page/component was intentionally not split:**

- 

## Validation

- [ ] Lint passes.
- [ ] Typecheck passes.
- [ ] Tests pass where applicable.
- [ ] Build passes.
- [ ] Responsive and interactive states were verified.
