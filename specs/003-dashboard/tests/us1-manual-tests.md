# US1 Manual Tests

This document records the manual regression steps that still need to be verified for US1 now that the transaction UI and conflict detection logic are in place. Each test maps to the remaining tasks T078–T085 from `specs/003-dashboard/tasks.md`.

| Task | Description | Status | Notes |
| --- | --- | --- | --- |
| T078 | Create transaction end-to-end (open form, fill all fields, save) | ⚠️ Pending | Requires Supabase project with seeded categories. Confirm optimistic UI and toast behavior immediately after saving. |
| T079 | Edit transaction flow (open transaction row, change fields, save) | ⚠️ Pending | Ensure form is pre-filled, validation runs, and list updates with optimistic behavior. |
| T080 | Delete transaction with confirmation + undo toast | ⚠️ Pending | Validate confirmation modal messaging, delete animation, toast countdown, and undo restoring transaction. |
| T081 | Trigger validation errors (amount ≤0, missing date/category) | ⚠️ Pending | Check inline error messages produced by `validateTransaction` and shown inside `TransactionForm`. |
| T082 | Optimistic UI updates with rollback on failure | ⚠️ Pending | Simulate Supabase error (e.g., network down) and verify UI reverts plus error logging. |
| T083 | Data persistence after refresh | ⚠️ Pending | Reload page and ensure Supabase returns the same transactions, verifying subscription fallback messaging if realtime disconnected. |
| T084 | RLS enforcement | ⚠️ Pending | Run queries for another user account to confirm unauthorized operations fail. Requires Supabase admin+policy setup. |
| T085 | Real-time sync across devices | ⚠️ Pending | Open two devices/browsers, perform create/update/delete on one, confirm the other updates immediately. |

## Next steps
1. Run each scenario against the Supabase environment described in the plan (sunrise project). Capture screenshots/logs for verification.  
2. Update this document or create corresponding test reports once each test is executed.  
3. After all scenarios pass, update `specs/003-dashboard/tasks.md` to mark T078–T085 as complete.
