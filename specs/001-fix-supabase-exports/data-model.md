# Data Model Notes: Fix Supabase exports error

This feature does not introduce new persistent entities. Existing models remain:

- **auth.users** (Supabase managed) – used during login/register flows.
- **user_settings**, **categories**, **transactions** – created by previous migrations and accessed through Supabase client.

Focus is on ensuring the Supabase client loads correctly; no schema updates are required.
