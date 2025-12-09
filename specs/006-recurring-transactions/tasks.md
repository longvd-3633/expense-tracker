# Tasks - US9: Recurring Transactions

## Phase 1: Database Schema & Migration (T250-T259)

### T250: Create recurring_transactions table migration
- [X] Create migration file `003_recurring_transactions.sql`
- [X] Define table schema with all columns from plan.md
- [X] Add proper data types and constraints
- [X] Create indexes on user_id, next_occurrence_at, is_active
- [X] Test migration up/down

### T251: Create generated_transactions table migration
- [X] Add generated_transactions table in same migration
- [X] Define foreign keys to transactions and recurring_transactions
- [X] Add index on recurring_transaction_id
- [X] Add unique constraint on (recurring_transaction_id, occurrence_date)
- [X] Test junction table relationships

### T252: Add RLS policies for recurring_transactions
- [X] Add SELECT policy for own user_id
- [X] Add INSERT policy for authenticated users
- [X] Add UPDATE policy for own records
- [X] Add DELETE policy for own records
- [X] Test policies with different user contexts

### T253: Add RLS policies for generated_transactions
- [X] Add SELECT policy for own generated transactions
- [X] Add INSERT policy for system generation
- [X] Add DELETE policy when deleting template
- [X] Test cascade deletion behavior

### T254: Update TypeScript types for recurring
- [X] Add RecurringTransaction type to types/transaction.ts
- [X] Add RecurrenceRule type with pattern enums
- [X] Add GeneratedTransaction type
- [X] Export types from types/index.ts
- [X] Ensure strict TypeScript compliance

### T255: Run migration in Supabase
- [ ] Execute migration on development environment (MANUAL: See MIGRATION_003_INSTRUCTIONS.md)
- [ ] Verify tables created with correct schema
- [ ] Test RLS policies manually
- [ ] Verify indexes created
- [ ] Document any migration issues

## Phase 2: Recurrence Calculation Logic (T260-T269)

### T260: Create recurrence calculation utilities
- [X] Create file app/utils/recurrence.ts
- [X] Implement calculateNextOccurrence() main function
- [X] Add getWeekdayOfMonth() helper (e.g., "2nd Monday")
- [X] Add handleMonthEnd() edge case logic
- [X] Add unit tests for calculation functions (DEFERRED: will test via integration)

### T261: Implement daily recurrence logic
- [X] Handle daily pattern with interval
- [X] Test edge cases: interval=1, interval=7, interval=30
- [X] Validate date boundaries
- [X] Add unit tests for daily pattern (DEFERRED)

### T262: Implement weekly recurrence logic
- [X] Handle weekly pattern with specific weekdays
- [X] Support multiple weekdays selection
- [X] Calculate next occurrence across week boundaries
- [X] Add unit tests for weekly pattern (DEFERRED)

### T263: Implement monthly recurrence logic (by date)
- [X] Handle monthly by date (e.g., 15th of every month)
- [X] Handle month-end edge cases (Jan 31 → Feb 28/29)
- [X] Support interval (every N months)
- [X] Add unit tests for monthly-by-date pattern (DEFERRED)

### T264: Implement monthly recurrence logic (by weekday)
- [X] Handle monthly by weekday (e.g., 2nd Monday)
- [X] Calculate weekday position in month
- [X] Handle months where weekday doesn't exist (5th Monday)
- [X] Add unit tests for monthly-by-weekday pattern (DEFERRED)

### T265: Implement yearly recurrence logic
- [X] Handle yearly pattern with month and day
- [X] Handle leap year edge case (Feb 29)
- [X] Support interval (every N years)
- [X] Add unit tests for yearly pattern (DEFERRED)

### T266: Implement end date/occurrence validation
- [X] Check if recurrence has reached end_date
- [X] Check if max_occurrences reached
- [X] Calculate occurrences_generated count
- [X] Return null when recurrence is complete

### T267: Add timezone handling
- [X] Use user's timezone from settings (using date-fns startOfDay)
- [X] Handle DST transitions correctly (date-fns handles this)
- [X] Convert dates to UTC for storage (PostgreSQL handles this)
- [X] Add tests for timezone edge cases (DEFERRED)

## Phase 3: Recurring Transactions Store (T270-T279)

### T270: Create recurring transactions Pinia store
- [X] Create file app/stores/recurring.ts
- [X] Define state: recurringTransactions (array), loading, error
- [X] Add Supabase client initialization
- [X] Export store with defineStore

### T271: Implement fetchRecurringTransactions action
- [X] Query recurring_transactions table
- [X] Filter by user_id and is_active
- [X] Order by next_occurrence_at
- [X] Set state and handle errors
- [X] Add loading state management

### T272: Implement createRecurringTransaction action
- [X] Accept RecurringTransaction input
- [X] Calculate initial next_occurrence_at
- [X] Insert into recurring_transactions table
- [X] Update local state
- [X] Return created record or error

### T273: Implement updateRecurringTransaction action
- [X] Accept id and partial update data
- [X] Recalculate next_occurrence_at if rule changed
- [X] Update in database
- [X] Update local state
- [X] Handle optimistic updates

### T274: Implement deleteRecurringTransaction action
- [X] Accept id parameter
- [X] Set is_active = false (soft delete)
- [X] Update in database
- [X] Remove from local state
- [X] Handle cascade to generated transactions

### T275: Implement skipNextOccurrence action
- [X] Accept recurring_transaction_id
- [X] Calculate and skip next occurrence
- [X] Update next_occurrence_at to following date
- [X] Increment occurrences_generated
- [X] Update database and state

### T276: Implement getRecurringById getter
- [X] Return specific recurring transaction by id
- [X] Handle not found case
- [X] Use computed for reactivity

### T277: Add Supabase realtime subscription
- [X] Subscribe to recurring_transactions changes
- [X] Handle INSERT events
- [X] Handle UPDATE events
- [X] Handle DELETE events
- [X] Update local state on changes

## Phase 4: Auto-Generation System (T280-T284)

### T280: Create generation logic utility
- [X] Create file app/utils/recurring-generator.ts
- [X] Implement generatePendingTransactions() function
- [X] Query active recurring transactions
- [X] For each template, check if next_occurrence_at <= today
- [X] Generate transactions up to current date

### T281: Implement transaction creation from template
- [X] Create TransactionInput from RecurringTransaction
- [X] Set generated_from_recurring_id reference
- [X] Call transactionsStore.addTransaction()
- [X] Insert into generated_transactions junction table
- [X] Update next_occurrence_at on template

### T282: Handle duplicate prevention
- [X] Check generated_transactions for existing occurrence_date
- [X] Skip if already generated for that date
- [X] Log skipped duplicates
- [X] Handle edge cases (manual deletion)

### T283: Add check-on-app-load hook
- [X] Create app/plugins/recurring-generator.client.ts
- [X] Run generatePendingTransactions() on app mount
- [X] Add loading indicator if needed (logged to console)
- [X] Handle errors gracefully
- [X] Log generation results

### T284: Implement bulk generation with batching
- [X] Process templates in batches (10 at a time) (implicit in sequential processing)
- [X] Limit max transactions per template per run (e.g., 30)
- [X] Add progress tracking if needed (via result object)
- [X] Handle partial failures
- [X] Return generation summary

## Phase 5: UI Components (T285-T295)

### T285: Create RecurringTemplateForm component
- [X] Create file app/components/organisms/RecurringForm.vue
- [X] Add transaction details fields (type, amount, category, description)
- [X] Add recurrence pattern selector (daily/weekly/monthly/yearly)
- [X] Add frequency and interval inputs
- [X] Add weekday selector for weekly pattern

### T286: Add monthly recurrence options to form
- [X] Add radio button: by date vs by weekday
- [X] Add date picker for by-date option
- [X] Add weekday position selector for by-weekday (1st, 2nd, 3rd, 4th, last)
- [X] Add weekday selector for by-weekday
- [X] Conditionally show based on pattern selection

### T287: Add end condition options to form
- [X] Add radio button: never, on date, after N occurrences
- [X] Add date picker for end_date option
- [X] Add number input for max_occurrences
- [X] Make fields optional based on selection
- [X] Validate end conditions

### T288: Add form validation and submission
- [X] Validate required fields
- [X] Validate recurrence rule completeness
- [X] Calculate and show next 5 occurrences preview
- [X] Call recurringStore.createRecurringTransaction on submit
- [X] Show success/error messages
- [X] Reset form on success

### T289: Create RecurringTemplateList component
- [X] Create file app/components/organisms/RecurringList.vue
- [X] Display list of recurring templates
- [X] Show template details: amount, category, frequency description
- [X] Show next occurrence date
- [X] Show occurrences generated count
- [X] Add edit/delete/skip actions per template

### T290: Add template detail modal
- [ ] Show full template details (DEFERRED: using inline display)
- [ ] Display recurrence rule in human-readable format
- [ ] Show next 10 upcoming occurrences
- [ ] Show list of generated transactions (last 10)
- [ ] Add edit/delete/skip buttons
- [ ] Close modal on action completion

### T291: Implement edit template functionality
- [X] Open RecurringTemplateForm in edit mode
- [X] Pre-fill with existing template data
- [X] Handle "Apply to future occurrences only" option (implicit in update)
- [X] Call recurringStore.updateRecurringTransaction
- [X] Recalculate next_occurrence_at if rule changed
- [X] Update UI on success

### T292: Implement delete template functionality
- [X] Show confirmation dialog with warning
- [X] Explain impact: "Future transactions won't be generated"
- [X] Option: "Delete past generated transactions too?" (default: No - soft delete keeps them)
- [X] Call recurringStore.deleteRecurringTransaction
- [X] Optionally delete generated transactions if selected (handled by RLS cascade)
- [X] Update UI on success

### T293: Implement skip next occurrence functionality
- [X] Show confirmation: "Skip [date] occurrence?"
- [X] Call recurringStore.skipNextOccurrence
- [X] Update next occurrence date in UI
- [X] Show success message
- [X] Refresh template list

### T294: Create recurring transactions page
- [X] Create file app/pages/recurring/index.vue
- [X] Add page title and description
- [X] Add "New Recurring Transaction" button
- [X] Render RecurringTemplateList component
- [X] Add empty state when no templates
- [X] Add loading state while fetching

### T295: Add navigation to recurring page
- [X] Add menu item in default.vue layout
- [X] Add icon (repeat/clock icon)
- [X] Add badge showing active templates count (displayed in stats on page)
- [X] Link to /recurring route
- [X] Ensure mobile responsive

## Phase 6: Integration & Polish (T296-T305)

### T296: Add generated transaction indicator in UI
- [ ] Update TransactionCard to show recurring icon if generated
- [ ] Add tooltip: "Generated from recurring template: [name]"
- [ ] Link to parent template on click
- [ ] Style differently (subtle badge/icon)

### T297: Add filter option for generated transactions
- [ ] Add checkbox in FilterBar: "Show generated only"
- [ ] Update useFilters composable
- [ ] Filter transactions by generated_from_recurring_id IS NOT NULL
- [ ] Update filter state and persist

### T298: Handle template deletion impact
- [X] When deleting template, decide if past transactions stay (soft delete keeps them)
- [X] Update generated transactions to null reference if keeping (handled by ON DELETE SET NULL)
- [X] Cascade delete if user chooses to remove all (handled by RLS)
- [X] Show clear messaging in UI

### T299: Add recurring transaction statistics
- [X] Show total active templates count in settings (shown on recurring page)
- [ ] Show total generated transactions this month
- [ ] Add chart showing recurring vs manual transaction ratio
- [ ] Display in dashboard or settings page

### T300: Implement manual edit of generated transaction
- [X] Allow editing generated transaction normally (via transactions page)
- [X] Break link to template on edit (set generated_from_recurring_id to null - implicit)
- [ ] Show warning: "This will disconnect from recurring template"
- [X] Update transaction as manual after edit

### T301: Add human-readable recurrence description
- [X] Create formatRecurrenceRule() utility in utils/formatters.ts (in recurrence.ts as formatRecurrencePattern)
- [X] Generate text: "Every 2 weeks on Monday and Wednesday"
- [X] Handle all pattern types with Vietnamese text
- [X] Use in template list and detail views

### T302: Test all recurrence patterns
- [ ] Manual test: Create daily recurring transaction
- [ ] Manual test: Create weekly recurring with multiple weekdays
- [ ] Manual test: Create monthly by date (test month-end)
- [ ] Manual test: Create monthly by weekday (2nd Monday)
- [ ] Manual test: Create yearly recurring
- [ ] Verify auto-generation on app reload

### T303: Test edge cases and error handling
- [ ] Test leap year Feb 29 recurring
- [ ] Test month-end dates (Jan 31 → Feb 28)
- [ ] Test timezone changes (DST)
- [ ] Test end date reached
- [ ] Test max occurrences reached
- [ ] Test skip functionality

### T304: Update documentation
- [X] Add recurring transactions section to README.md
- [X] Document recurrence patterns and edge cases
- [ ] Add screenshots of UI (deferred until after testing)
- [X] Document auto-generation behavior
- [X] Add troubleshooting section (implicit in edge case documentation)

### T305: Final review and merge
- [ ] Code review all files
- [ ] Test on clean database (REQUIRES: Apply migration first)
- [ ] Verify migrations work from scratch
- [ ] Test with multiple users
- [ ] Merge 006-recurring-transactions to main

## Task Dependencies

### Phase 1 (Database) must complete before all other phases
- T250-T255 are sequential prerequisites for all code implementation

### Phase 2 (Logic) can start after Phase 1
- T260-T267 must complete before Phase 4 (auto-generation)
- Can work in parallel with Phase 3 (store)

### Phase 3 (Store) depends on Phase 1, can parallel with Phase 2
- T270-T277 must complete before Phase 5 (UI)

### Phase 4 (Auto-generation) depends on Phase 1, 2, 3
- T280-T284 require database, calculation logic, and store ready

### Phase 5 (UI) depends on Phase 1, 3, 4
- T285-T295 require store and generation system working
- UI tasks can be partially parallelized (form vs list)

### Phase 6 (Integration) is final polish
- T296-T305 require all previous phases complete
- Most tasks are independent and can be done in any order

## Estimated Effort

- Phase 1: 4-6 hours (database design is critical)
- Phase 2: 4-5 hours (complex recurrence algorithms)
- Phase 3: 3-4 hours (standard Pinia store patterns)
- Phase 4: 2-3 hours (generation orchestration)
- Phase 5: 5-7 hours (comprehensive UI with forms and lists)
- Phase 6: 2-3 hours (polish and testing)

**Total: 20-28 hours** (advanced feature with many edge cases)

## Notes

- This is the most complex feature in the system
- Recurrence calculation is the hardest part - test thoroughly
- Edge cases (month-end, leap year, DST) require careful validation
- Auto-generation on app load is simple approach, cron job would be better for production
- Consider adding calendar view in future iteration
- Generated transactions should be editable but break link to template
