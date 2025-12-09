# Implementation Tasks - US4: Filter & Search

**Feature**: Transaction Filtering and Search  
**Version**: 1.0  
**Date**: December 9, 2025

## Overview

Implement comprehensive filtering and search for transactions with URL persistence. Tasks organized for incremental delivery and testing.

## Task Format

```
- [ ] [TaskID] [P] Description with file path
```

- **TaskID**: Sequential number (T150-T176 from main tasks.md)
- **[P]**: Parallelizable (can run simultaneously)
- **Description**: Clear action with exact file path

---

## Phase 1: Core Composable & State

**Goal**: Create filter state management with URL sync

### Tasks

- [X] T150 [P] Create app/composables/useFilters.ts with FilterState interface
- [X] T151 [P] Implement filterTransactions() function in useFilters.ts (apply all active filters using AND logic)
- [X] T152 [P] Add URL sync logic in useFilters.ts:
  - syncToURL() to serialize filters to query params
  - getFiltersFromURL() to deserialize on mount
  - Use Nuxt's useRoute() and useRouter()
- [X] T153 [P] Add clearFilters() function in useFilters.ts (reset to defaults)
- [X] T153.1 Add filter helper functions:
  - setTypeFilter(type)
  - toggleCategory(categoryId)
  - setDateRange(start, end, preset)
  - setAmountRange(min, max)
  - setSearchQuery(query)

**Test Criteria**:
- [ ] filterTransactions() correctly filters by all criteria
- [ ] URL query params update when filters change (throttled 500ms)
- [ ] Filters restore from URL on page load
- [ ] clearFilters() resets all filters to defaults

---

## Phase 2: UI Components

**Goal**: Create reusable filter UI components

### Search Input Component

- [X] T155 [P] Create app/components/atoms/SearchInput.vue
- [X] T155.1 Add debounced input (300ms) using useDebounceFn from VueUse
- [X] T155.2 Add search icon (left side)
- [X] T155.3 Add clear button (X icon, right side, only when value exists)
- [X] T155.4 Add props: modelValue, placeholder, debounce
- [X] T155.5 Emit update:modelValue on debounced input
- [X] T155.6 Style with Tailwind (match existing Input.vue)

### Filter Bar Component

- [X] T154 [P] Create app/components/molecules/FilterBar.vue
- [X] T156 Add type filter section:
  - Toggle buttons: All / Thu / Chi
  - Active state styling
  - Click handler calls setTypeFilter()
- [X] T157 Add category multi-select section:
  - Checkboxes for each category
  - Show category color dot
  - "Chọn tất cả" / "Bỏ chọn tất cả" buttons
  - Toggle category on click
- [X] T158 Add date range section:
  - Quick preset buttons: Hôm nay, Tuần này, Tháng này, 30 ngày, 90 ngày
  - Custom date pickers (start, end)
  - Validation: start <= end
- [X] T159 Add amount range section:
  - Min amount input (number, formatted)
  - Max amount input (number, formatted)
  - Validation: min <= max
- [X] T160 Add search section:
  - Use SearchInput component
  - Bind to filters.searchQuery
- [X] T161 Add "Xóa bộ lọc" button:
  - Calls clearFilters()
  - Disabled when no active filters
- [X] T162 Add results count display:
  - "[X] giao dịch tìm thấy"
  - Computed from filteredTransactions.length
- [X] T163 Add responsive layout:
  - Desktop: Expanded inline with all filters visible
  - Mobile: Collapsible accordion with toggle button
  - Mobile toggle shows active filter count badge

**Test Criteria**:
- [ ] SearchInput debounces input correctly (300ms)
- [ ] FilterBar displays all filter controls
- [ ] Type filter toggles work
- [ ] Category checkboxes toggle correctly
- [ ] Date presets set correct ranges
- [ ] Amount validation prevents invalid ranges
- [ ] Clear button resets all filters
- [ ] Mobile layout collapses/expands

---

## Phase 3: Integration

**Goal**: Connect filters to transactions page

### Transactions Page Integration

- [X] T164 Import useFilters composable in app/pages/transactions/index.vue
- [X] T164.1 Destructure filteredTransactions and filters from useFilters()
- [X] T165 Add FilterBar component above TransactionList
- [X] T165.1 Pass filters to FilterBar (or access via composable)
- [X] T166 Pass filteredTransactions to TransactionList instead of all transactions
- [X] T167 Verify URL updates when filters change (check browser address bar)
- [X] T168 Test page mount with query params:
  - Navigate to /transactions?type=expense
  - Verify expense filter applied on load
  - Verify filtered results displayed

**Test Criteria**:
- [ ] FilterBar appears above transaction list
- [ ] Changing filters updates transaction list in real-time
- [ ] URL query params sync with filter state
- [ ] Refreshing page preserves filter state
- [ ] Sharing URL link restores exact filter state

---

## Phase 4: Edge Cases & Polish

**Goal**: Handle edge cases and improve UX

### Edge Case Handling

- [ ] T168.1 Handle invalid URL parameters:
  - Invalid date format → Ignore, use defaults
  - Non-existent category IDs → Filter out
  - Invalid amount range (min > max) → Swap or ignore
- [ ] T168.2 Handle empty states:
  - No transactions match → Show "Không tìm thấy giao dịch"
  - Suggest "Thử điều chỉnh bộ lọc" with clear filters button
- [ ] T168.3 Add loading state:
  - Show skeleton while transactions loading
  - Disable filter controls during initial load

### Performance

- [ ] T168.4 Verify filter performance:
  - Test with 1000 transactions
  - Filter operation should complete in < 100ms
- [ ] T168.5 Verify debounce working:
  - Type in search box rapidly
  - Verify only fires after 300ms pause
- [ ] T168.6 Verify URL throttling:
  - Change multiple filters quickly
  - Verify URL updates max once per 500ms

**Test Criteria**:
- [ ] Invalid URL params don't crash app
- [ ] Empty state displays when no matches
- [ ] Filters don't lag with 1000 transactions
- [ ] Search debounce prevents excessive filtering

---

## Phase 5: Testing

**Goal**: Comprehensive manual testing of all filter combinations

### Individual Filter Tests

- [ ] T169 Test type filter:
  - Select "All" → See income + expense
  - Select "Thu" → See only income
  - Select "Chi" → See only expense
- [ ] T170 Test category filter:
  - Select single category → See only that category
  - Select multiple categories → See all selected
  - Deselect all → See all categories
- [ ] T171 Test date range filter:
  - Select "Hôm nay" → See today's transactions
  - Select "Tháng này" → See this month
  - Select custom range → See only that range
  - Invalid range (start > end) → Validation error or auto-swap
- [ ] T172 Test amount range filter:
  - Set min only → See transactions >= min
  - Set max only → See transactions <= max
  - Set both → See transactions in range
  - Invalid (min > max) → Validation error or auto-swap
- [ ] T173 Test search:
  - Type partial match → See matching transactions
  - Case insensitive → "coffee" matches "Coffee"
  - Clear search → See all transactions

### Combined Filter Tests

- [ ] T174 Test multiple filters together:
  - Type: Expense + Category: Food + This Month
  - Verify results match ALL criteria (AND logic)
  - Remove one filter → Verify results expand correctly

### State Persistence Tests

- [ ] T175 Test clear filters:
  - Apply multiple filters
  - Click "Xóa bộ lọc"
  - Verify all filters reset to defaults
  - Verify URL clears query params
- [ ] T176 Test URL sync:
  - Apply filters
  - Copy URL
  - Open in new tab (or incognito)
  - Verify filters restored exactly
  - Verify results match original

### Mobile Tests

- [ ] T176.1 Test mobile responsive:
  - Open on mobile viewport (< 768px)
  - Verify filter bar collapses
  - Tap filter toggle → Verify expands
  - Verify active filter count badge displays
  - Apply filters → Verify works same as desktop

**Test Criteria**:
- [ ] All individual filters work correctly
- [ ] Combined filters use AND logic
- [ ] Clear filters resets everything
- [ ] URL sharing works perfectly
- [ ] Mobile UX is smooth and functional

---

## Completion Checklist

- [ ] All Phase 1 tasks completed (useFilters composable)
- [ ] All Phase 2 tasks completed (UI components)
- [ ] All Phase 3 tasks completed (Integration)
- [ ] All Phase 4 tasks completed (Edge cases)
- [ ] All Phase 5 tests passed (Manual testing)
- [ ] No console errors
- [ ] TypeScript compiles with zero errors
- [ ] Code follows existing patterns
- [ ] Ready for PR and merge

---

## Notes

### Dependencies
- VueUse: `useDebounceFn` (already installed)
- date-fns: date parsing/formatting (already installed)
- Nuxt router: useRoute, useRouter (built-in)

### Performance Targets
- Filter operation: < 100ms for 1000 transactions
- Search debounce: 300ms
- URL throttle: 500ms
- UI animations: 60fps

### Accessibility
- All filter controls keyboard navigable
- ARIA labels for screen readers
- Results count announced
- Focus management

### Future Enhancements (Out of Scope)
- Save custom filter presets
- Filter by tags
- Advanced search (regex)
- Filter history/undo
