# Stage 0 baseline

This document freezes the starting behavior of the inherited language-learning
application before NextHop domain work begins. It is a safety record, not a
description of the desired product.

## Scope

Stage 0 adds:

- runtime validation for required database, Clerk, Stripe, and public URL
  configuration;
- characterization tests for protected pages, admin API boundaries, legacy
  lesson completion, and Stripe webhook routing;
- a checked-in baseline migration for fresh databases; and
- a database backup, migration, and rollback runbook.

Stage 0 does not connect to or change a deployed database, create real users,
change authentication providers, import certification content, or change the
learner-facing progression rules.

## Intentionally temporary behavior

The following behavior is covered or documented so later stages can replace it
deliberately:

- Clerk user IDs are application identifiers and admins are configured by an
  environment-variable allowlist.
- A learner has one active course and one mutable row containing hearts and
  points.
- A challenge is complete when it has one or more progress rows and every row
  is marked complete.
- A lesson is complete when it has at least one challenge and every challenge
  is complete.
- Empty lessons are not complete but are skipped when choosing the next active
  lesson.
- Only `checkout.session.completed` and `invoice.payment_succeeded` Stripe
  events are acted upon.
- Content is edited directly in production-shaped tables through React Admin.

None of these rules should be reused as NextHop mastery, readiness, scheduling,
identity, entitlement, or publishing contracts.

## Known high-priority risks retained for later stages

- Correctness is decided in the browser; the completion action receives only a
  challenge ID.
- Progress, XP, and heart updates are not transactional or idempotent.
- Challenge progress has no `(user_id, challenge_id)` uniqueness constraint.
- The Stripe renewal branch treats an invoice event as a checkout session and
  does not handle cancellation or deletion.
- Content deletion cascades into learner history, and deleting an active course
  can delete the learner's global progress row.
- There is no attempt history, content versioning, mastery, FSRS state, streak,
  readiness, or provider-neutral entitlement model.

These are recorded rather than silently corrected in Stage 0 because their
replacement depends on the Stage 1 identity and service boundaries and the
Stage 2 content contract.
