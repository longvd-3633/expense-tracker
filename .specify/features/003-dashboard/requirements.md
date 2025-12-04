# Feature 003: Dashboard

## Overview
Dashboard page displaying financial summary with income, expense, and balance cards, time period selection, and date navigation.

## Functional Requirements

### Summary Cards
- Display 3 cards: Total Income, Total Expense, Balance
- Responsive layout: vertical on mobile, horizontal on desktop
- VND formatting with user settings
- Color coding: green for positive, red for negative

### Time Period Selection
- Support Daily, Weekly, Monthly periods
- Default to current period
- Persist selection in localStorage

### Date Navigation
- Previous/Next buttons for period navigation
- Current period label display
- Today/This Period reset button

### Real-time Updates
- Auto-update when transactions change via Supabase subscription
- Update latency < 1s

## Non-Functional Requirements

### Performance
- Initial render < 500ms
- Period switch < 200ms

### Error Handling
- Network errors: retry with toast message
- Loading states with skeletons

## Technical Implementation

### Components
- `StatCard.vue`: Summary cards component
- `PeriodSelector.vue`: Period selection tabs
- `DateNavigator.vue`: Navigation controls

### Composables
- `useDateRange.ts`: Period calculations

### Store
- `transactions.ts`: Getters for totals with date filtering

## Testing Requirements
- Summary calculations accuracy
- Period switching functionality
- Real-time update on transaction changes