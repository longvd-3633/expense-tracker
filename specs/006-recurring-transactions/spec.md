# Feature Specification: Recurring Transactions (US9)

**Feature ID**: 006-recurring-transactions  
**Version**: 1.0  
**Date**: December 10, 2025  
**Status**: In Progress

## Overview

Implement recurring transactions functionality để cho phép users tạo transaction templates tự động lặp lại theo schedule (monthly, weekly, daily). Feature này giúp users không phải nhập lại các giao dịch định kỳ như lương, tiền thuê, hóa đơn điện nước, v.v.

## User Story

**As a** user  
**I want to** tạo recurring transactions  
**So that** không phải nhập lại transactions hằng tháng

## Acceptance Criteria

### AC1: Create Recurring Transaction Template
- ✅ Button "Tạo giao dịch định kỳ" trên transactions page
- ✅ Form modal với fields:
  - Template name (tên mẫu)
  - Transaction type (income/expense)
  - Amount
  - Category
  - Description
  - Recurrence pattern:
    - Frequency: Daily, Weekly, Monthly, Yearly
    - Interval: Every X days/weeks/months/years
    - Start date
    - End date (optional) hoặc Never
  - Auto-create option: Yes/No (default: Yes)
- ✅ Validation:
  - All required fields filled
  - Start date >= today
  - End date > start date (if provided)
  - Amount > 0
- ✅ Save template to database

### AC2: View Recurring Transaction Templates
- ✅ Dedicated page/tab: `/recurring` hoặc tab trong transactions page
- ✅ List all active recurring templates
- ✅ Display for each template:
  - Name
  - Type (Thu/Chi) với color
  - Amount
  - Category
  - Recurrence pattern (e.g., "Hằng tháng, ngày 1")
  - Next occurrence date
  - Status: Active/Paused
  - Actions: Edit, Delete, Pause/Resume, Skip Next
- ✅ Empty state: "Chưa có giao dịch định kỳ nào"

### AC3: Edit Recurring Template
- ✅ Edit button opens form pre-filled với current data
- ✅ Can edit all fields except start date (historical)
- ✅ Option: "Apply changes to future occurrences only" (default: checked)
- ✅ Validation same as create
- ✅ Update database

### AC4: Delete Recurring Template
- ✅ Delete confirmation modal
- ✅ Options:
  - Delete template only (keep existing transactions)
  - Delete template và all generated transactions
- ✅ Default: Delete template only
- ✅ Soft delete (mark as deleted, không xóa hẳn)

### AC5: Pause/Resume Recurring Template
- ✅ Pause button → Stop auto-generation, keep template
- ✅ Resume button → Continue auto-generation from current date
- ✅ Status indicator: Active/Paused
- ✅ Paused templates không generate new transactions

### AC6: Skip Specific Occurrence
- ✅ "Skip next" button on template
- ✅ Add skip date to skip list
- ✅ Next occurrence date updates accordingly
- ✅ Skipped occurrences logged for reference

### AC7: Auto-Generate Transactions
- ✅ Check on app load (client-side)
- ✅ Generate transactions for all active templates
- ✅ Rules:
  - Only generate if auto-create = true
  - Only generate between start date and end date
  - Skip dates in skip list
  - Skip if transaction already exists (duplicate check)
  - Generate up to current date (không generate future)
- ✅ Batch insert generated transactions
- ✅ Update template's "last generated date"

### AC8: Manual Generate Next Occurrence
- ✅ "Tạo ngay" button on template
- ✅ Generate next occurrence immediately
- ✅ Insert transaction
- ✅ Update next occurrence date
- ✅ Show success message

### AC9: Generated Transaction Metadata
- ✅ Generated transactions tagged: `recurring_transaction_id` field
- ✅ Link back to recurring template
- ✅ Can edit/delete individual generated transaction
- ✅ Editing generated transaction doesn't affect template
- ✅ Deleting template doesn't delete generated transactions (by default)

### AC10: Notifications (Optional)
- ✅ Toast notification after auto-generation: "Đã tạo X giao dịch định kỳ"
- ✅ Show count of newly generated transactions
- ✅ Link to view generated transactions

## Data Model

### RecurringTransaction Table

```typescript
interface RecurringTransaction {
  id: string                      // UUID
  userId: string                  // User ID
  name: string                    // Template name
  type: 'income' | 'expense'      // Transaction type
  amount: number                  // Amount
  category: string                // Category ID
  description: string             // Description
  
  // Recurrence pattern
  frequency: 'daily' | 'weekly' | 'monthly' | 'yearly'
  interval: number                // Every X units (default: 1)
  startDate: Date                 // Start date
  endDate: Date | null            // End date (null = never)
  
  // Status
  isActive: boolean               // Active or paused
  autoCreate: boolean             // Auto-generate transactions
  
  // Tracking
  lastGeneratedDate: Date | null  // Last generated transaction date
  nextOccurrenceDate: Date        // Next scheduled date
  skipDates: Date[]               // Dates to skip
  
  // Metadata
  createdAt: Date
  updatedAt: Date
  deletedAt: Date | null          // Soft delete
}
```

### Transaction Update

```typescript
interface Transaction {
  // ... existing fields
  recurringTransactionId?: string | null  // Link to recurring template
}
```

## Technical Requirements

### Database Schema

```sql
-- Create recurring_transactions table
create table recurring_transactions (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade not null,
  name text not null,
  type text not null check (type in ('income', 'expense')),
  amount numeric not null check (amount > 0),
  category_id uuid references categories(id) not null,
  description text,
  
  -- Recurrence pattern
  frequency text not null check (frequency in ('daily', 'weekly', 'monthly', 'yearly')),
  interval integer not null default 1 check (interval > 0),
  start_date date not null,
  end_date date,
  
  -- Status
  is_active boolean not null default true,
  auto_create boolean not null default true,
  
  -- Tracking
  last_generated_date date,
  next_occurrence_date date not null,
  skip_dates date[],
  
  -- Metadata
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now(),
  deleted_at timestamp with time zone,
  
  constraint end_date_after_start check (end_date is null or end_date > start_date)
);

-- RLS policies
alter table recurring_transactions enable row level security;

create policy "Users can view own recurring transactions"
  on recurring_transactions for select
  using (auth.uid() = user_id and deleted_at is null);

create policy "Users can create own recurring transactions"
  on recurring_transactions for insert
  with check (auth.uid() = user_id);

create policy "Users can update own recurring transactions"
  on recurring_transactions for update
  using (auth.uid() = user_id);

-- Add recurring_transaction_id to transactions table
alter table transactions
  add column recurring_transaction_id uuid references recurring_transactions(id) on delete set null;

-- Index for performance
create index recurring_transactions_user_id_idx on recurring_transactions(user_id);
create index recurring_transactions_next_occurrence_idx on recurring_transactions(next_occurrence_date);
create index transactions_recurring_id_idx on transactions(recurring_transaction_id);
```

### Components

- `app/pages/recurring.vue` - Main recurring transactions page
- `app/components/organisms/RecurringForm.vue` - Create/Edit form
- `app/components/organisms/RecurringList.vue` - List of templates
- `app/components/molecules/RecurringCard.vue` - Single template card
- `app/components/molecules/RecurrencePattern.vue` - Pattern input (frequency, interval, dates)

### Store

- `app/stores/recurring.ts` - Recurring transactions state management

### Utilities

- `app/utils/recurrence.ts` - Recurrence calculation logic
  - `calculateNextOccurrence(pattern, from)` - Calculate next date
  - `calculateOccurrencesBetween(pattern, start, end)` - Get all dates in range
  - `shouldGenerate(template, date)` - Check if should generate for date

### Auto-Generation Strategy

**Client-side approach** (simpler, no backend jobs):
1. On app load (in `app.vue` or middleware)
2. Fetch all active recurring templates
3. For each template:
   - Calculate missed occurrences (from last_generated_date to today)
   - Generate transactions for each missed date
   - Update template's last_generated_date và next_occurrence_date
4. Batch insert transactions
5. Show notification

**Pros:**
- No backend infrastructure needed
- Works with Supabase + Netlify static hosting
- Simple implementation

**Cons:**
- Only generates when user opens app
- If user doesn't open app for weeks, might generate many at once
- Requires user to be logged in

## Implementation Phases

### Phase 1: Database Setup (T300-T303)
- Create migration file
- Create recurring_transactions table
- Add RLS policies
- Add recurring_transaction_id to transactions table

### Phase 2: Data Layer (T304-T309)
- Define RecurringTransaction type
- Create recurring.ts store
- Implement CRUD actions (fetch, create, update, delete, pause, resume)
- Add skip date logic

### Phase 3: Recurrence Logic (T310-T314)
- Create recurrence.ts utility
- Implement calculateNextOccurrence
- Implement calculateOccurrencesBetween
- Implement shouldGenerate
- Add unit tests (optional)

### Phase 4: UI Components (T315-T323)
- Create RecurringForm component
- Create RecurrencePattern input
- Create RecurringCard component
- Create RecurringList component
- Create recurring page
- Add navigation link
- Style components

### Phase 5: Auto-Generation (T324-T328)
- Implement auto-generation logic
- Add check on app load
- Batch transaction creation
- Update templates after generation
- Add notification

### Phase 6: Integration & Testing (T329-T335)
- Test create recurring template
- Test edit template
- Test delete template
- Test pause/resume
- Test skip occurrence
- Test auto-generation
- Test manual generation

## Non-Functional Requirements

### Performance
- Auto-generation should complete < 2 seconds for 100 templates
- UI should remain responsive during generation
- Batch inserts for efficiency

### Data Integrity
- Prevent duplicate generation (check before insert)
- Atomic operations (transaction for batch insert)
- Soft delete for audit trail

### User Experience
- Clear feedback during auto-generation
- Loading states for async operations
- Confirmation for destructive actions
- Helpful error messages

## Success Criteria

- ✅ User can create recurring transaction templates
- ✅ Transactions auto-generate on schedule
- ✅ User can edit/delete/pause templates
- ✅ User can skip specific occurrences
- ✅ Generated transactions link to template
- ✅ No duplicate generations
- ✅ Clear UI feedback

## Out of Scope (Future Enhancements)

- Custom recurrence patterns (e.g., "Last Friday of month")
- Multiple recurrence rules per template
- Recurrence end conditions (e.g., "After 12 occurrences")
- Email/push notifications for upcoming recurring transactions
- Recurring transaction reports/analytics
- Bulk operations on templates
- Import/export recurring templates
