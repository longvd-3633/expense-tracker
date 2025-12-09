# Expense Tracker

A modern web application for tracking personal income and expenses built with Nuxt 3, TypeScript, TailwindCSS, and Supabase.

## Features

- 🔐 **User Authentication** - Secure email/password authentication with Supabase
- 💰 **Transaction Management** - Create, read, update, and delete income/expense transactions
- 📊 **Dashboard Overview** - View financial summaries with customizable time periods
- 📈 **Data Visualization** - Interactive charts for income vs expense trends
- 🔍 **Advanced Filtering** - Search and filter transactions by multiple criteria
- 📤 **CSV Export** - Export transaction data to CSV format
- 📥 **CSV Import** - Import transactions from CSV files with validation
- 🔁 **Recurring Transactions** - Automatically generate transactions on a schedule
- ⚙️ **User Settings** - Customize date format, currency, theme, and more
- 🏷️ **Custom Categories** - Create and manage your own expense/income categories
- 🔄 **Real-time Sync** - Data syncs across devices automatically
- 📱 **Responsive Design** - Works seamlessly on desktop, tablet, and mobile

## Recurring Transactions

Create recurring transaction templates that automatically generate transactions on schedule. Perfect for:
- Monthly salary (income)
- Rent/mortgage payments (expense)
- Subscriptions (Netflix, Spotify, etc.)
- Utility bills (electricity, water, internet)
- Weekly grocery budgets

### Supported Recurrence Patterns

- **Daily**: Every N days (e.g., every 3 days)
- **Weekly**: Specific days of week (e.g., every Monday and Thursday)
- **Monthly**: 
  - By date: Same day each month (e.g., 15th of every month)
  - By weekday: Relative weekday (e.g., 2nd Monday of every month)
- **Yearly**: Anniversary dates (e.g., annual insurance payment)

### Edge Case Handling

- **Month-end dates**: Jan 31 → Feb 28 (or 29 in leap years)
- **Leap years**: Feb 29 recurring → Feb 28 in non-leap years
- **Missing weekdays**: 5th Monday in months with only 4 Mondays → skips that month
- **DST transitions**: Automatic timezone adjustment

### Auto-Generation

- Runs automatically when you open the app
- Generates up to 30 missed occurrences per template
- Duplicate prevention: won't create the same transaction twice
- Can skip individual occurrences
- Can edit or delete templates anytime

### Usage Example

1. Go to **Định kỳ** (Recurring) page
2. Click **Tạo mẫu mới** (Create new template)
3. Fill in transaction details:
   - Name: "Lương hằng tháng" (Monthly salary)
   - Type: Thu (Income)
   - Amount: 10,000,000 VND
   - Category: Lương (Salary)
4. Set recurrence pattern:
   - Frequency: Hằng tháng (Monthly)
   - Every: 1 month
   - On: Ngày 1 (1st of month)
   - Start: Today
   - End: Never
5. Click **Tạo mẫu** (Create template)
6. The system will automatically create a transaction on the 1st of every month

### Database Schema

Three new tables power recurring transactions:

- **recurring_transactions**: Template definitions
- **generated_transactions**: Tracks which transactions were auto-generated
- **transactions.recurring_transaction_id**: Links generated transactions back to template

## Tech Stack

### Core
- **Nuxt 3** - Full-stack Vue.js framework
- **TypeScript 5.x** - Type-safe development
- **Vue 3** - Progressive JavaScript framework

### UI & Styling
- **TailwindCSS 3.x** - Utility-first CSS framework
- **Chart.js 4.x** - Data visualization
- **vue-chartjs 5.x** - Vue wrapper for Chart.js

### Backend & Database
- **Supabase** - Backend as a Service
  - PostgreSQL database
  - Authentication & authorization
  - Row Level Security (RLS)
  - Real-time subscriptions

### State Management & Utilities
- **Pinia 2.x** - Vue state management
- **VueUse** - Composition utilities
- **date-fns 4.x** - Date manipulation
- **Zod 4.x** - Schema validation
- **PapaParse 5.x** - CSV parsing

### Speckit SDD Artifacts

Project-wide specification assets are organized under `specs/000-expense-tracker/`:

- `spec.md` – high-level requirements
- `plan.md` – implementation plan and architecture
- `tasks.md` – cross-feature task backlog
- `checklist.md` plus `checklists/` – quality gate reviews

## Prerequisites

- Node.js 18.x or higher
- npm or yarn
- Supabase account (free tier available at [supabase.com](https://supabase.com))

## Getting Started

### 1. Clone the Repository

\`\`\`bash
git clone <repository-url>
cd expense-tracker
\`\`\`

### 2. Install Dependencies

\`\`\`bash
npm install
\`\`\`

### 3. Setup Supabase

#### 3.1 Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign up/login
2. Click "New Project"
3. Fill in project details:
   - **Name**: expense-tracker (or your preferred name)
   - **Database Password**: Create a strong password (save it securely)
   - **Region**: Choose closest to your location
4. Wait for project creation (~2 minutes)

#### 3.2 Get API Credentials

1. In your Supabase project dashboard, go to **Settings** → **API**
2. Copy the following values:
   - **Project URL** (e.g., `https://xxxxx.supabase.co`)
   - **anon public key** (long string starting with `eyJ...`)

#### 3.3 Configure Environment Variables

1. Open the \`.env\` file in your project root
2. Replace the placeholder values:

\`\`\`env
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_KEY=your-anon-public-key-here
\`\`\`

### 4. Run Database Migration

1. In Supabase dashboard, go to **SQL Editor**
2. Click **New Query**
3. Copy the entire contents of \`supabase/migrations/001_initial_schema.sql\`
4. Paste into the SQL Editor
5. Click **Run** button
6. Verify success - you should see tables created in the **Table Editor**

**Expected Tables:**
- \`categories\` - Default income/expense categories
- \`transactions\` - User transactions
- \`user_settings\` - User preferences

### 5. Configure Email Authentication

1. In Supabase dashboard, go to **Authentication** → **Providers**
2. Find **Email** provider (should be enabled by default)
3. Optional: Configure email templates under **Authentication** → **Email Templates**

### 6. Start Development Server

\`\`\`bash
npm run dev
\`\`\`

The application will be available at [http://localhost:3000](http://localhost:3000)

## Project Structure

\`\`\`
expense-tracker/
├── app/                    # Nuxt 4 app directory
│   ├── app.vue            # Root component
│   ├── components/        # Vue components
│   │   ├── atoms/        # Basic UI elements
│   │   ├── molecules/    # Composite components
│   │   └── organisms/    # Complex components
│   ├── composables/      # Composition functions
│   │   ├── useAuth.ts   # Authentication logic
│   │   ├── useFormatters.ts # Format utilities
│   │   └── ...
│   ├── layouts/          # Page layouts
│   ├── middleware/       # Route middleware
│   │   └── auth.ts      # Authentication guard
│   ├── pages/            # Application pages
│   │   ├── index.vue    # Dashboard
│   │   ├── login.vue    # Login page
│   │   ├── register.vue # Registration page
│   │   └── transactions/ # Transaction management
│   ├── stores/           # Pinia stores
│   │   ├── transactions.ts # Transaction state
│   │   ├── categories.ts   # Category state
│   │   └── settings.ts     # User settings
│   ├── types/            # TypeScript types
│   │   ├── transaction.ts
│   │   ├── category.ts
│   │   ├── user.ts
│   │   └── index.ts
│   └── utils/            # Utility functions
├── assets/                 # Static assets
│   └── css/               # Global styles
├── supabase/              # Supabase configuration
│   └── migrations/        # Database migrations
├── .env                   # Environment variables (not in git)
├── .env.example           # Environment template
├── nuxt.config.ts         # Nuxt configuration
├── tailwind.config.ts     # Tailwind configuration
└── package.json           # Dependencies
\`\`\`

## Development Workflow

### Phase 1: Setup ✅ (Complete)
- [x] Project initialization
- [x] Dependencies installation
- [x] Type definitions
- [x] Tailwind configuration

### Phase 2: Authentication ✅ (Code Complete - Manual Setup Required)
- [x] Database migration file created
- [x] Authentication middleware
- [x] Login/Register pages
- [x] Password reset flow
- [ ] **Requires Supabase project setup** (see Step 3 above)

### Phase 3: Transaction Management (Next)
- [ ] Transaction CRUD operations
- [ ] Pinia stores
- [ ] Transaction form & list components
- [ ] Real-time sync

### Phase 4: Dashboard (MVP)
- [ ] Summary cards
- [ ] Period selection
- [ ] Date navigation

### Phase 5: Charts (MVP)
- [ ] Income vs Expense chart
- [ ] Category breakdown chart

### Phases 6-10: Enhanced Features
- [ ] Filter & Search
- [ ] CSV Export
- [ ] User Settings
- [ ] Custom Categories
- [ ] Polish & Deployment

## Testing Authentication

### Manual Test Flow

1. **Register New User**
   - Visit http://localhost:3000/register
   - Enter email and password (min 8 chars, 1 uppercase, 1 lowercase, 1 number)
   - Check email for verification link
   - Click verification link

2. **Login**
   - Visit http://localhost:3000/login
   - Enter verified credentials
   - Should redirect to dashboard

3. **Test Protected Routes**
   - Try accessing http://localhost:3000 without login → should redirect to login
   - Login → should access dashboard successfully

4. **Password Reset**
   - Visit http://localhost:3000/forgot-password
   - Enter email
   - Check email for reset link

## Useful Commands

\`\`\`bash
# Development
npm run dev              # Start dev server
npm run build            # Build for production
npm run preview          # Preview production build

# Code Quality
npm run typecheck        # Run TypeScript type checking
npm run lint             # Run ESLint (if configured)

# Database
# Run migrations in Supabase SQL Editor
# File: supabase/migrations/001_initial_schema.sql
\`\`\`

## Environment Variables

Create a \`.env\` file with these variables:

\`\`\`env
SUPABASE_URL=your-supabase-project-url
SUPABASE_KEY=your-supabase-anon-key
\`\`\`

**Security Notes:**
- Never commit \`.env\` to version control
- The \`.env.example\` file is for reference only
- Use strong passwords for Supabase database

## Troubleshooting

### Supabase Connection Issues

**Problem**: "Failed to fetch" or "Network error"

**Solutions**:
1. Verify \`SUPABASE_URL\` and \`SUPABASE_KEY\` in \`.env\`
2. Check Supabase project status in dashboard
3. Ensure project is not paused (free tier pauses after inactivity)
4. Restart dev server after changing \`.env\`

### Email Verification Not Received

**Solutions**:
1. Check spam/junk folder
2. In Supabase: **Authentication** → **Email Templates** → Verify settings
3. For development: Use a real email address (not temporary/disposable)
4. Check Supabase logs: **Logs** → **Auth Logs**

### TypeScript Errors

**Problem**: Type errors during development

**Solutions**:
1. Run \`npm run typecheck\` to see all errors
2. Restart VS Code TypeScript server: Cmd+Shift+P → "TypeScript: Restart TS Server"
3. Delete \`.nuxt\` folder and restart dev server

### Database Migration Failed

**Solutions**:
1. Check if tables already exist (run migration only once)
2. Verify SQL syntax in migration file
3. Check Supabase SQL Editor for error messages
4. Try running sections separately (tables, then RLS, then triggers, then seed data)

## Contributing

This is a personal finance tracking application. Contributions are welcome!

## License

MIT

## Support

For issues and questions:
1. Check this README thoroughly
2. Review Supabase documentation
3. Check Nuxt 3 documentation
4. Open an issue in the repository

---

**Built with ❤️ using Nuxt 3, TypeScript, TailwindCSS, and Supabase**

