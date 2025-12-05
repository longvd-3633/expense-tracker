# Tasks: Fix Supabase exports error

## Setup

- [X] **T001** – Run `.specify/scripts/bash/check-prerequisites.sh --json --require-tasks --include-tasks` to confirm SDD readiness
- [X] **T002** – Review generated Supabase module entries (`nuxt.config.ts`, plugins) after `nuxi module add supabase`

## Tests

- [X] **T010** – Capture failing scenario (open `/register` and record console error)

## Core

- [X] **T020** – Inspect Supabase-related imports/composables for CommonJS usage
- [X] **T021** – Adjust Nuxt configuration or module versions to ensure ESM-safe bundling
- [ ] **T022** *(P)* – Update or add fallback plugin (e.g., client-only initialization) if required

## Integration

- [ ] **T030** – Verify registration and login flows succeed without console errors

## Polish

- [ ] **T040** – Update documentation (spec.md, plan.md, README if needed) with resolution
- [ ] **T041** – Clean up temporary config changes and ensure lint/test pass

Tasks flow sequentially per phase unless marked *(P)* for optional parallel execution. Testing precedes core fixes so the failure is reproduced before attempting remediation.
