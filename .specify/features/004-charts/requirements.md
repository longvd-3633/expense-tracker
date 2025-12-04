# Feature 004: Charts

## Overview
Data visualization with charts for income vs expense trends and category breakdown.

## Functional Requirements

### Income vs Expense Chart
- Line/bar chart showing income and expense over time
- X-axis: time periods (days/weeks/months)
- Y-axis: amounts in VND
- Color coding: green for income, red for expense

### Category Breakdown Chart
- Doughnut chart showing expense distribution by categories
- Use category colors from database
- Center shows total expense amount
- Click to filter transactions

### Responsive Design
- Mobile: single column layout
- Desktop: side-by-side charts
- Touch support for interactions

### Real-time Updates
- Charts update automatically on data changes
- Smooth animations for transitions

## Non-Functional Requirements

### Performance
- Chart rendering < 500ms
- Interaction latency < 100ms

### Error Handling
- Empty state when no data available
- Loading states during data fetch

## Technical Implementation

### Components
- `DashboardChart.vue`: Income/expense chart
- `CategoryChart.vue`: Category breakdown chart

### Libraries
- Chart.js with vue-chartjs

### Data
- Aggregated from transactions store

## Testing Requirements
- Chart data accuracy
- Responsive behavior
- Real-time updates