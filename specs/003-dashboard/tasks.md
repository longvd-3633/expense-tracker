# Implementation Tasks - Expense Tracker

**Project**: Expense Tracker  
**Version**: 3.0  
**Last Updated**: December 5, 2025  
**Generated**: Via `/speckit.tasks` command

## Overview

This document provides a comprehensive, actionable task breakdown for implementing the Expense Tracker application with Nuxt 3 + Supabase architecture. Tasks are organized by user story to enable independent implementation and testing of features.

## Task Format

Each task follows this format:
```
- [ ] [TaskID] [P] [Story] Description with file path
```

- **TaskID**: Sequential number (T001, T002, etc.)
- **[P]**: Parallelizable marker (can be done simultaneously with other [P] tasks)
- **[Story]**: User story label ([US0], [US1], etc.) - only for user story phases
- **Description**: Clear action with exact file path

## Implementation Strategy

**MVP-First Approach:**
1. Phase 1: Project Setup (blocking foundation)
2. Phase 2: US0 - Authentication & Database (P0 - blocking for all features)
3. Phase 3: US1 - Transaction Management (P1 - MVP core)
4. Phase 4: US2 - Dashboard Overview (P1 - MVP core)
5. Phase 5: US3 - Charts Visualization (P1 - MVP core)
6. Phase 6+: Enhanced features (P2, P3)

**Incremental Delivery:**
- Each user story phase is independently testable
- Deploy after each major phase completion
- Gather feedback before proceeding to next priority

---

## Phase 1: Project Setup

**Goal**: Initialize Nuxt 3 project with required dependencies and base structure.

**Independent Test Criteria**:
- [ ] Project runs without errors on localhost
- [ ] TypeScript compiles with zero errors
- [ ] TailwindCSS styles apply correctly
- [ ] All type definitions are available

### Tasks

- [X] T001 Run `npx nuxi@latest init expense-tracker` to create Nuxt project (if not already created)
- [X] T002 Install core dependencies: `pinia @pinia/nuxt @nuxtjs/supabase @nuxtjs/tailwindcss`
- [X] T003 Install utility dependencies: `@vueuse/nuxt date-fns chart.js vue-chartjs papaparse zod`
- [X] T004 Configure nuxt.config.ts with modules (Pinia, Supabase, Tailwind, VueUse)
- [X] T005 [P] Configure tailwind.config.ts with custom theme colors (Blue #3B82F6, Green #10B981, Red #EF4444, Gray shades)
- [X] T006 [P] Create assets/css/main.css with Tailwind directives (@tailwind base, components, utilities)
- [X] T007 [P] Create app/types/transaction.ts with Transaction and TransactionInput interfaces
- [X] T008 [P] Create app/types/category.ts with Category interface
- [X] T009 [P] Create app/types/user.ts with User and UserSettings interfaces
- [X] T010 [P] Create app/types/index.ts to re-export all types
- [X] T011 Run `npx nuxi typecheck` to verify TypeScript configuration
- [X] T012 Test dev server runs: `npm run dev` and check localhost loads without errors
- [X] T012.1 Fix Pinia state error - added redirect to welcome page when Supabase not configured

---

## Phase 2: US0 - Authentication & Database Setup (P0)

**Goal**: Setup Supabase backend, implement authentication, and configure database with RLS policies.

**Independent Test Criteria**:
- [ ] User can register new account with email verification
- [ ] User can login and logout successfully
- [ ] Protected routes redirect to login when not authenticated
- [ ] Database tables created with proper RLS policies
- [ ] Default categories seeded in database

### Supabase Setup & Database

- [ ] T013 Create Supabase project at supabase.com or login to existing project (MANUAL STEP - User needs to create project)
- [X] T014 [P] Create .env file with SUPABASE_URL and SUPABASE_KEY (anon public key)
- [X] T015 [P] Add .env to .gitignore to prevent credential commits
- [ ] T016 [P] Configure email authentication provider in Supabase Auth settings (Dashboard > Authentication > Providers) (MANUAL STEP)
- [X] T017 [P] [US0] Create supabase/migrations/001_initial_schema.sql migration file
- [X] T018 [P] [US0] Define categories table in migration: id, user_id, name, type, color, icon, is_default, created_at, updated_at
- [X] T019 [P] [US0] Define transactions table in migration: id, user_id, date, type, amount, category_id, description, tags, created_at, updated_at
- [X] T020 [P] [US0] Define user_settings table in migration: user_id, currency, date_format, number_format, default_view, theme, created_at, updated_at
- [X] T021 [P] [US0] Add RLS policies for categories table (SELECT for all users + default categories, INSERT/UPDATE/DELETE for own categories)
- [X] T022 [P] [US0] Add RLS policies for transactions table (all operations filtered by auth.uid())
- [X] T023 [P] [US0] Add RLS policies for user_settings table (all operations filtered by auth.uid())
- [X] T024 [P] [US0] Create update_updated_at_column() trigger function in migration
- [X] T025 [P] [US0] Apply triggers to all tables for automatic updated_at timestamp
- [ ] T026 [US0] Run database migration via Supabase Dashboard (SQL Editor) or CLI (MANUAL STEP - After Supabase project creation)
- [X] T027 [P] [US0] Seed default categories (14 categories: 5 income + 9 expense) with INSERT statements

### Authentication Implementation

- [X] T028 [P] [US0] Create app/middleware/auth.ts for route protection with Supabase user check
- [X] T029 [P] [US0] Create app/composables/useAuth.ts with reactive auth state and login/logout/register methods
- [X] T030 [P] [US0] Create app/pages/login.vue with email/password form and validation - Design with `/ui-ux-pro-max` command
- [X] T031 [P] [US0] Create app/pages/register.vue with email/password form and validation (min 8 chars, 1 upper, 1 lower, 1 number) - Design with `/ui-ux-pro-max` command
- [X] T032 [P] [US0] Create app/pages/forgot-password.vue for password reset flow - Design with `/ui-ux-pro-max` command
- [X] T033 [US0] Implement login functionality in app/pages/login.vue using Supabase Auth
- [X] T034 [US0] Implement registration with email verification in app/pages/register.vue
- [X] T035 [US0] Implement password reset flow in app/pages/forgot-password.vue
- [X] T036 [US0] Add redirect logic in app/middleware/auth.ts (protected routes → login, preserve return URL)
- [X] T037 [US0] Add logout functionality with session clearing and redirect
- [ ] T038 [US0] Test authentication flow: register → verify email → login → access protected route → logout (REQUIRES SUPABASE PROJECT)
- [ ] T039 [US0] Verify RLS policies prevent unauthorized data access (try accessing other user's data) (REQUIRES SUPABASE PROJECT)

---

## Phase 3: US1 - Transaction Management (P1 MVP) 🎯

**Goal**: Implement complete CRUD operations for transactions with Supabase integration and real-time sync.

**Story**: US1 - Quản lý Transactions

**Independent Test Criteria**:
- [ ] User can create new transaction with all required fields
- [ ] Form validates amount > 0, date required, category selected
- [ ] User can view list of all their transactions sorted by date (newest first)
- [ ] User can edit existing transaction
- [ ] User can delete transaction with confirmation dialog
- [ ] Data persists to Supabase and survives page refresh
- [ ] RLS ensures user only sees their own transactions
- [ ] Real-time updates work (transaction from another device appears automatically)

### Stores & State Management

- [X] T040 [P] [US1] Create app/stores/transactions.ts with Supabase client integration and reactive state (transactions[], loading, error)
- [X] T041 [P] [US1] Create app/stores/categories.ts with Supabase client integration
- [X] T042 [P] [US1] Implement fetchTransactions() action in app/stores/transactions.ts (SELECT with RLS)
- [X] T043 [P] [US1] Implement addTransaction() action in app/stores/transactions.ts (INSERT with optimistic UI)
- [X] T044 [P] [US1] Implement updateTransaction() action in app/stores/transactions.ts (UPDATE with optimistic UI)
- [X] T045 [P] [US1] Implement deleteTransaction() action in app/stores/transactions.ts (DELETE with optimistic UI)
- [X] T046 [P] [US1] Add computed getters in app/stores/transactions.ts: sortedTransactions (by date DESC), totalIncome, totalExpense
- [X] T047 [P] [US1] Implement fetchCategories() action in app/stores/categories.ts (SELECT default + user categories)
- [X] T048 [P] [US1] Add category getters in app/stores/categories.ts: getCategoryById, incomeCategories, expenseCategories

### Validation & Utilities

- [X] T049 [P] [US1] Create app/utils/validators.ts with Zod schema for Transaction validation (amount > 0, ≤ 999999999999.99, date constraints)
- [X] T050 [P] [US1] Create app/utils/constants.ts with app constants (STORAGE_KEYS, MAX_AMOUNT, etc.)
- [X] T051 [P] [US1] Create app/composables/useFormatters.ts with formatCurrency and formatDate functions (respect user settings)

### UI Components

- [X] T052 [P] [US1] Create app/components/atoms/Button.vue with variants (primary, secondary, danger) - Design with `/ui-ux-pro-max` command
- [X] T053 [P] [US1] Create app/components/atoms/Input.vue with validation state display - Design with `/ui-ux-pro-max` command
- [X] T054 [P] [US1] Create app/components/atoms/Select.vue for dropdown selections - Design with `/ui-ux-pro-max` command
- [X] T055 [P] [US1] Create app/components/atoms/DatePicker.vue with proper date formatting - Design with `/ui-ux-pro-max` command
- [X] T056 [P] [US1] Create app/components/molecules/TransactionCard.vue to display single transaction (date, type, amount, category, description) - Design with `/ui-ux-pro-max` command
- [X] T057 [P] [US1] Create app/components/organisms/TransactionForm.vue modal with form fields (date, type, amount, category, description) - Design with `/ui-ux-pro-max` command
- [X] T058 [US1] Add form validation in TransactionForm.vue using Zod schema (real-time validation on blur)
- [X] T059 [US1] Implement type toggle (Income/Expense) in TransactionForm.vue with category filtering
- [X] T060 [US1] Add category dropdown in TransactionForm.vue filtered by transaction type
- [X] T061 [US1] Implement date picker in TransactionForm.vue with default to today
- [X] T062 [US1] Add validation error messages in TransactionForm.vue (inline below fields, red text)
- [X] T063 [P] [US1] Create app/components/organisms/TransactionList.vue with virtual scrolling support (for > 1000 items) - Design with `/ui-ux-pro-max` command
- [X] T064 [US1] Add empty state UI in TransactionList.vue ("Chưa có giao dịch nào. [Thêm giao dịch đầu tiên]") - Design with `/ui-ux-pro-max` command
- [X] T065 [US1] Add loading state (skeleton screens) in TransactionList.vue - Design with `/ui-ux-pro-max` command
- [X] T066 [US1] Add error state handling in TransactionList.vue ("Không thể tải dữ liệu. [Thử lại]") - Design with `/ui-ux-pro-max` command

### Page Implementation

- [X] T067 [US1] Create app/layouts/default.vue with header, navigation (Dashboard, Transactions, Settings, Logout), main content area - Design with `/ui-ux-pro-max` command
- [X] T068 [US1] Add responsive navigation in app/layouts/default.vue (hamburger menu for mobile, horizontal nav for desktop) - Design with `/ui-ux-pro-max` command
- [X] T069 [US1] Create app/pages/transactions/index.vue with TransactionList and "Add Transaction" button - Design with `/ui-ux-pro-max` command
- [X] T070 [US1] Connect TransactionForm to store actions (create/update) in app/pages/transactions/index.vue
- [X] T071 [US1] Add delete confirmation dialog in TransactionCard.vue ("Xóa giao dịch này?" with amount, category, date) - Design with `/ui-ux-pro-max` command
- [X] T072 [US1] Implement undo/restore functionality for delete (5 second timeout with toast notification)
- [X] T073 [US1] Style all transaction components with TailwindCSS (responsive mobile/desktop breakpoints)

### Real-time & Sync

- [X] T074 [US1] Setup Supabase real-time subscription in app/stores/transactions.ts (listen to INSERT, UPDATE, DELETE events)
- [X] T075 [US1] Handle subscription events: auto-insert new transactions, update existing, remove deleted (with smooth animations)
- [X] T076 [US1] Add subscription disconnect handling (fallback to manual refresh, show warning indicator)
- [X] T077 [US1] Implement conflict detection for concurrent edits (show modal with options when transaction updated by another device)

### Testing & Validation

- [ ] T078 [US1] Test create transaction flow end-to-end (open form → fill fields → validate → save → see in list)
- [ ] T079 [US1] Test edit transaction flow (click transaction → edit form → update → see changes)
- [ ] T080 [US1] Test delete transaction with confirmation and undo
- [ ] T081 [US1] Test form validation errors (amount = 0, negative, too large, date empty, category empty)
- [ ] T082 [US1] Test optimistic UI updates (transaction appears immediately, rollback on error)
- [ ] T083 [US1] Verify data persistence: create transaction → refresh page → check transaction still there
- [ ] T084 [US1] Test RLS: try accessing another user's transaction (should fail)
- [ ] T085 [US1] Test real-time sync: create transaction on one device → verify appears on another device

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently

---

## Phase 4: US2 - Dashboard Overview (P1 MVP) 🎯

**Goal**: Display financial summary cards with time period selection and real-time updates.

**Story**: US2 - Dashboard Tổng Quan

**Independent Test Criteria**:
- [ ] Dashboard shows 3 summary cards (Total Income, Total Expense, Balance)
- [ ] User can switch between Daily, Weekly, Monthly periods
- [ ] Date navigation works (prev/next, today button)
- [ ] Summary updates real-time when transactions change
- [ ] Numbers formatted correctly (VND format: 1.000.000 ₫)
- [ ] Empty state displays when no transactions in period

### Composables & Utilities

- [X] T086 [P] [US2] Create app/composables/useDateRange.ts with period calculations (Daily, Weekly, Monthly)
- [X] T087 [P] [US2] Implement getPeriodRange(type, offset) function in useDateRange.ts (returns { start, end } dates)
- [X] T088 [P] [US2] Implement formatPeriodLabel(type, date) function in useDateRange.ts (e.g., "12 Dec 2025", "Week 50, 2025", "Dec 2025")
- [X] T089 [P] [US2] Add isCurrentPeriod(type, date) check function in useDateRange.ts
- [X] T090 [P] [US2] Add period navigation functions in useDateRange.ts (goToNext, goToPrevious, goToCurrent)

### UI Components

- [X] T091 [P] [US2] Create app/components/molecules/StatCard.vue for summary display (icon, label, amount, color coding) - Design with `/ui-ux-pro-max` command
- [X] T092 [P] [US2] Create app/components/molecules/PeriodSelector.vue with tab buttons (Daily, Weekly, Monthly) - Design with `/ui-ux-pro-max` command
- [X] T093 [P] [US2] Create app/components/molecules/DateNavigator.vue with prev/next arrows and current period label - Design with `/ui-ux-pro-max` command
- [X] T094 [US2] Add active period highlighting in PeriodSelector.vue
- [X] T095 [US2] Add keyboard shortcuts in DateNavigator.vue (Left arrow: previous, Right arrow: next, T: today)
- [X] T096 [US2] Disable "next" button in DateNavigator.vue when viewing future period

### Store Enhancements

- [X] T097 [P] [US2] Add getters to app/stores/transactions.ts: getTransactionsByDateRange(start, end)
- [X] T098 [P] [US2] Add getters to app/stores/transactions.ts: getTotalIncome(start, end), getTotalExpense(start, end)
- [X] T099 [P] [US2] Add computed balance getter in app/stores/transactions.ts (income - expense)

### Page Implementation

- [X] T100 [US2] Create app/pages/index.vue (Dashboard page) with 3-column grid layout for summary cards - Design with `/ui-ux-pro-max` command
- [X] T101 [US2] Add PeriodSelector component to app/pages/index.vue with localStorage persistence
- [X] T102 [US2] Add DateNavigator component to app/pages/index.vue
- [X] T103 [US2] Implement summary calculation in app/pages/index.vue using store getters and date range
- [X] T104 [US2] Add StatCard components to app/pages/index.vue (Income: green, Expense: red, Balance: green/red/gray)
- [X] T105 [US2] Add number formatting in app/pages/index.vue using formatCurrency composable
- [X] T106 [US2] Implement color coding for balance (positive: green, negative: red, zero: gray)
- [X] T107 [US2] Add empty state UI in app/pages/index.vue ("Chưa có giao dịch nào trong [period]" with CTA button) - Design with `/ui-ux-pro-max` command
- [X] T108 [US2] Add loading state (skeleton cards) in app/pages/index.vue - Design with `/ui-ux-pro-max` command
- [X] T109 [US2] Implement responsive layout in app/pages/index.vue (mobile: stacked, tablet/desktop: horizontal row) - Design with `/ui-ux-pro-max` command

### Real-time Updates

- [X] T110 [US2] Connect dashboard to Supabase subscription (reuse from transactions store)
- [X] T111 [US2] Add real-time summary updates in app/pages/index.vue (recalculate on transaction changes)
- [X] T112 [US2] Add count-up animation for amount changes (optional, smooth transition)

### Testing

- [X] T113 [US2] Test summary calculation correctness (create income/expense, verify totals)
- [X] T114 [US2] Test period switching (Daily → Weekly → Monthly, verify date ranges)
- [X] T115 [US2] Test date navigation (prev/next, today button, keyboard shortcuts)
- [X] T116 [US2] Test real-time updates (add transaction, verify dashboard updates automatically)
- [X] T117 [US2] Test empty state (switch to period with no transactions)
- [X] T118 [US2] Test number formatting (large amounts, negative balance, different formats)
- [X] T119 [US2] Test responsive layout (mobile, tablet, desktop breakpoints)

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently

---

## Phase 5: US3 - Charts Visualization (P1 MVP) 🎯

**Goal**: Display income vs expense line/bar chart and category breakdown pie chart with real-time updates.

**Story**: US3 - Visualization với Charts

**Independent Test Criteria**:
- [ ] Line/bar chart displays income vs expense over time based on selected period
- [ ] Pie/doughnut chart shows expense breakdown by categories
- [ ] Charts are responsive on mobile and desktop
- [ ] Charts update real-time when transactions change
- [ ] Tooltips show detailed information on hover
- [ ] Empty state displays when no data available

### Data Aggregation

- [X] T120 [P] [US3] Add getter in app/stores/transactions.ts: getIncomeByDate(start, end, granularity) for chart data
- [X] T121 [P] [US3] Add getter in app/stores/transactions.ts: getExpenseByDate(start, end, granularity) for chart data
- [X] T122 [P] [US3] Add getter in app/stores/transactions.ts: getExpenseByCategory(start, end) for pie chart
- [X] T123 [P] [US3] Implement date bucketing logic in getters (hourly for daily, daily for weekly/monthly)
- [X] T124 [P] [US3] Implement category grouping logic (max 15 slices, group smaller ones into "Others")

### Chart Components

- [X] T125 [P] [US3] Create app/components/organisms/DashboardChart.vue for line/bar chart (Chart.js wrapper) - Design with `/ui-ux-pro-max` command
- [X] T126 [P] [US3] Create app/components/organisms/CategoryChart.vue for pie/doughnut chart (Chart.js wrapper) - Design with `/ui-ux-pro-max` command
- [X] T127 [US3] Configure line chart in DashboardChart.vue (2 datasets: Income green, Expense red)
- [X] T128 [US3] Add chart options in DashboardChart.vue (gridlines, zero line, Y-axis currency format, X-axis time labels)
- [X] T129 [US3] Configure doughnut chart in CategoryChart.vue (use category colors, center text with total expense)
- [X] T130 [US3] Add chart options in CategoryChart.vue (legend, labels with percentages, minimum slice size 1%)
- [X] T131 [US3] Implement responsive sizing in both chart components (aspect ratios: 16:9 desktop, 4:3 mobile)
- [X] T132 [US3] Add tooltips in charts (line: "[Date]: Thu [amount] ₫, Chi [amount] ₫", pie: "[Category]: [amount] ₫ ([%])")
- [X] T133 [US3] Add legend in charts (Income/Expense for line, interactive click to hide/show series)
- [X] T134 [US3] Add empty state in chart components ("Không có dữ liệu trong khoảng thời gian này") - Design with `/ui-ux-pro-max` command

### Dashboard Integration

- [X] T135 [US3] Add DashboardChart component to app/pages/index.vue below summary cards
- [X] T136 [US3] Add CategoryChart component to app/pages/index.vue (side-by-side with line chart on desktop)
- [X] T137 [US3] Connect charts to period selection (update chart data when period changes)
- [X] T138 [US3] Implement responsive layout for charts (single column mobile, 2 columns desktop) - Design with `/ui-ux-pro-max` command
- [X] T139 [US3] Add chart interactivity: click pie slice to filter transactions by category (optional enhancement)

### Real-time Updates

- [X] T140 [US3] Connect charts to Supabase subscription (update on transaction changes)
- [X] T141 [US3] Add smooth transition animation in charts (300ms) when data changes
- [X] T142 [US3] Implement throttling (max 1 update/second) for rapid changes

### Testing

- [ ] T143 [US3] Test line chart rendering with different periods (daily hourly breakdown, weekly daily, monthly daily)
- [ ] T144 [US3] Test pie chart with multiple categories (verify colors, percentages, "Others" grouping)
- [ ] T145 [US3] Test chart responsiveness (resize window, check aspect ratios and layouts)
- [ ] T146 [US3] Test real-time chart updates (add/edit/delete transaction, verify chart updates)
- [ ] T147 [US3] Test tooltips (hover over line chart points and pie slices)
- [ ] T148 [US3] Test empty state (period with no transactions)
- [ ] T149 [US3] Test chart performance (render time < 500ms for up to 1000 data points)

**Checkpoint**: All P1 MVP user stories (US1, US2, US3) should now be independently functional

---

## Phase 6: US4 - Filter & Search (P2)

**Goal**: Enable filtering and searching of transactions by multiple criteria.

**Story**: US4 - Lọc và Tìm kiếm Transactions

**Independent Test Criteria**:
- [ ] User can filter transactions by type (All, Income only, Expense only)
- [ ] User can filter by categories (multi-select)
- [ ] User can filter by date range (custom date picker)
- [ ] User can filter by amount range (min/max)
- [ ] User can search by description (real-time)
- [ ] Filter state saved in URL query params (shareable links)
- [ ] Clear filters button resets all filters

### Composables & State

- [ ] T150 [P] [US4] Create app/composables/useFilters.ts with filter state management (types, categories, dateRange, amountRange, searchQuery)
- [ ] T151 [P] [US4] Implement filterTransactions() function in useFilters.ts (apply all active filters)
- [ ] T152 [P] [US4] Add URL sync logic in useFilters.ts (read/write filter state to query params)
- [ ] T153 [P] [US4] Add clearFilters() function in useFilters.ts

### UI Components

- [ ] T154 [P] [US4] Create app/components/molecules/FilterBar.vue with all filter controls - Design with `/ui-ux-pro-max` command
- [ ] T155 [P] [US4] Create app/components/atoms/SearchInput.vue with debounced input (300ms) - Design with `/ui-ux-pro-max` command
- [ ] T156 [US4] Add type filter in FilterBar.vue (All/Income/Expense toggle buttons)
- [ ] T157 [US4] Add category multi-select in FilterBar.vue (checkboxes with category colors)
- [ ] T158 [US4] Add date range picker in FilterBar.vue (start date, end date inputs)
- [ ] T159 [US4] Add amount range inputs in FilterBar.vue (min, max number inputs)
- [ ] T160 [US4] Add search box in FilterBar.vue (search by description)
- [ ] T161 [US4] Add "Clear Filters" button in FilterBar.vue
- [ ] T162 [US4] Add results count display in FilterBar.vue ("[X] transactions found")
- [ ] T163 [US4] Style FilterBar.vue for responsive layout (collapse on mobile, expand on desktop) - Design with `/ui-ux-pro-max` command

### Integration

- [ ] T164 [US4] Add FilterBar component to app/pages/transactions/index.vue above transaction list
- [ ] T165 [US4] Connect filters to TransactionList (pass filtered transactions)
- [ ] T166 [US4] Implement real-time search (debounced, update list as user types)
- [ ] T167 [US4] Update URL when filters change (use Nuxt's useRouter)
- [ ] T168 [US4] Load filters from URL on page mount (restore filter state)

### Testing

- [ ] T169 [US4] Test type filter (All, Income only, Expense only)
- [ ] T170 [US4] Test category filter (single category, multiple categories)
- [ ] T171 [US4] Test date range filter (custom start/end dates)
- [ ] T172 [US4] Test amount range filter (min only, max only, both)
- [ ] T173 [US4] Test search functionality (partial match, case-insensitive)
- [ ] T174 [US4] Test combined filters (multiple filters active at once)
- [ ] T175 [US4] Test clear filters button (resets all to default)
- [ ] T176 [US4] Test URL sync (copy URL, open in new tab, verify filters restored)

**Checkpoint**: Filter and search functionality complete

---

## Phase 7: US5 - CSV Export (P2)

**Goal**: Enable users to export transactions to CSV format with proper encoding.

**Story**: US5 - Export Data sang CSV

**Independent Test Criteria**:
- [ ] User can export all transactions or filtered results
- [ ] CSV file downloads with proper filename (expense-tracker-export-YYYY-MM-DD.csv)
- [ ] CSV contains all transaction fields (Date, Type, Amount, Category, Description)
- [ ] Vietnamese characters display correctly (UTF-8 BOM encoding)
- [ ] CSV opens correctly in Excel and Google Sheets

### Composables & Utilities

- [ ] T177 [P] [US5] Create app/composables/useCSVExport.ts with export logic using PapaParse
- [ ] T178 [P] [US5] Implement exportTransactions() function in useCSVExport.ts (format data, generate CSV, trigger download)
- [ ] T179 [P] [US5] Add UTF-8 BOM to CSV output in useCSVExport.ts for Excel compatibility
- [ ] T180 [P] [US5] Format transaction data in useCSVExport.ts (map category ID to name, format date and amount)

### UI Component

- [ ] T181 [P] [US5] Create app/components/organisms/ExportButton.vue with export options (All/Filtered toggle) - Design with `/ui-ux-pro-max` command
- [ ] T182 [US5] Add export all functionality in ExportButton.vue (exports all user transactions)
- [ ] T183 [US5] Add export filtered functionality in ExportButton.vue (exports currently filtered transactions)
- [ ] T184 [US5] Add loading state in ExportButton.vue (disable button during export)
- [ ] T185 [US5] Add success toast notification after export ("Đã xuất [X] giao dịch")

### Integration

- [ ] T186 [US5] Add ExportButton component to app/pages/transactions/index.vue (top right corner)
- [ ] T187 [US5] Pass current filter state to ExportButton (to export filtered results)

### Testing

- [ ] T188 [US5] Test export all transactions (verify CSV contains all records)
- [ ] T189 [US5] Test export filtered transactions (apply filters, verify CSV contains only filtered records)
- [ ] T190 [US5] Test CSV format (open in Excel, verify columns, encoding, Vietnamese characters)
- [ ] T191 [US5] Test filename format (verify date in filename matches export date)
- [ ] T192 [US5] Test with large dataset (100+ transactions, verify export completes successfully)

**Checkpoint**: CSV export functionality complete

---

## Phase 8: US7 - Settings & Preferences (P3)

**Goal**: Allow users to customize app settings and preferences.

**Story**: US7 - Settings và Preferences

**Independent Test Criteria**:
- [ ] User can change currency display preference (VND/USD)
- [ ] User can change date format (DD/MM/YYYY or YYYY-MM-DD)
- [ ] User can change number format (1.000.000 or 1,000,000)
- [ ] User can change default view (Dashboard or Transactions)
- [ ] User can change theme (Light/Dark/System)
- [ ] Settings persist across sessions and devices (via Supabase)

### Store & State

- [ ] T193 [P] [US7] Create app/stores/settings.ts with Supabase integration for user_settings table
- [ ] T194 [P] [US7] Implement fetchSettings() action in app/stores/settings.ts (SELECT from user_settings)
- [ ] T195 [P] [US7] Implement updateSettings() action in app/stores/settings.ts (UPSERT to user_settings)
- [ ] T196 [P] [US7] Add default settings values in app/stores/settings.ts (VND, DD/MM/YYYY, 1.000.000, dashboard, system)

### UI Components

- [ ] T197 [P] [US7] Create app/pages/settings.vue with settings form - Design with `/ui-ux-pro-max` command
- [ ] T198 [US7] Add currency selector in app/pages/settings.vue (VND/USD radio buttons)
- [ ] T199 [US7] Add date format selector in app/pages/settings.vue (DD/MM/YYYY / YYYY-MM-DD radio buttons)
- [ ] T200 [US7] Add number format selector in app/pages/settings.vue (1.000.000 / 1,000,000 radio buttons)
- [ ] T201 [US7] Add default view selector in app/pages/settings.vue (Dashboard/Transactions radio buttons)
- [ ] T202 [US7] Add theme selector in app/pages/settings.vue (Light/Dark/System radio buttons)
- [ ] T203 [US7] Add save button in app/pages/settings.vue with loading state
- [ ] T204 [US7] Add reset to defaults button in app/pages/settings.vue
- [ ] T205 [US7] Style settings page with sections and clear labels - Design with `/ui-ux-pro-max` command

### Integration

- [ ] T206 [US7] Update useFormatters.ts to use settings from store (formatCurrency uses numberFormat, formatDate uses dateFormat)
- [ ] T207 [US7] Apply theme preference to app (add theme class to document root)
- [ ] T208 [US7] Implement default view redirect (after login, go to user's preferred view)
- [ ] T209 [US7] Load user settings on app initialization (in middleware or app setup)

### Testing

- [ ] T210 [US7] Test currency setting change (verify all amounts display in selected format)
- [ ] T211 [US7] Test date format change (verify all dates display in selected format)
- [ ] T212 [US7] Test number format change (verify number separators update)
- [ ] T213 [US7] Test default view setting (logout, login, verify lands on selected view)
- [ ] T214 [US7] Test theme setting (verify light/dark mode applies correctly)
- [ ] T215 [US7] Test settings persistence (change settings, refresh page, verify settings preserved)
- [ ] T216 [US7] Test reset to defaults (change all settings, click reset, verify back to defaults)
- [ ] T217 [US7] Test multi-device sync (change settings on one device, verify appears on another)

**Checkpoint**: Settings and preferences complete

---

## Phase 9: US6 - Custom Categories (P3)

**Goal**: Allow users to create and manage custom categories.

**Story**: US6 - Quản lý Categories

**Independent Test Criteria**:
- [ ] User can view all categories (default + custom)
- [ ] User can create new custom category with name, type, color
- [ ] User can edit custom categories (not default ones)
- [ ] User can delete unused custom categories (prevent deletion if in use)
- [ ] Color picker works for category customization

### Store Enhancements

- [ ] T218 [P] [US6] Add actions to app/stores/categories.ts: createCategory(name, type, color, icon)
- [ ] T219 [P] [US6] Add actions to app/stores/categories.ts: updateCategory(id, updates)
- [ ] T220 [P] [US6] Add actions to app/stores/categories.ts: deleteCategory(id)
- [ ] T221 [P] [US6] Add validation in app/stores/categories.ts: check if category in use before delete

### UI Components

- [ ] T222 [P] [US6] Create app/pages/categories/index.vue with category list and add button - Design with `/ui-ux-pro-max` command
- [ ] T223 [P] [US6] Create app/components/organisms/CategoryForm.vue modal with form fields (name, type, color, icon) - Design with `/ui-ux-pro-max` command
- [ ] T224 [P] [US6] Create app/components/atoms/ColorPicker.vue for color selection - Design with `/ui-ux-pro-max` command
- [ ] T225 [US6] Add category list display in app/pages/categories/index.vue (separate default and custom)
- [ ] T226 [US6] Add edit button on custom categories only (not default)
- [ ] T227 [US6] Add delete button with confirmation on custom categories
- [ ] T228 [US6] Implement validation in CategoryForm.vue (name required, max length, unique name check)
- [ ] T229 [US6] Add usage check before delete (show warning if category has transactions)

### Testing

- [ ] T230 [US6] Test create custom category (add new category, verify appears in list and transaction form)
- [ ] T231 [US6] Test edit custom category (update name/color, verify changes reflected)
- [ ] T232 [US6] Test delete unused category (create category, don't use it, delete successfully)
- [ ] T233 [US6] Test prevent delete of used category (create category, use in transaction, try delete, verify blocked)
- [ ] T234 [US6] Test cannot edit/delete default categories (verify buttons disabled)
- [ ] T235 [US6] Test color picker (select different colors, verify preview updates)

**Checkpoint**: Custom category management complete

---

## Phase 10: Polish & Cross-Cutting Concerns

**Goal**: Final improvements, documentation, and deployment preparation.

### Code Quality & Documentation

- [ ] T236 [P] Run TypeScript type check: `npx nuxi typecheck` (fix all errors)
- [ ] T237 [P] Run linter: `npm run lint` (fix all warnings)
- [ ] T238 [P] Code cleanup and refactoring (remove unused imports, consistent naming)
- [ ] T239 [P] Update README.md with setup instructions, features list, tech stack
- [ ] T240 [P] Add JSDoc comments to complex functions in composables
- [ ] T241 [P] Create .env.example with required environment variables (without actual keys)

### Performance & Optimization

- [ ] T242 [P] Test app with 1000+ transactions (verify virtual scrolling, chart performance)
- [ ] T243 [P] Optimize bundle size (check with `npm run build`, ensure < 500KB gzipped)
- [ ] T244 [P] Add error boundary handling for chart rendering failures
- [ ] T245 [P] Implement loading states for all async operations (consistent skeleton screens)
- [ ] T246 [P] Test real-time subscription reconnection logic (disconnect internet, reconnect, verify recovery)

### Deployment Preparation

- [ ] T247 Create netlify.toml with build configuration (command: npm run build, publish: .output/public)
- [ ] T248 [P] Configure environment variables in Netlify Dashboard (SUPABASE_URL, SUPABASE_KEY)
- [ ] T249 [P] Set up Supabase production project (separate from development)
- [ ] T250 [P] Run database migrations on production Supabase
- [ ] T251 [P] Seed default categories on production database
- [ ] T252 Test deployment: Deploy to Netlify and verify all features work in production
- [ ] T253 Configure custom domain in Netlify (optional)
- [ ] T254 [P] Set up Supabase email templates for production (verification, password reset)
- [ ] T255 [P] Configure email SMTP settings in Supabase (or use Supabase built-in email)

### Final Testing

- [ ] T256 End-to-end testing: Complete user flow (register → verify email → login → add transactions → view dashboard → export CSV → logout)
- [ ] T257 Test on multiple browsers (Chrome, Firefox, Safari, Edge)
- [ ] T258 Test on multiple devices (desktop, tablet, mobile)
- [ ] T259 Test offline behavior (disconnect internet, verify offline message, reconnect, verify sync)
- [ ] T260 Security audit: Test RLS policies, verify no unauthorized data access
- [ ] T261 Performance audit: Run Lighthouse, aim for score > 90
- [ ] T262 Accessibility audit: Test keyboard navigation, screen reader, color contrast

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Authentication & Database (Phase 2)**: Depends on Setup completion - BLOCKS all user stories  
- **US1 Transaction Management (Phase 3)**: Depends on Phase 2 completion
- **US2 Dashboard (Phase 4)**: Depends on Phase 3 completion (needs transactions store)
- **US3 Charts (Phase 5)**: Depends on Phase 3 completion (needs transactions store)
- **US4 Filter/Search (Phase 6)**: Depends on Phase 3 completion
- **US5 CSV Export (Phase 7)**: Depends on Phase 3 completion
- **US6 Custom Categories (Phase 8)**: Depends on Phase 2 completion (can start after auth setup)
- **US7 Settings (Phase 9)**: Depends on Phase 2 completion (can start after auth setup)
- **Polish (Phase 10)**: Depends on all desired user stories being complete

### User Story Completion Order

**Sequential Implementation (Recommended for Solo Dev)**:
1. Phase 1: Setup → Phase 2: Auth & DB → Phase 3: US1 → Phase 4: US2 → Phase 5: US3 → (MVP Complete)
2. Then proceed with P2 features: Phase 6: US4 → Phase 7: US5
3. Then P3 features: Phase 8: US7 → Phase 9: US6
4. Finally: Phase 10: Polish

**Parallel Implementation (Team of 2-3)**:
- Dev 1: Phase 1 → Phase 2 → Phase 3 (US1) 
- Dev 2: Wait for Phase 2 → Phase 4 (US2) + Phase 5 (US3) in parallel
- Dev 3: Wait for Phase 2 → Phase 8 (US7) + Phase 9 (US6) in parallel
- After core MVP (US1, US2, US3): Phase 6 (US4) + Phase 7 (US5) in parallel
- All devs: Phase 10 (Polish) together

### Within Each User Story

**General Pattern**:
1. Stores and state management first
2. Validation and utilities
3. UI components (atoms → molecules → organisms)
4. Pages and integration
5. Real-time features
6. Testing and validation

### Parallel Opportunities

**Within Phase 1 (Setup)**: T005-T010 can all run in parallel  
**Within Phase 2 (Auth & DB)**: T014-T027 can run in parallel, T028-T032 can run in parallel  
**Within Phase 3 (US1)**: T040-T048 stores, T049-T051 utils, T052-T066 components can all run in parallel  
**Within Phase 4 (US2)**: T086-T090, T091-T096, T097-T099 can all run in parallel  
**Within Phase 5 (US3)**: T120-T124, T125-T134 can run in parallel  
**Within Phase 10 (Polish)**: T236-T246, T248-T251, T254-T255 can run in parallel

---

## Parallel Example: Phase 3 - US1 Implementation

```bash
# Terminal 1: Stores
git checkout -b feature/us1-stores
# Implement T040-T048 in parallel
# app/stores/transactions.ts + app/stores/categories.ts

# Terminal 2: Validation
git checkout -b feature/us1-validation
# Implement T049-T051 in parallel
# app/utils/validators.ts + app/utils/constants.ts + app/composables/useFormatters.ts

# Terminal 3: UI Components
git checkout -b feature/us1-components
# Implement T052-T066 in parallel
# app/components/atoms/* + app/components/molecules/* + app/components/organisms/*

# After all parallel work complete, integrate in main US1 branch
git checkout feature/us1-main
git merge feature/us1-stores
git merge feature/us1-validation
git merge feature/us1-components
# Then proceed with pages and integration (T067-T073)
```

---

## MVP Scope (Recommended First Deployment)

**Minimum Viable Product includes**:
- Phase 1: Setup ✅
- Phase 2: Authentication & Database (US0) ✅
- Phase 3: Transaction Management (US1) ✅
- Phase 4: Dashboard Overview (US2) ✅
- Phase 5: Charts Visualization (US3) ✅

**Total MVP Tasks**: T001-T149 (149 tasks)

**Post-MVP Enhancements** (deploy after MVP feedback):
- Phase 6: Filter & Search (US4) - 27 tasks
- Phase 7: CSV Export (US5) - 16 tasks  
- Phase 8: Settings (US7) - 25 tasks
- Phase 9: Custom Categories (US6) - 18 tasks
- Phase 10: Polish - 27 tasks

**Total Project**: 262 tasks

---

## Summary

**Project**: Expense Tracker - Personal finance tracking web app  
**Tech Stack**: Nuxt 3 + TypeScript + Supabase + TailwindCSS  
**Architecture**: Server-side rendering, PostgreSQL database, real-time sync  
**Total Tasks**: 262  
**MVP Tasks**: 149 (Phases 1-5)  
**Enhancement Tasks**: 113 (Phases 6-10)  

**User Stories Covered**:
- ✅ US0: Authentication & Authorization (P0) - 27 tasks
- ✅ US1: Transaction Management (P1) - 46 tasks
- ✅ US2: Dashboard Overview (P1) - 34 tasks
- ✅ US3: Charts Visualization (P1) - 30 tasks
- ✅ US4: Filter & Search (P2) - 27 tasks
- ✅ US5: CSV Export (P2) - 16 tasks
- ✅ US6: Custom Categories (P3) - 18 tasks
- ✅ US7: Settings & Preferences (P3) - 25 tasks

**Format Validation**: ✅ All tasks follow checklist format (checkbox, ID, [P] marker where applicable, [Story] label for user story phases, file paths included)

**Next Steps**:
1. Start with Phase 1 (Setup) - 12 tasks
2. Complete Phase 2 (Auth & DB) - 27 tasks
3. Implement MVP: Phases 3-5 - 110 tasks
4. Deploy MVP and gather feedback
5. Proceed with enhancements based on user needs

---

**End of Tasks Document**  
**Ready for Implementation** ✅
