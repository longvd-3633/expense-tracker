# Expense Tracker - Specification

**Version**: 1.0  
**Date**: December 4, 2025  
**Project**: Expense Tracker Application

## Overview

Ứng dụng web theo dõi thu/chi cá nhân, giúp người dùng quản lý tài chính, phân loại giao dịch và xem báo cáo chi tiêu theo thời gian. Ứng dụng sử dụng Supabase làm backend (PostgreSQL database + Authentication), deploy lên Netlify, hỗ trợ lọc, tìm kiếm và export CSV.

## Tech Stack

### Core Framework
- **Nuxt 3** - Vue 3 framework với SSR/SSG capabilities
- **TypeScript** - Type safety và better developer experience
- **Pinia** - State management (official Vue store)

### UI & Styling
- **TailwindCSS** - Utility-first CSS framework
- **Nuxt UI** hoặc **HeadlessUI** - Component library
- **Heroicons** - Icon set

### Backend & Database
- **Supabase** - Backend as a Service (PostgreSQL + Auth + Storage)
- **@nuxtjs/supabase** - Nuxt module for Supabase integration

### Data & Utilities
- **VueUse** - Composition utilities (storage, date, etc.)
- **date-fns** - Date manipulation và formatting
- **Zod** - Schema validation
- **PapaParse** - CSV export/import
- **Chart.js** + **vue-chartjs** - Data visualization

### Development Tools
- **ESLint** + **Prettier** - Code quality
- **Vitest** - Unit testing (optional)

## Data Models

### Transaction
```typescript
interface Transaction {
  id: string;                    // UUID
  userId: string;                // User ID (from Supabase Auth)
  date: Date;                    // Transaction date
  type: 'income' | 'expense';    // Transaction type
  amount: number;                // Amount in VND
  category: string;              // Category ID
  description: string;           // Description/notes
  tags?: string[];               // Optional tags
  createdAt: Date;               // Created timestamp
  updatedAt: Date;               // Last updated timestamp
}
```

### Category
```typescript
interface Category {
  id: string;                    // UUID
  userId?: string;               // User ID (null for default categories)
  name: string;                  // Category name
  type: 'income' | 'expense' | 'both';
  color: string;                 // Hex color code
  icon?: string;                 // Icon name
  isDefault: boolean;            // System default vs user-created
}
```

### User
```typescript
interface User {
  id: string;                    // UUID from Supabase Auth
  email: string;                 // User email
  createdAt: Date;               // Account created timestamp
}
```

### Settings
```typescript
interface UserSettings {
  userId: string;                // User ID
  currency: 'VND' | 'USD';       // Preferred currency
  dateFormat: 'DD/MM/YYYY' | 'YYYY-MM-DD';
  numberFormat: '1.000.000' | '1,000,000';
  defaultView: 'dashboard' | 'transactions';
  theme: 'light' | 'dark' | 'system';
}
```

### Default Categories
**Income:**
- Salary (Lương)
- Business (Kinh doanh)
- Investment (Đầu tư)
- Gift (Quà tặng)
- Other Income (Thu nhập khác)

**Expense:**
- Food & Dining (Ăn uống)
- Transportation (Di chuyển)
- Housing (Nhà ở)
- Utilities (Tiện ích)
- Healthcare (Y tế)
- Entertainment (Giải trí)
- Shopping (Mua sắm)
- Education (Giáo dục)
- Other Expense (Chi phí khác)

## User Stories

### P0 (Authentication - Required for all features)

#### US0: User Authentication & Authorization
**As a** user  
**I want to** đăng ký và đăng nhập vào ứng dụng  
**So that** tôi có thể quản lý tài chính cá nhân và bảo mật dữ liệu của mình

**Acceptance Criteria:**

**Registration:**
- ✅ User có thể đăng ký tài khoản mới với email + password
- ✅ Email verification required (Supabase email confirmation)
- ✅ Password requirements: Minimum 8 characters, at least 1 uppercase, 1 lowercase, 1 number
- ✅ Email format validation: RFC 5322 compliant, normalized to lowercase
- ✅ Account creation errors:
  - Email already exists → "Email đã được sử dụng. Vui lòng đăng nhập hoặc sử dụng email khác."
  - Invalid email format → "Email không hợp lệ. Vui lòng kiểm tra lại."
  - Weak password → "Mật khẩu phải có ít nhất 8 ký tự, bao gồm chữ hoa, chữ thường và số."
  - Network error → "Không thể kết nối. Vui lòng kiểm tra mạng và thử lại."
- ✅ Email verification:
  - Verification link expires sau 24 giờ
  - Resend verification email: Max 3 lần/giờ (rate limiting)
  - Unverified accounts: Không thể login, tự động xóa sau 7 ngày
  - Verification success → Auto-login và redirect to dashboard

**Login:**
- ✅ User có thể đăng nhập với email + password
- ✅ Login errors:
  - Invalid credentials → "Email hoặc mật khẩu không đúng." (generic message để prevent email enumeration)
  - Email not verified → "Vui lòng xác thực email. [Gửi lại email xác thực]"
  - Account locked → "Tài khoản tạm khóa do đăng nhập sai quá nhiều. Thử lại sau 15 phút."
  - Network error → "Không thể kết nối. Vui lòng thử lại."
- ✅ Brute force protection:
  - Max 5 failed attempts trong 15 phút → Lock account 15 phút
  - Rate limiting: Max 10 login attempts/IP/phút
  - CAPTCHA sau 3 failed attempts (optional P2)
- ✅ Session management:
  - Session duration: 7 days (Remember me: 30 days)
  - JWT token auto-refresh 5 phút trước khi expire
  - Concurrent sessions: Allow multiple devices (max 5 active sessions)
  - Token expiration handling:
    - Access token expire → Silent refresh với refresh token
    - Refresh token expire → Force logout, redirect to login, preserve return URL
    - Mid-operation expire → Queue operation, refresh token, retry operation

**Logout:**
- ✅ User có thể đăng xuất
- ✅ Logout behavior:
  - Clear local session (Supabase session, Pinia store)
  - Revoke refresh token server-side
  - Redirect to login page
  - Pending API calls → Abort requests, show "Đã đăng xuất" message
  - Unsaved data → Warn "Bạn có thay đổi chưa lưu. Đăng xuất?" với [Lưu & Đăng xuất] [Hủy]
- ✅ Logout race conditions:
  - User clicks logout nhiều lần → Debounce, single logout call
  - Logout during transaction creation → Save to local draft, restore on next login

**Password Reset:**
- ✅ User có thể reset password qua email
- ✅ Reset flow:
  - Enter email → Send reset link (always show success để prevent email enumeration)
  - Reset link expires sau 1 giờ
  - Reset link one-time use (invalid after successful reset)
  - Rate limiting: Max 3 reset emails/email/giờ
- ✅ Reset page:
  - New password validation: Same requirements as registration
  - Confirm password field: Must match
  - Success → Auto-login với new password
  - Expired/invalid link → "Link đã hết hạn. [Gửi lại link reset]"

**Protected Routes:**
- ✅ Protected routes: Redirect to login nếu chưa authenticate
- ✅ Redirect behavior:
  - Store intended destination in query param: `/login?redirect=/transactions`
  - After login → Redirect to intended page hoặc dashboard
  - Deep links preserved: Query params, hash fragments
  - Already authenticated → Skip login page, direct to app

**Social Login (Optional P2):**
- ✅ Social login options: Google, GitHub
- ✅ Account linking:
  - Email conflict → "Email đã tồn tại. [Đăng nhập bằng mật khẩu] [Liên kết tài khoản]"
  - Link existing account: Require password confirmation
  - Unlink social provider: Require at least 1 login method

**Data Isolation:**
- ✅ User chỉ thấy và quản lý được data của chính mình
- ✅ Row Level Security (RLS) enforcement:
  - All queries filtered by `auth.uid()`
  - Bypass attempts logged và blocked
  - 403 Forbidden → "Bạn không có quyền truy cập." + redirect to dashboard

**Security Requirements:**
- ✅ Password hashing: bcrypt via Supabase (automatic)
- ✅ Password storage: Never log hoặc expose passwords
- ✅ Session security: HttpOnly cookies, Secure flag, SameSite=Lax
- ✅ CSRF protection: Supabase handles via JWT
- ✅ XSS prevention:
  - Sanitize all user inputs (email, password hints)
  - Content-Security-Policy headers
  - No eval(), innerHTML với user data
- ✅ SQL Injection prevention: Supabase parameterized queries (automatic)
- ✅ Rate limiting:
  - Login: 10/minute/IP
  - Registration: 3/hour/IP
  - Password reset: 3/hour/email
  - Email verification resend: 3/hour/email

**Testing Requirements:**
- ✅ Security test cases:
  - RLS bypass attempts (auth.uid() manipulation)
  - JWT token manipulation
  - SQL injection attempts in email field
  - XSS attempts in email/password fields
  - CSRF attacks (should fail)
  - Brute force login attempts (should lock)
  - Session fixation attacks
  - Concurrent session handling
- ✅ Functional test cases:
  - Registration with valid/invalid data
  - Login with correct/wrong credentials
  - Email verification flow (happy + expired link)
  - Password reset flow (happy + expired link)
  - Token refresh flow
  - Logout with pending operations
  - Protected route access when unauthenticated

**Technical Notes:**
- Supabase Auth với email/password provider
- Middleware: `middleware/auth.ts` để protect routes
  - Check auth.user() !== null
  - Handle token refresh errors
  - Preserve return URL in query params
- Composable: `useAuth.ts` cho auth state
  - Reactive user state
  - Login/logout methods
  - Token refresh logic
  - Error handling wrapper
- Pages: `pages/login.vue`, `pages/register.vue`, `pages/forgot-password.vue`, `pages/reset-password.vue`
- Auto-create default categories khi user đăng ký lần đầu (idempotent)
- Row Level Security (RLS) policies trong Supabase
- Error logging: Log authentication errors (exclude passwords) to monitoring service

---

### P1 (Must Have - MVP Core Features)

#### US1: Quản lý Transactions
**As a** user  
**I want to** tạo, xem, sửa và xóa transactions  
**So that** tôi có thể theo dõi thu chi hằng ngày

**Acceptance Criteria:**

**Create Transaction:**
- ✅ User có thể thêm transaction mới với: date, type (income/expense), amount, category, description
- ✅ Form validation:
  - Amount: > 0, ≤ 999,999,999,999.99, max 2 decimal places
  - Date: Không để trống, ≥ 1900-01-01, ≤ (today + 1 year)
  - Type: Required, must be 'income' hoặc 'expense'
  - Category: Required, must exist và thuộc user (hoặc default)
  - Description: Optional, max 500 characters, sanitize HTML
  - Tags: Optional, max 10 tags, max 50 characters/tag
- ✅ Real-time validation:
  - On blur: Validate field ngay khi user rời khỏi input
  - On submit: Validate toàn bộ form
  - Error display: Inline dưới field, red color, icon warning
- ✅ Validation errors:
  - Amount = 0 → "Số tiền phải lớn hơn 0"
  - Amount < 0 → "Số tiền không được âm"
  - Amount > max → "Số tiền quá lớn (tối đa 999 tỉ)"
  - Date empty → "Vui lòng chọn ngày"
  - Date too old → "Ngày không hợp lệ (từ 1900 trở lại)"
  - Date future → "Ngày không được quá 1 năm trong tương lai"
  - Category empty → "Vui lòng chọn danh mục"
  - Description too long → "Mô tả quá dài (tối đa 500 ký tự)"
- ✅ Save behavior:
  - Optimistic UI: Hiển thị transaction ngay, show loading indicator
  - Success → Toast "Đã thêm giao dịch" (3s), close form, refresh list
  - Network error → Rollback UI, show error modal:
    "Không thể lưu. Vui lòng kiểm tra kết nối."
    [Thử lại] [Lưu nháp] [Hủy]
  - Duplicate detection: Same date + amount + description + type trong vòng 5 phút →
    Warning: "Giao dịch tương tự đã tồn tại. Tiếp tục?"
  - DB constraint error → User-friendly message (map technical errors)
- ✅ Idempotency:
  - Generate client-side UUID before submit
  - Server checks UUID, ignore duplicate requests
  - Retry safe: User clicks Save nhiều lần → only 1 transaction created

**View Transactions:**
- ✅ User có thể xem danh sách tất cả transactions, sắp xếp theo ngày (mới nhất trước)
- ✅ List display:
  - Virtual scrolling nếu > 1000 items (performance requirement)
  - Pagination: 50 items/page (alternative to virtual scroll)
  - Empty state: "Chưa có giao dịch nào. [Thêm giao dịch đầu tiên]"
  - Loading state: Skeleton screens while fetching
  - Error state: "Không thể tải dữ liệu. [Thử lại]"
- ✅ Real-time updates:
  - Supabase subscription to transactions table
  - New transaction from another device → Auto-insert vào list (smooth animation)
  - Updated transaction → Update in-place
  - Deleted transaction → Remove với fade-out animation
  - Subscription disconnect → Fallback to manual refresh, show indicator

**Update Transaction:**
- ✅ User có thể edit transaction đã tạo
- ✅ Edit flow:
  - Click transaction → Open edit form với pre-filled data
  - Same validation as Create
  - Optimistic update: Update UI immediately
  - Success → Toast "Đã cập nhật" (2s)
  - Conflict detection:
    - Transaction deleted by another device → "Giao dịch đã bị xóa. [Tải lại]"
    - Transaction updated by another device → "Giao dịch đã được cập nhật bởi thiết bị khác."
      [Đè lên thay đổi của tôi] [Giữ thay đổi mới nhất] [Xem sự khác biệt]
  - Network error during update → Rollback to old values, allow retry
  - Validation error → Revert optimistic update, show inline errors

**Delete Transaction:**
- ✅ User có thể xóa transaction với confirmation dialog
- ✅ Delete flow:
  - Click delete → Confirmation modal:
    "Xóa giao dịch này?"
    "[Amount] - [Category] - [Date]"
    [Xóa] [Hủy]
  - Confirm → Optimistic delete (fade out UI)
  - Success → Toast "Đã xóa" với [Hoàn tác] button (5 giây timeout)
  - Undo clicked → Restore transaction, Toast "Đã khôi phục"
  - Undo timeout → Permanent delete
  - Network error → Rollback UI, show error "Không thể xóa. [Thử lại]"
  - Already deleted (concurrent) → "Giao dịch đã bị xóa" (silent, no error)

**Persistence & Sync:**
- ✅ Dữ liệu được lưu vào Supabase database tự động
- ✅ Multi-device sync:
  - User A tạo transaction trên mobile → User B thấy ngay trên desktop (< 1s latency)
  - Offline mode: Queue operations, sync khi online lại
  - Conflict resolution: Last-write-wins với server timestamp
- ✅ Data integrity:
  - Foreign key constraint: category_id must exist (ON DELETE RESTRICT)
  - Check constraint: amount > 0 (enforced at DB level)
  - RLS: user_id = auth.uid() (enforced at DB level)

**Responsive UI:**
- ✅ UI responsive, hoạt động tốt trên mobile
- ✅ Responsive requirements:
  - Mobile (< 640px): Single column, full-width forms, bottom sheet modals
  - Tablet (640-1024px): 2 columns for list, side panel for forms
  - Desktop (> 1024px): 3 columns, modal dialogs
  - Touch targets: ≥ 44x44px (iOS guidelines)
  - No horizontal scroll at any breakpoint
  - Form inputs: Auto-focus, appropriate keyboard types (numeric for amount)
  - Swipe gestures: Swipe left to delete (mobile only, optional)

**Error Handling Pattern (Standardized):**
- ✅ Network errors: Red toast với retry button, auto-dismiss 5s
- ✅ Validation errors: Inline below field, red text, persist until fixed
- ✅ Conflict errors: Modal dialog với options, require user choice
- ✅ Success messages: Green toast, auto-dismiss 2-3s
- ✅ Loading states: Skeleton screens, spinners, disable buttons during operation

**Testing Requirements:**
- ✅ Positive test cases:
  - Create transaction với valid data (all field combinations)
  - Update transaction với valid changes
  - Delete transaction với undo
  - List rendering với 0, 1, 100, 1000 transactions
- ✅ Negative test cases:
  - Amount = 0, negative, > max, non-numeric, too many decimals
  - Date empty, invalid format, too old, too far future
  - Category deleted, non-existent, belongs to other user
  - Description > 500 chars, XSS attempts (<script>alert(1)</script>)
  - Concurrent edit conflicts
  - Network failures during CRUD operations
  - Duplicate detection edge cases
- ✅ Security test cases:
  - Create transaction for other user (should fail RLS)
  - Update/delete transaction of other user (should fail RLS)
  - SQL injection in description field
  - XSS in description field

**Technical Notes:**
- Component: `TransactionForm.vue`, `TransactionList.vue`, `TransactionCard.vue`
- Store: `stores/transactions.ts` với CRUD methods (Supabase client)
  - Actions: createTransaction, updateTransaction, deleteTransaction, fetchTransactions
  - Getters: sortedTransactions, transactionsByDateRange, totalIncome, totalExpense
  - State: transactions[], loading, error, subscriptionActive
  - Supabase real-time subscription setup/cleanup
- Validation: Zod schema cho transaction
  ```typescript
  const TransactionSchema = z.object({
    date: z.date().min(new Date('1900-01-01')).max(addYears(new Date(), 1)),
    type: z.enum(['income', 'expense']),
    amount: z.number().positive().max(999999999999.99).multipleOf(0.01),
    category: z.string().uuid(),
    description: z.string().max(500).optional(),
    tags: z.array(z.string().max(50)).max(10).optional()
  })
  ```
- Database: `transactions` table trong Supabase
- RLS: User chỉ access được transactions của mình
- Offline queue: LocalStorage để lưu pending operations, sync on reconnect
- UUID generation: `crypto.randomUUID()` for idempotency
- Error logging: Log CRUD errors (exclude user data) to monitoring service

---

#### US2: Dashboard Tổng Quan
**As a** user  
**I want to** xem dashboard với thống kê tổng quan  
**So that** tôi hiểu rõ tình hình tài chính của mình

**Acceptance Criteria:**

**Summary Cards:**
- ✅ Hiển thị 3 summary cards: Total Income, Total Expense, Balance (Income - Expense)
- ✅ Card layout:
  - Mobile: Stack vertical (1 column)
  - Tablet/Desktop: Horizontal row (3 columns)
  - Each card: Icon, label, amount, trend indicator (optional P2)
- ✅ Number formatting:
  - VND format: 1.000.000 ₫ (theo user settings)
  - Negative balance: Red color + minus sign
  - Positive balance: Green color
  - Zero: Gray color
  - Max displayable: 999,999,999,999.99 (sau đó show "999+ tỉ")

**Time Period Selection:**
- ✅ Có thể chọn time period: Daily, Weekly, Monthly
- ✅ Period definitions:
  - Daily: Single day (current day by default)
  - Weekly: Mon-Sun (current week by default, ISO 8601)
  - Monthly: First-Last day of month (current month by default)
- ✅ Period selector UI:
  - Tab buttons hoặc dropdown
  - Active period highlighted
  - Persist selection in localStorage

**Date Navigation:**
- ✅ Có date navigation (prev/next) cho period đã chọn
- ✅ Navigation controls:
  - Previous button (arrow left)
  - Current period label (e.g., "12 Dec 2025", "Week 50, 2025", "Dec 2025")
  - Next button (arrow right, disabled if future)
  - Today/This Week/This Month button (reset to current)
- ✅ Keyboard shortcuts:
  - Left arrow: Previous period
  - Right arrow: Next period
  - T: Today/This period

**Real-time Updates:**
- ✅ Summary tự động update khi có transaction mới
- ✅ Update behavior:
  - Supabase subscription: Listen to transactions insert/update/delete
  - Update latency: < 1s from server event to UI update
  - Animation: Count-up animation for amount changes (optional)
  - Conflict: Multiple devices → Server timestamp wins
  - Subscription disconnect → Show warning "Mất kết nối. [Tải lại]", fallback to manual refresh

**Display Formatting:**
- ✅ Hiển thị số liệu với format VND đúng (1.000.000 ₫)
- ✅ Format rules:
  - Separator: "." (dot) for thousands (respects user settings)
  - Decimal: "," (comma) for decimals (2 places, hide if .00)
  - Currency symbol: ₫ (after amount)
  - Negative: "-1.000.000 ₫" (red color)

**Empty State:**
- ✅ Empty state khi chưa có transactions
- ✅ Empty state UI:
  - Illustration/icon
  - Message: "Chưa có giao dịch nào trong [period]"
  - CTA button: "Thêm giao dịch đầu tiên"
  - All cards show: 0 ₫

**Error Handling:**
- ✅ Data fetch errors:
  - Network error → Toast "Không thể tải dữ liệu. [Thử lại]"
  - DB error → Show cached data (if available) + warning banner
- ✅ Loading state:
  - Skeleton cards while initial fetch
  - Shimmer animation
  - Max wait: 5s → timeout error

**Performance Requirements:**
- ✅ Initial render: < 500ms (with cached data)
- ✅ Period switch: < 200ms (recalculate summaries)
- ✅ Real-time update: < 1s from event to UI

**Testing Requirements:**
- ✅ Positive tests:
  - Summary calculation correctness (income, expense, balance)
  - Period switching (Daily/Weekly/Monthly)
  - Date navigation (prev/next/today)
  - Real-time updates on transaction changes
- ✅ Edge cases:
  - Empty transactions → Show 0 values
  - Negative balance → Red color, correct format
  - Large amounts (> 999 triệu) → Correct format
  - Period with no transactions → Show 0
  - Future period → Disable next button

**Technical Notes:**
- Page: `pages/index.vue` (Dashboard)
- Components: `StatCard.vue`, `PeriodSelector.vue`, `DateNavigator.vue`
- Composable: `useDateRange.ts` để tính toán time periods
  - getPeriodRange(type, offset): Return { start, end } dates
  - formatPeriodLabel(type, date): Format display label
  - isCurrentPeriod(type, date): Check if period is current
- Store getters: `totalIncome`, `totalExpense`, `balance` với date filtering
  ```typescript
  getters: {
    totalIncome: (state) => (startDate: Date, endDate: Date) => {
      return state.transactions
        .filter(t => t.type === 'income' && t.date >= startDate && t.date <= endDate)
        .reduce((sum, t) => sum + t.amount, 0)
    },
    // Similar for totalExpense, balance
  }
  ```
- Supabase subscription: transactions table (filtered by user_id)
- LocalStorage: Save selected period preference
- Number formatting: Use Intl.NumberFormat với user locale settings

---

#### US3: Visualization với Charts
**As a** user  
**I want to** xem biểu đồ thu/chi  
**So that** tôi dễ dàng nhận biết pattern chi tiêu

**Acceptance Criteria:**

**Line/Bar Chart - Income vs Expense:**
- ✅ Line/Bar chart: Income vs Expense theo thời gian (theo period đã chọn)
- ✅ Chart specifications:
  - Chart type: Combination (Line for trend + Bar for comparison)
  - X-axis: Time labels (days/weeks/months based on selected period)
  - Y-axis: Amount in VND (auto-scale, show currency symbol)
  - Data series: 2 lines/bars (Income = green, Expense = red)
  - Gridlines: Horizontal only, subtle gray
  - Zero line: Bold, distinct color
- ✅ Period-based rendering:
  - Daily: Show hourly breakdown (0-23h, aggregate transactions)
  - Weekly: Show daily breakdown (Mon-Sun, 7 data points)
  - Monthly: Show daily breakdown (1-31, up to 31 data points)
- ✅ Data aggregation:
  - Group transactions by time bucket
  - Calculate sum for each bucket
  - Handle sparse data (days with no transactions → show 0)

**Pie/Doughnut Chart - Category Breakdown:**
- ✅ Pie/Doughnut chart: Phân bổ theo categories (cho expense)
- ✅ Chart specifications:
  - Chart type: Doughnut (better readability)
  - Slices: One per category (max 15, group "Others" if more)
  - Colors: Use category.color from database
  - Center text: Total expense amount
  - Slice labels: Category name + percentage
  - Minimum slice size: 1% (smaller → group into "Others")
- ✅ Interactivity:
  - Click slice → Filter transactions by that category
  - Hover → Highlight slice, show tooltip

**Responsive Charts:**
- ✅ Charts responsive, hiển thị tốt trên mobile
- ✅ Responsive specifications:
  - Mobile (< 640px): Single column, aspect ratio 16:9, font size 10px
  - Tablet (640-1024px): 2 columns (line + pie side-by-side), aspect 4:3, font 12px
  - Desktop (> 1024px): 2 columns, aspect 16:9, font 14px
  - Touch support: Pinch to zoom (optional), tap to interact
  - No horizontal scroll: Charts scale to container width
  - Legend: Below chart on mobile, right side on desktop
  - Min chart height: 200px, max: 500px

**Real-time Updates:**
- ✅ Charts update real-time khi có thay đổi data
- ✅ Update specifications:
  - Supabase subscription: Listen to transactions table changes
  - Update latency: < 1s from event to chart re-render
  - Animation: Smooth transition (300ms) when data changes
  - Throttling: Max 1 update/second (batch multiple rapid changes)
  - Subscription disconnect → Fallback to manual refresh button

**Tooltip Information:**
- ✅ Tooltip hiển thị đầy đủ thông tin khi hover
- ✅ Tooltip content:
  - Line/Bar chart: "[Date]: Thu [amount] ₫, Chi [amount] ₫"
  - Pie chart: "[Category]: [amount] ₫ ([percentage]%)"
  - Tooltip position: Follow cursor, avoid screen edges
  - Tooltip styling: White background, shadow, rounded corners

**Legend & Labels:**
- ✅ Legend để phân biệt income/expense
- ✅ Legend specifications:
  - Items: Income (green), Expense (red)
  - Interactive: Click to hide/show series
  - Position: Bottom on mobile, right on desktop
  - Labels: Vietnamese ("Thu nhập", "Chi tiêu")

**Empty State:**
- ✅ Empty state khi không có data:
  - Message: "Không có dữ liệu trong khoảng thời gian này"
  - Illustration: Empty chart placeholder
  - CTA: "Thêm giao dịch"

**Performance Requirements:**
- ✅ Chart rendering: < 500ms (for up to 1000 data points)
- ✅ Interaction latency: < 100ms (hover, click responses)
- ✅ Animation frame rate: 60 FPS (smooth transitions)

**Technical Notes:**
- Component: `DashboardChart.vue`, `CategoryChart.vue`
- Library: Chart.js với vue-chartjs
- Data aggregation trong store getters

---

### P2 (Should Have - Enhanced Features)

#### US4: Lọc và Tìm kiếm Transactions
**As a** user  
**I want to** lọc và tìm kiếm transactions  
**So that** tôi dễ dàng tìm được giao dịch cần xem

**Acceptance Criteria:**
- ✅ Filter theo type: All, Income only, Expense only
- ✅ Filter theo category: Multi-select categories
- ✅ Filter theo date range: Custom date picker
- ✅ Filter theo amount range: Min/Max amount
- ✅ Search box: Tìm kiếm theo description (real-time)
- ✅ Clear filters button
- ✅ Filter state lưu vào URL query params (shareable)
- ✅ Hiển thị số lượng results found

**Technical Notes:**
- Component: `FilterBar.vue`, `SearchInput.vue`
- Store: `filterState` trong transactionsStore
- Composable: `useFilters.ts` cho filter logic
- URL sync: Nuxt's `useRoute()` và `useRouter()`

---

#### US5: Export Data sang CSV
**As a** user  
**I want to** export transactions sang file CSV  
**So that** tôi có thể backup hoặc phân tích ở nơi khác

**Acceptance Criteria:**
- ✅ Export button ở transaction list page
- ✅ Export tất cả transactions hoặc chỉ filtered results
- ✅ CSV format: Date, Type, Amount, Category, Description
- ✅ Filename: `expense-tracker-export-YYYY-MM-DD.csv`
- ✅ Proper encoding cho tiếng Việt (UTF-8 BOM)
- ✅ Amount format: Plain number (không có separator)
- ✅ Date format: YYYY-MM-DD hoặc DD/MM/YYYY

**Technical Notes:**
- Component: `ExportButton.vue`
- Utility: `utils/csv-export.ts` với PapaParse
- Browser download: Blob + URL.createObjectURL

---

### P3 (Nice to Have - Future Enhancements)

#### US6: Quản lý Categories
**As a** user  
**I want to** tạo và quản lý categories riêng  
**So that** tôi có thể customize theo nhu cầu cá nhân

**Acceptance Criteria:**
- ✅ Xem danh sách tất cả categories (default + custom)
- ✅ Thêm custom category với name, type, color
- ✅ Edit/Delete custom categories (không được xóa default)
- ✅ Category được sử dụng không thể xóa (show warning)
- ✅ Color picker cho category color

**Technical Notes:**
- Page: `pages/categories/index.vue`
- Store: `stores/categories.ts`
- Component: `CategoryForm.vue`, `ColorPicker.vue`

---

#### US7: Settings và Preferences
**As a** user  
**I want to** customize app settings  
**So that** app phù hợp với preferences của tôi

**Acceptance Criteria:**
- ✅ Currency setting: VND, USD (display only, không convert)
- ✅ Date format: DD/MM/YYYY hoặc YYYY-MM-DD
- ✅ Number format: 1.000.000 hoặc 1,000,000
- ✅ Default view: Dashboard hoặc Transactions
- ✅ Theme: Light/Dark mode (nếu implement)
- ✅ Settings lưu vào LocalStorage

**Technical Notes:**
- Page: `pages/settings.vue`
- Store: `stores/settings.ts`
- Composable: `useFormatters.ts` sử dụng settings

---

#### US8: Import CSV Data
**As a** user  
**I want to** import transactions từ CSV file  
**So that** tôi có thể migrate data hoặc restore backup

**Acceptance Criteria:**
- ✅ Import button với file picker
- ✅ CSV format validation trước khi import
- ✅ Preview imported data trước khi confirm
- ✅ Handle duplicate detection (theo date + amount + description)
- ✅ Error handling cho invalid rows
- ✅ Success message với số lượng imported

**Technical Notes:**
- Component: `ImportButton.vue`, `ImportPreview.vue`
- Utility: `utils/csv-import.ts` với PapaParse
- Validation: Zod schema

---

#### US9: Recurring Transactions (Future)
**As a** user  
**I want to** tạo recurring transactions  
**So that** không phải nhập lại transactions hằng tháng

**Acceptance Criteria:**
- ✅ Tạo transaction template với recurrence pattern (monthly, weekly, etc.)
- ✅ Auto-create transactions theo schedule
- ✅ Edit/Delete recurring pattern
- ✅ Option để skip specific occurrence

**Technical Notes:**
- Requires: Background job hoặc check on app load
- Store: `stores/recurring.ts`
- Advanced feature - postpone to v2

---

## UI/UX Requirements

### Layout
- **Header**: Logo + Navigation (Dashboard, Transactions, Settings)
- **Main Content**: Page-specific content
- **Footer**: Copyright, version (optional)

### Navigation
- Active route highlighting
- Mobile: Hamburger menu hoặc bottom navigation
- Desktop: Top horizontal nav

### Color Scheme
- **Primary**: Blue/Indigo (#3B82F6)
- **Success/Income**: Green (#10B981)
- **Danger/Expense**: Red (#EF4444)
- **Neutral**: Gray shades

### Responsive Breakpoints
- Mobile: < 640px
- Tablet: 640px - 1024px
- Desktop: > 1024px

### Accessibility
- Keyboard navigation support
- ARIA labels cho screen readers
- Color contrast ratio ≥ 4.5:1
- Focus indicators

## Database Schema (Supabase)

### Tables

#### `users` (Managed by Supabase Auth)
```sql
-- Auto-generated by Supabase Auth
-- auth.users table
```

#### `categories`
```sql
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  type VARCHAR(20) NOT NULL CHECK (type IN ('income', 'expense', 'both')),
  color VARCHAR(7) NOT NULL,
  icon VARCHAR(50),
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index
CREATE INDEX idx_categories_user_id ON categories(user_id);
CREATE INDEX idx_categories_type ON categories(type);

-- RLS Policies
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

-- Users can view default categories (user_id IS NULL) and their own categories
CREATE POLICY "Users can view categories" ON categories
  FOR SELECT
  USING (user_id IS NULL OR user_id = auth.uid());

-- Users can create their own categories
CREATE POLICY "Users can create categories" ON categories
  FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- Users can update only their own categories
CREATE POLICY "Users can update own categories" ON categories
  FOR UPDATE
  USING (user_id = auth.uid());

-- Users can delete only their own categories
CREATE POLICY "Users can delete own categories" ON categories
  FOR DELETE
  USING (user_id = auth.uid());
```

#### `transactions`
```sql
CREATE TABLE transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  type VARCHAR(20) NOT NULL CHECK (type IN ('income', 'expense')),
  amount DECIMAL(15, 2) NOT NULL CHECK (amount > 0),
  category_id UUID NOT NULL REFERENCES categories(id) ON DELETE RESTRICT,
  description TEXT,
  tags TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_transactions_user_id ON transactions(user_id);
CREATE INDEX idx_transactions_date ON transactions(date DESC);
CREATE INDEX idx_transactions_type ON transactions(type);
CREATE INDEX idx_transactions_category_id ON transactions(category_id);

-- RLS Policies
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own transactions" ON transactions
  FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can create own transactions" ON transactions
  FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own transactions" ON transactions
  FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "Users can delete own transactions" ON transactions
  FOR DELETE
  USING (user_id = auth.uid());
```

#### `user_settings`
```sql
CREATE TABLE user_settings (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  currency VARCHAR(10) DEFAULT 'VND',
  date_format VARCHAR(20) DEFAULT 'DD/MM/YYYY',
  number_format VARCHAR(20) DEFAULT '1.000.000',
  default_view VARCHAR(20) DEFAULT 'dashboard',
  theme VARCHAR(20) DEFAULT 'system',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS Policies
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own settings" ON user_settings
  FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can update own settings" ON user_settings
  FOR ALL
  USING (user_id = auth.uid());
```

### Triggers

```sql
-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_categories_updated_at
  BEFORE UPDATE ON categories
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_transactions_updated_at
  BEFORE UPDATE ON transactions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_settings_updated_at
  BEFORE UPDATE ON user_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

### Default Categories Seed Data

```sql
-- Insert default categories (user_id = NULL for system defaults)
INSERT INTO categories (name, type, color, icon, is_default) VALUES
  -- Income categories
  ('Lương', 'income', '#10B981', 'briefcase', true),
  ('Kinh doanh', 'income', '#059669', 'chart-bar', true),
  ('Đầu tư', 'income', '#047857', 'trending-up', true),
  ('Quà tặng', 'income', '#34D399', 'gift', true),
  ('Thu nhập khác', 'income', '#6EE7B7', 'plus-circle', true),
  
  -- Expense categories
  ('Ăn uống', 'expense', '#EF4444', 'cake', true),
  ('Di chuyển', 'expense', '#DC2626', 'truck', true),
  ('Nhà ở', 'expense', '#B91C1C', 'home', true),
  ('Tiện ích', 'expense', '#991B1B', 'lightning-bolt', true),
  ('Y tế', 'expense', '#F87171', 'heart', true),
  ('Giải trí', 'expense', '#FCA5A5', 'film', true),
  ('Mua sắm', 'expense', '#FEE2E2', 'shopping-bag', true),
  ('Giáo dục', 'expense', '#F97316', 'academic-cap', true),
  ('Chi phí khác', 'expense', '#FDBA74', 'dots-horizontal', true);
```

### Data Migration Strategy
- Database migrations managed by Supabase migrations
- Version control: SQL migration files trong `supabase/migrations/`
- Auto-backup: Supabase automatic daily backups
- Manual backup: Export via Supabase Dashboard hoặc `pg_dump`

## Performance Requirements

- Initial page load: < 2s
- Transaction list rendering: < 100ms cho 1000 items (virtual scrolling nếu cần)
- Chart rendering: < 500ms
- Filter/Search: Real-time (debounced 300ms)

## Browser Support

- Chrome/Edge: Latest 2 versions
- Firefox: Latest 2 versions
- Safari: Latest 2 versions
- Mobile Safari/Chrome: Latest versions

## Security & Privacy

### Authentication
- **Supabase Auth**: Industry-standard JWT tokens
- **Email verification**: Required for new accounts
- **Password requirements**: Minimum 8 characters
- **Session management**: Secure HttpOnly cookies
- **Password reset**: Secure email-based flow

### Authorization
- **Row Level Security (RLS)**: Database-level access control
- **User isolation**: Users can only access their own data
- **API security**: All requests authenticated via JWT

### Data Protection
- **Encryption at rest**: Supabase encrypts all data
- **Encryption in transit**: HTTPS/TLS for all connections
- **Data ownership**: Users own 100% of their data
- **Data deletion**: Complete data removal on account deletion (CASCADE)
- **No third-party sharing**: Zero data sharing with external services

### Privacy
- **No analytics/tracking**: No user behavior tracking
- **No cookies**: Except authentication (necessary)
- **GDPR compliant**: Right to access, export, and delete data
- **Data export**: CSV export functionality
- **Open source**: Code auditable by users

## Future Considerations (v2+)

1. ✅ **Cloud Sync**: ~~Supabase integration~~ (Already implemented in v1)
2. ✅ **Multi-device**: ~~Sync across devices~~ (Already supported via Supabase)
3. **Mobile App**: React Native hoặc Progressive Web App (PWA)
4. **Budgets**: Set monthly budgets per category với alerts
5. **Goals**: Savings goals tracking với progress bars
6. **Reports**: Advanced PDF reports với charts
7. **Multi-currency**: Real-time exchange rates API integration
8. **Collaboration**: Shared household budgets (multiple users)
9. **Recurring Transactions**: Auto-create monthly bills/income
10. **Notifications**: Email/Push notifications cho budgets, goals
11. **Data Analytics**: AI-powered insights và spending predictions
12. **Attachments**: Upload receipts/invoices (Supabase Storage)
13. **Categories Management**: Subcategories support
14. **Import/Export**: Support multiple formats (Excel, JSON, QIF)

## Success Metrics

- User can create account và đăng nhập thành công trong < 2 phút
- User can create first transaction trong < 1 phút (sau khi đăng nhập)
- User có thể xem dashboard và hiểu được tình hình tài chính trong < 30 giây
- User có thể export CSV thành công ngay lần đầu
- Zero data loss (Supabase cloud backup reliable)
- Multi-device sync: Data available immediately trên thiết bị khác

## Development Workflow

1. **Spec-First**: Update spec.md trước khi code
2. **Database First**: Setup Supabase schema và migrations trước
3. **Feature Branches**: Mỗi user story = 1 branch
4. **Incremental**: Implement theo priority (P0 → P1 → P2 → P3)
5. **Testing**: Manual testing mỗi feature trước khi merge
6. **Documentation**: Update README với setup instructions

## Deployment

### Netlify Configuration
```toml
# netlify.toml
[build]
  command = "npm run build"
  publish = ".output/public"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

### Environment Variables (Netlify)
```bash
# Required in Netlify Environment Variables
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-anon-public-key
```

### Supabase Setup
1. Create project tại [supabase.com](https://supabase.com)
2. Run migrations trong `supabase/migrations/`
3. Configure Email templates trong Auth settings
4. Enable email provider (SMTP hoặc Supabase built-in)
5. Configure RLS policies
6. Seed default categories data

---

**End of Specification v2.0**  
**Updated**: December 4, 2025  
**Changes**: Migrated from LocalStorage to Supabase (PostgreSQL + Auth), added authentication, deployment support for Netlify

**End of Specification v1.0**
