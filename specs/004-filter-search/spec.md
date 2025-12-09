# US4: Filter & Search Transactions - Specification

**Version**: 1.0  
**Date**: December 9, 2025  
**Feature**: Transaction Filtering and Search

## Overview

Implement comprehensive filtering and search functionality for transactions, allowing users to quickly find specific transactions by type, category, date range, amount, and text search. All filter states persist in URL query parameters for shareability.

## User Story

**As a** user  
**I want to** lọc và tìm kiếm transactions theo nhiều tiêu chí khác nhau  
**So that** tôi có thể dễ dàng tìm thấy các giao dịch cụ thể và phân tích chi tiêu theo nhóm

## Acceptance Criteria

### Filter by Type
- ✅ User can filter by transaction type:
  - **All**: Show both income and expense
  - **Income only**: Show only income transactions
  - **Expense only**: Show only expense transactions
- ✅ Type filter displayed as toggle buttons or tabs
- ✅ Active filter visually highlighted
- ✅ Default: "All" selected

### Filter by Category
- ✅ User can filter by one or multiple categories
- ✅ Multi-select checkboxes with category colors
- ✅ Categories grouped by type (income/expense)
- ✅ "Select All" / "Deselect All" options
- ✅ Default: All categories selected

### Filter by Date Range
- ✅ User can set custom date range (start date, end date)
- ✅ Quick presets:
  - Today
  - This Week
  - This Month
  - Last 30 Days
  - Last 3 Months
  - Custom Range
- ✅ Date validation: Start date ≤ End date
- ✅ Default: Last 30 Days

### Filter by Amount Range
- ✅ User can set minimum and maximum amount
- ✅ Amount inputs:
  - Min amount (optional)
  - Max amount (optional)
- ✅ Validation: Min ≤ Max
- ✅ Format: Number with thousand separators
- ✅ Default: No amount filter

### Search by Description
- ✅ Real-time search box
- ✅ Search behavior:
  - Case-insensitive
  - Partial match
  - Debounced (300ms)
  - Search in description field
- ✅ Clear search button (X icon)
- ✅ Placeholder: "Tìm kiếm theo mô tả..."

### Filter State Management
- ✅ All filters work together (AND logic)
- ✅ Results count displayed: "[X] giao dịch tìm thấy"
- ✅ Clear all filters button
- ✅ Filter state persists in URL query parameters
- ✅ Shareable filter URLs
- ✅ Filter state restored on page load

### UI/UX Requirements
- ✅ Filter bar responsive:
  - Desktop: Expanded inline
  - Mobile: Collapsible drawer/accordion
- ✅ Loading state while filtering
- ✅ Empty state when no results:
  - "Không tìm thấy giao dịch nào"
  - "Thử điều chỉnh bộ lọc hoặc xóa bộ lọc"
- ✅ Filter badge count on mobile toggle button
- ✅ Smooth animations for filter panel

## Technical Requirements

### URL Query Parameters Schema
```
/transactions?type=expense&categories=cat1,cat2&startDate=2025-01-01&endDate=2025-12-31&minAmount=100000&maxAmount=5000000&search=coffee
```

**Query Params:**
- `type`: `all` | `income` | `expense`
- `categories`: Comma-separated category IDs
- `startDate`: ISO date string (YYYY-MM-DD)
- `endDate`: ISO date string (YYYY-MM-DD)
- `minAmount`: Number
- `maxAmount`: Number
- `search`: URL-encoded string

### Filter Logic
```typescript
interface FilterState {
  type: 'all' | 'income' | 'expense'
  categoryIds: string[]
  dateRange: {
    start: Date | null
    end: Date | null
  }
  amountRange: {
    min: number | null
    max: number | null
  }
  searchQuery: string
}

function filterTransactions(
  transactions: Transaction[],
  filters: FilterState
): Transaction[] {
  return transactions.filter(t => {
    // Type filter
    if (filters.type !== 'all' && t.type !== filters.type) return false
    
    // Category filter
    if (filters.categoryIds.length > 0 && !filters.categoryIds.includes(t.category)) {
      return false
    }
    
    // Date range filter
    if (filters.dateRange.start && t.date < filters.dateRange.start) return false
    if (filters.dateRange.end && t.date > filters.dateRange.end) return false
    
    // Amount range filter
    if (filters.amountRange.min !== null && t.amount < filters.amountRange.min) {
      return false
    }
    if (filters.amountRange.max !== null && t.amount > filters.amountRange.max) {
      return false
    }
    
    // Search query filter
    if (filters.searchQuery && !t.description.toLowerCase().includes(
      filters.searchQuery.toLowerCase()
    )) {
      return false
    }
    
    return true
  })
}
```

## Non-Functional Requirements

### Performance
- ✅ Filter operation: < 100ms for 1000 transactions
- ✅ Search debounce: 300ms
- ✅ URL update throttled: 500ms
- ✅ Smooth animations: 60fps

### Accessibility
- ✅ Keyboard navigation support
- ✅ ARIA labels for all filter controls
- ✅ Focus management
- ✅ Screen reader announcements for results count

### Browser Compatibility
- ✅ Modern browsers (Chrome, Firefox, Safari, Edge)
- ✅ URL query param encoding handles special characters
- ✅ LocalStorage fallback if URL sync fails

## Out of Scope
- ❌ Save custom filter presets
- ❌ Filter by tags
- ❌ Advanced search (regex, operators)
- ❌ Filter history/undo

## Success Metrics
- User can find specific transaction in < 10 seconds
- Filter response time < 100ms
- Zero URL sync errors
- 100% filter accuracy (no false positives/negatives)
