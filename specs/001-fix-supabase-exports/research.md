# Research: Fix Supabase exports error

## Problem Statement

Browser console shows `ReferenceError: exports is not defined` originating from `node_modules/@supabase/supabase-js/dist/main/index.js`. This indicates CommonJS code is reaching the browser bundle despite Vite expecting pure ESM. The bug blocks all auth-related flows.

## Hypotheses

1. `@supabase/supabase-js` version bundled by `@nuxtjs/supabase` may default to CommonJS. Upgrading/downgrading could supply ESM build.
2. Nuxt 4's module auto-import might use server build in client context. Disabling SSR for the Supabase plugin may resolve.
3. Misconfiguration in `nuxt.config.ts` (e.g., stray build.customize) might force CommonJS transpilation removal.
4. Recent `nuxi module add supabase` re-generated module config; check diff for regressions.

## Facts Collected

- Nuxt 4.2.1 + Vite 7.2.6 expect ESM modules in the browser bundle.
- `@supabase/supabase-js` provides ESM bundles when importing from `@supabase/supabase-js` with modern bundlers.
- `@nuxtjs/supabase` 2.0.2 supports Nuxt 3+ and handles SSR injection automatically with composables such as `useSupabaseClient()`.
- Running `npx nuxi module add supabase` regenerates module entry in `nuxt.config.ts` and adds plugin scaffolding.
- Previous attempts to transpile/exclude the dependency did not mitigate the error.

## Experiments Planned

- Verify dependency versions in `package.json` (`@supabase/supabase-js`, `@nuxtjs/supabase`).
- Inspect generated plugin registration to ensure SSR guard (e.g., `if (process.client)`).
- Simplify Nuxt config to baseline, then incrementally add minimal changes required by module docs.
- If issue persists, test pinning `@nuxtjs/supabase@^1.0.0` (Nuxt 3 baseline) vs `^2.1.0` (if available) to observe bundle output.
- Run `npm ls @supabase/supabase-js` to confirm single version installed.
- Create minimal reproduction plugin using direct ESM import of supabase-js to isolate bundler behavior.

## References

- Nuxt Supabase module docs: https://supabase.nuxtjs.org
- Supabase JS release notes: https://github.com/supabase-community/supabase-js/releases
- Vite CommonJS interop guide: https://vitejs.dev/guide/features.html#commonjs
