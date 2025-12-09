# Apply Migration 003: Recurring Transactions

## Instructions

Since Supabase local development (Docker) is not running, you need to apply this migration directly to your Supabase cloud instance.

### Steps:

1. **Open Supabase Dashboard**:
   - Go to https://supabase.com/dashboard
   - Select your `expense-tracker` project

2. **Navigate to SQL Editor**:
   - Click "SQL Editor" in the left sidebar
   - Click "New query"

3. **Copy Migration SQL**:
   - Open the file: `supabase/migrations/003_recurring_transactions.sql`
   - Copy the ENTIRE contents

4. **Execute Migration**:
   - Paste the SQL into the query editor
   - Click "Run" button
   - Wait for success confirmation

5. **Verify Tables Created**:
   - Go to "Database" → "Tables"
   - Verify these tables exist:
     - `recurring_transactions`
     - `generated_transactions`
   - Verify `transactions` table has new column: `recurring_transaction_id`

6. **Verify RLS Policies**:
   - Select `recurring_transactions` table
   - Click "Policies" tab
   - Should see 4 policies:
     - "Users can view own recurring transactions"
     - "Users can create own recurring transactions"
     - "Users can update own recurring transactions"
     - "Users can delete own recurring transactions"
   - Repeat for `generated_transactions` (should see 3 policies)

7. **Verify Indexes**:
   - Go to "Database" → "Indexes"
   - Filter by table `recurring_transactions`
   - Should see indexes on: `user_id`, `next_occurrence_date`, `is_active`
   - Filter by table `generated_transactions`
   - Should see indexes on: `recurring_transaction_id`, `transaction_id`, `occurrence_date`

## Expected Result

After successful execution, you should see:

```
Success. No rows returned
```

If you see errors, please share the error message.

## Alternative: Supabase CLI

If you prefer using CLI and can start Docker:

```bash
# Start Supabase local development
npx supabase start

# Apply migration
npx supabase db reset

# Or push to remote
npx supabase db push
```

## Rollback (if needed)

If you need to rollback this migration:

```sql
-- Drop tables in reverse order
DROP TABLE IF EXISTS generated_transactions CASCADE;
DROP TABLE IF EXISTS recurring_transactions CASCADE;

-- Remove column from transactions
ALTER TABLE transactions DROP COLUMN IF EXISTS recurring_transaction_id;
```

---

**After migration is complete, please confirm so we can proceed to Phase 2 (Recurrence Calculation Logic).**
