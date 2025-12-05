# Quickstart: Fix Supabase exports error

1. **Install dependencies**
   ```bash
   npm install
   ```
2. **Set environment variables** – ensure `.env` contains valid Supabase keys (`NUXT_PUBLIC_SUPABASE_URL`, `NUXT_PUBLIC_SUPABASE_ANON_KEY`).
3. **Start development server**
   ```bash
   npm run dev
   ```
4. **Verify fix**
   - Visit `http://localhost:3000/register`
   - Open browser console and confirm no `ReferenceError: exports is not defined` errors appear
   - Perform signup/login flows to ensure Supabase calls succeed
5. **Run lint/test (optional)**
   ```bash
   npm run lint
   npm run test
   ```
