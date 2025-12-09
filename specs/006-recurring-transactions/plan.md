# Implementation Plan: Recurring Transactions (US9)

**Feature ID**: 006-recurring-transactions  
**Version**: 1.0  
**Date**: December 10, 2025

## Architecture Overview

### Tech Stack
- **Framework**: Nuxt 3 + Vue 3 + TypeScript
- **Database**: Supabase PostgreSQL
- **State Management**: Pinia
- **Date Calculations**: date-fns
- **UI**: TailwindCSS

### Component Structure
```
app/
├── pages/
│   └── recurring.vue                    # Main recurring transactions page
├── components/
│   ├── organisms/
│   │   ├── RecurringForm.vue           # Create/Edit recurring template form
│   │   └── RecurringList.vue           # List of recurring templates
│   └── molecules/
│       ├── RecurringCard.vue           # Single template card
│       └── RecurrencePattern.vue       # Recurrence pattern input
├── stores/
│   └── recurring.ts                     # Recurring transactions store
├── utils/
│   └── recurrence.ts                    # Recurrence calculation logic
└── types/
    └── recurring.ts                     # TypeScript types
```

## Data Model

### RecurringTransaction Interface

```typescript
export interface RecurringTransaction {
  id: string
  userId: string
  name: string
  type: 'income' | 'expense'
  amount: number
  category: string
  description: string
  
  // Recurrence pattern
  frequency: 'daily' | 'weekly' | 'monthly' | 'yearly'
  interval: number
  startDate: Date
  endDate: Date | null
  
  // Status
  isActive: boolean
  autoCreate: boolean
  
  // Tracking
  lastGeneratedDate: Date | null
  nextOccurrenceDate: Date
  skipDates: Date[]
  
  // Metadata
  createdAt: Date
  updatedAt: Date
  deletedAt: Date | null
}

export interface RecurringTransactionInput {
  name: string
  type: 'income' | 'expense'
  amount: number
  category: string
  description: string
  frequency: 'daily' | 'weekly' | 'monthly' | 'yearly'
  interval: number
  startDate: Date
  endDate: Date | null
  autoCreate: boolean
}
```

## Database Schema

```sql
-- Migration: 003_recurring_transactions.sql

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
  skip_dates date[] default '{}',
  
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

-- Indexes
create index recurring_transactions_user_id_idx on recurring_transactions(user_id);
create index recurring_transactions_next_occurrence_idx on recurring_transactions(next_occurrence_date);
create index recurring_transactions_is_active_idx on recurring_transactions(is_active) where is_active = true;

-- Add recurring_transaction_id to transactions
alter table transactions
  add column recurring_transaction_id uuid references recurring_transactions(id) on delete set null;

create index transactions_recurring_id_idx on transactions(recurring_transaction_id);
```

## Recurrence Calculation Logic

```typescript
// app/utils/recurrence.ts

import { addDays, addWeeks, addMonths, addYears, startOfDay, isBefore, isAfter, isSameDay } from 'date-fns'
import type { RecurringTransaction } from '~/types/recurring'

/**
 * Calculate next occurrence date from a given date
 */
export const calculateNextOccurrence = (
  frequency: RecurringTransaction['frequency'],
  interval: number,
  fromDate: Date
): Date => {
  const date = startOfDay(fromDate)
  
  switch (frequency) {
    case 'daily':
      return addDays(date, interval)
    case 'weekly':
      return addWeeks(date, interval)
    case 'monthly':
      return addMonths(date, interval)
    case 'yearly':
      return addYears(date, interval)
    default:
      throw new Error(`Unknown frequency: ${frequency}`)
  }
}

/**
 * Calculate all occurrence dates between start and end
 */
export const calculateOccurrencesBetween = (
  pattern: {
    frequency: RecurringTransaction['frequency']
    interval: number
    startDate: Date
    endDate: Date | null
    skipDates: Date[]
  },
  fromDate: Date,
  toDate: Date
): Date[] => {
  const occurrences: Date[] = []
  let current = startOfDay(fromDate)
  const end = startOfDay(toDate)
  const patternEnd = pattern.endDate ? startOfDay(pattern.endDate) : null
  
  while (isBefore(current, end) || isSameDay(current, end)) {
    // Check if within pattern range
    if (isBefore(current, pattern.startDate)) {
      current = calculateNextOccurrence(pattern.frequency, pattern.interval, current)
      continue
    }
    
    if (patternEnd && isAfter(current, patternEnd)) {
      break
    }
    
    // Check if not in skip dates
    const isSkipped = pattern.skipDates.some(skipDate => 
      isSameDay(startOfDay(skipDate), current)
    )
    
    if (!isSkipped) {
      occurrences.push(new Date(current))
    }
    
    current = calculateNextOccurrence(pattern.frequency, pattern.interval, current)
  }
  
  return occurrences
}

/**
 * Check if should generate transaction for a template on a given date
 */
export const shouldGenerate = (
  template: RecurringTransaction,
  date: Date
): boolean => {
  const checkDate = startOfDay(date)
  
  // Check if template is active
  if (!template.isActive || !template.autoCreate) {
    return false
  }
  
  // Check if within date range
  if (isBefore(checkDate, startOfDay(template.startDate))) {
    return false
  }
  
  if (template.endDate && isAfter(checkDate, startOfDay(template.endDate))) {
    return false
  }
  
  // Check if in skip dates
  const isSkipped = template.skipDates.some(skipDate =>
    isSameDay(startOfDay(skipDate), checkDate)
  )
  
  if (isSkipped) {
    return false
  }
  
  // Check if already generated
  if (template.lastGeneratedDate && 
      (isAfter(startOfDay(template.lastGeneratedDate), checkDate) || 
       isSameDay(startOfDay(template.lastGeneratedDate), checkDate))) {
    return false
  }
  
  return true
}
```

## Auto-Generation Flow

### On App Load (app.vue)

```vue
<script setup lang="ts">
const recurringStore = useRecurringStore()
const transactionsStore = useTransactionsStore()
const user = useSupabaseUser()

onMounted(async () => {
  if (user.value) {
    // Fetch recurring templates
    await recurringStore.fetchRecurringTransactions()
    
    // Auto-generate missed transactions
    const result = await recurringStore.autoGenerateTransactions()
    
    // Show notification if any generated
    if (result.generated > 0) {
      // TODO: Show toast notification
      console.log(`Đã tạo ${result.generated} giao dịch định kỳ`)
    }
  }
})
</script>
```

### Auto-Generation Logic (in recurring.ts store)

```typescript
const autoGenerateTransactions = async () => {
  const today = startOfDay(new Date())
  let generated = 0
  
  for (const template of recurringTransactions.value.filter(t => t.isActive && t.autoCreate)) {
    try {
      // Calculate missed occurrences
      const fromDate = template.lastGeneratedDate 
        ? addDays(template.lastGeneratedDate, 1)
        : template.startDate
      
      const occurrences = calculateOccurrencesBetween(
        template,
        fromDate,
        today
      )
      
      // Generate transaction for each occurrence
      for (const date of occurrences) {
        // Check if transaction already exists (duplicate prevention)
        const exists = transactionsStore.transactions.some(t =>
          t.recurringTransactionId === template.id &&
          isSameDay(new Date(t.date), date)
        )
        
        if (!exists) {
          await transactionsStore.addTransaction({
            date: date.toISOString().split('T')[0] as any,
            type: template.type,
            amount: template.amount,
            category: template.category,
            description: template.description,
            tags: ['recurring'],
            recurringTransactionId: template.id
          })
          
          generated++
        }
      }
      
      // Update template's last generated date and next occurrence
      if (occurrences.length > 0) {
        const lastDate = occurrences[occurrences.length - 1]
        await updateRecurringTransaction(template.id, {
          lastGeneratedDate: lastDate,
          nextOccurrenceDate: calculateNextOccurrence(
            template.frequency,
            template.interval,
            lastDate
          )
        })
      }
    } catch (error) {
      console.error(`Error generating for template ${template.id}:`, error)
    }
  }
  
  return { generated }
}
```

## UI Components Design

### RecurringForm.vue

```vue
<template>
  <div class="recurring-form">
    <Input v-model="form.name" label="Tên mẫu" placeholder="VD: Lương hằng tháng" />
    
    <Select v-model="form.type" label="Loại" :options="typeOptions" />
    
    <Input v-model="form.amount" type="number" label="Số tiền" />
    
    <Select v-model="form.category" label="Danh mục" :options="categoryOptions" />
    
    <Input v-model="form.description" label="Mô tả" />
    
    <!-- Recurrence Pattern -->
    <RecurrencePattern 
      v-model:frequency="form.frequency"
      v-model:interval="form.interval"
      v-model:start-date="form.startDate"
      v-model:end-date="form.endDate"
    />
    
    <Checkbox v-model="form.autoCreate" label="Tự động tạo giao dịch" />
    
    <div class="actions">
      <Button @click="cancel">Hủy</Button>
      <Button variant="primary" @click="submit">Lưu</Button>
    </div>
  </div>
</template>
```

### RecurringCard.vue

```vue
<template>
  <div class="recurring-card">
    <div class="header">
      <h3>{{ template.name }}</h3>
      <Badge :type="template.type">{{ template.type === 'income' ? 'Thu' : 'Chi' }}</Badge>
    </div>
    
    <div class="details">
      <div class="amount">{{ formatCurrency(template.amount) }}</div>
      <div class="category">{{ getCategoryName(template.category) }}</div>
      <div class="pattern">{{ formatPattern(template) }}</div>
      <div class="next">Lần sau: {{ formatDate(template.nextOccurrenceDate) }}</div>
    </div>
    
    <div class="actions">
      <Button size="sm" @click="emit('edit', template)">Sửa</Button>
      <Button size="sm" @click="emit('skip', template)">Bỏ qua lần sau</Button>
      <Button size="sm" @click="emit('toggle', template)">
        {{ template.isActive ? 'Tạm dừng' : 'Tiếp tục' }}
      </Button>
      <Button size="sm" variant="danger" @click="emit('delete', template)">Xóa</Button>
    </div>
  </div>
</template>
```

## Implementation Phases

### Phase 1: Database & Types (T300-T303)
1. Create migration file
2. Create recurring.ts types file
3. Run migration
4. Verify database setup

### Phase 2: Recurrence Logic (T304-T309)
1. Create recurrence.ts utility
2. Implement calculateNextOccurrence
3. Implement calculateOccurrencesBetween
4. Implement shouldGenerate
5. Add edge case handling
6. Unit tests (optional)

### Phase 3: Store (T310-T315)
1. Create recurring.ts store
2. Implement fetch recurring transactions
3. Implement create recurring transaction
4. Implement update recurring transaction
5. Implement delete (soft delete)
6. Implement pause/resume, skip

### Phase 4: UI Components (T316-T323)
1. Create RecurrencePattern component
2. Create RecurringForm component
3. Create RecurringCard component
4. Create RecurringList component
5. Create recurring page
6. Add navigation link
7. Style all components
8. Add responsive design

### Phase 5: Auto-Generation (T324-T328)
1. Implement autoGenerateTransactions in store
2. Add auto-generation hook in app.vue
3. Add duplicate prevention
4. Add batch transaction creation
5. Add notification/feedback

### Phase 6: Integration & Testing (T329-T336)
1. Test create template flow
2. Test edit template
3. Test delete template
4. Test pause/resume
5. Test skip occurrence
6. Test auto-generation on app load
7. Test manual generation
8. End-to-end testing

## File Structure

```
specs/006-recurring-transactions/
  ├── spec.md              # Feature specification
  ├── plan.md              # This implementation plan
  └── tasks.md             # Detailed task breakdown

supabase/migrations/
  └── 003_recurring_transactions.sql   # Database migration

app/
  ├── types/
  │   └── recurring.ts                  # TypeScript types
  ├── utils/
  │   └── recurrence.ts                 # Recurrence logic
  ├── stores/
  │   └── recurring.ts                  # Pinia store
  ├── pages/
  │   └── recurring.vue                 # Main page
  └── components/
      ├── organisms/
      │   ├── RecurringForm.vue
      │   └── RecurringList.vue
      └── molecules/
          ├── RecurringCard.vue
          └── RecurrencePattern.vue
```

## Risk Mitigation

### Performance
- **Risk**: Auto-generation slow for many templates
- **Mitigation**: Batch operations, limit to 100 templates, show progress

### Data Integrity
- **Risk**: Duplicate transactions generated
- **Mitigation**: Check existing before insert, use unique constraints

### User Experience
- **Risk**: Confusing recurrence patterns
- **Mitigation**: Clear UI, examples, preview next 3 occurrences

### Edge Cases
- **Risk**: Daylight saving time, month-end dates
- **Mitigation**: Use date-fns, handle edge cases explicitly

## Success Criteria

- ✅ Can create recurring templates
- ✅ Transactions auto-generate correctly
- ✅ Can edit/delete/pause templates
- ✅ Can skip occurrences
- ✅ No duplicate generations
- ✅ Clear UI and feedback
- ✅ Performance acceptable (<2s for 50 templates)
