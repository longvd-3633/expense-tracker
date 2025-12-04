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
- ✅ User có thể đăng ký tài khoản mới với email + password
- ✅ Email verification required (Supabase email confirmation)
- ✅ User có thể đăng nhập với email + password
- ✅ User có thể đăng xuất
- ✅ User có thể reset password qua email
- ✅ Session persistence (auto-login khi quay lại)
- ✅ Protected routes: Redirect to login nếu chưa authenticate
- ✅ Social login options: Google, GitHub (optional P2)
- ✅ User chỉ thấy và quản lý được data của chính mình

**Technical Notes:**
- Supabase Auth với email/password provider
- Middleware: `middleware/auth.ts` để protect routes
- Composable: `useAuth.ts` cho auth state
- Pages: `pages/login.vue`, `pages/register.vue`, `pages/forgot-password.vue`
- Auto-create default categories khi user đăng ký lần đầu
- Row Level Security (RLS) policies trong Supabase

---

### P1 (Must Have - MVP Core Features)

#### US1: Quản lý Transactions
**As a** user  
**I want to** tạo, xem, sửa và xóa transactions  
**So that** tôi có thể theo dõi thu chi hằng ngày

**Acceptance Criteria:**
- ✅ User có thể thêm transaction mới với: date, type (income/expense), amount, category, description
- ✅ Form validation: amount > 0, date không để trống, category được chọn
- ✅ User có thể xem danh sách tất cả transactions, sắp xếp theo ngày (mới nhất trước)
- ✅ User có thể edit transaction đã tạo
- ✅ User có thể xóa transaction với confirmation dialog
- ✅ Dữ liệu được lưu vào Supabase database tự động
- ✅ UI responsive, hoạt động tốt trên mobile

**Technical Notes:**
- Component: `TransactionForm.vue`, `TransactionList.vue`, `TransactionCard.vue`
- Store: `stores/transactions.ts` với CRUD methods (Supabase client)
- Validation: Zod schema cho transaction
- Database: `transactions` table trong Supabase
- RLS: User chỉ access được transactions của mình

---

#### US2: Dashboard Tổng Quan
**As a** user  
**I want to** xem dashboard với thống kê tổng quan  
**So that** tôi hiểu rõ tình hình tài chính của mình

**Acceptance Criteria:**
- ✅ Hiển thị 3 summary cards: Total Income, Total Expense, Balance (Income - Expense)
- ✅ Có thể chọn time period: Daily, Weekly, Monthly
- ✅ Có date navigation (prev/next) cho period đã chọn
- ✅ Summary tự động update khi có transaction mới
- ✅ Hiển thị số liệu với format VND đúng (1.000.000 ₫)
- ✅ Empty state khi chưa có transactions

**Technical Notes:**
- Page: `pages/index.vue` (Dashboard)
- Components: `StatCard.vue`, `PeriodSelector.vue`
- Composable: `useDateRange.ts` để tính toán time periods
- Store getters: `totalIncome`, `totalExpense`, `balance` với date filtering

---

#### US3: Visualization với Charts
**As a** user  
**I want to** xem biểu đồ thu/chi  
**So that** tôi dễ dàng nhận biết pattern chi tiêu

**Acceptance Criteria:**
- ✅ Line/Bar chart: Income vs Expense theo thời gian (theo period đã chọn)
- ✅ Pie/Doughnut chart: Phân bổ theo categories (cho expense)
- ✅ Charts responsive, hiển thị tốt trên mobile
- ✅ Charts update real-time khi có thay đổi data
- ✅ Tooltip hiển thị đầy đủ thông tin khi hover
- ✅ Legend để phân biệt income/expense

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
