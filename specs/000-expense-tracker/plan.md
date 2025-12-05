# Technical Implementation Plan

**Project**: Expense Tracker  
**Version**: 2.0  
**Date**: December 5, 2025

## Executive Summary

Build a full-stack web application using Nuxt 3, TypeScript, TailwindCSS, and Supabase that enables users to track income/expenses, view financial summaries, and export data. All data stored securely in Supabase PostgreSQL with user authentication and multi-device sync. Deploy to Netlify for production hosting.

## Technology Stack

### Core Framework
- **Nuxt 3** (latest stable) - Full-stack Vue framework
  - Auto-imports for components, composables, utilities
  - File-based routing
  - Built-in TypeScript support
  - SSG/SPA mode for static hosting

### Language & Type System
- **TypeScript 5.x** - Strict mode enabled
  - Interface-driven development
  - Type-safe store, composables, components
  - Zero `any` types in production code

### UI & Styling
- **TailwindCSS 3.x** - Utility-first CSS
  - Custom theme with brand colors
  - Responsive design utilities
  - JIT compilation for minimal bundle
- **@nuxtjs/tailwindcss** - Official Nuxt module

### State Management
- **Pinia 2.x** - Vue official state management
  - Type-safe stores
  - Composition API style
  - DevTools integration
- **@pinia/nuxt** - Auto-import stores

### Backend & Database
- **Supabase** - Backend as a Service
  - PostgreSQL database (managed)
  - Authentication & authorization (JWT)
  - Row Level Security (RLS) policies
  - Real-time subscriptions (optional)
  - Auto-generated REST API
- **@nuxtjs/supabase** - Official Nuxt module
  - Auto-import Supabase client
  - Authentication composables
  - Server-side rendering support

### Browser Storage (For Settings Only)
- **VueUse** - Composition utilities collection
  - `useLocalStorage` for user preferences/settings
  - `useNow` for real-time date updates
  - TypeScript support built-in
  - Note: Transaction data stored in Supabase, not LocalStorage

### Date & Time
- **date-fns 3.x** - Modern date utility library
  - Tree-shakeable (only import what you use)
  - Immutable operations
  - i18n support for Vietnamese locale

### Data Visualization
- **Chart.js 4.x** - HTML5 canvas charts
  - Responsive and interactive
  - Line charts for trends
  - Pie/Doughnut for breakdowns
- **vue-chartjs 5.x** - Vue wrapper for Chart.js

### Data Import/Export
- **PapaParse 5.x** - CSV parsing library
  - UTF-8 BOM support for Excel compatibility
  - Streaming for large files
  - Robust error handling

### Validation
- **Zod 3.x** - TypeScript-first schema validation
  - Runtime type checking
  - Parse and transform user input
  - Composable with forms

## Architecture & Project Structure

### Directory Layout

```
expense-tracker/
├── app/                    # Nuxt 4 app directory
│   ├── app.vue            # Root component
│   ├── components/
│   │   ├── atoms/         # Basic UI elements
│   │   │   ├── Button.vue
│   │   │   ├── Input.vue
│   │   │   ├── Select.vue
│   │   │   └── DatePicker.vue
│   │   ├── molecules/     # Composite components
│   │   │   ├── TransactionCard.vue
│   │   │   ├── StatCard.vue
│   │   │   └── FilterBar.vue
│   │   └── organisms/     # Complex features
│   │       ├── TransactionForm.vue
│   │       ├── TransactionList.vue
│   │       ├── DashboardChart.vue
│   │       └── ExportButton.vue
│   ├── composables/
│   │   ├── useFormatters.ts      # Currency/date formatting
│   │   ├── useDateRange.ts       # Period calculations
│   │   ├── useCSVExport.ts       # Export logic
│   │   └── useFilters.ts         # Search & filter logic
│   ├── middleware/
│   │   └── auth.ts               # Authentication middleware
│   ├── layouts/
│   │   └── default.vue           # Main app layout
│   ├── pages/
│   │   ├── index.vue            # Dashboard
│   │   ├── login.vue            # Login page
│   │   ├── register.vue         # Registration page
│   │   ├── forgot-password.vue  # Password reset
│   │   ├── transactions/
│   │   │   └── index.vue        # Transactions list
│   │   └── settings.vue         # Settings page
│   ├── stores/
│   │   ├── transactions.ts      # Transaction CRUD
│   │   ├── categories.ts        # Category management
│   │   └── settings.ts          # User preferences
│   ├── types/
│   │   ├── transaction.ts       # Transaction interfaces
│   │   ├── category.ts          # Category interfaces
│   │   └── index.ts             # Re-exports
│   └── utils/
│       ├── validators.ts        # Zod schemas
│       └── constants.ts         # App constants
├── assets/
│   └── css/             # Global styles (if needed)
├── supabase/
│   └── migrations/      # Database migrations
├── nuxt.config.ts
├── tailwind.config.ts
├── tsconfig.json
├── package.json
└── README.md
```

### Data Models

#### Transaction
```typescript
interface Transaction {
  id: string;              // UUID v4 (from Supabase)
  userId: string;          // User ID (from Supabase Auth)
  date: Date;              // Transaction date
  type: 'income' | 'expense';
  amount: number;          // Positive number, cents precision
  category: string;        // Category ID reference
  description: string;     // User notes
  tags?: string[];         // Optional tags
  createdAt: Date;
  updatedAt: Date;
}
```

#### Category
```typescript
interface Category {
  id: string;              // UUID (from Supabase)
  userId?: string;         // User ID (null for default categories)
  name: string;
  type: 'income' | 'expense' | 'both';
  color: string;           // Hex color
  icon?: string;           // Icon identifier
  isDefault: boolean;      // System vs user-created
}
```

#### Settings
```typescript
interface UserSettings {
  userId: string;          // User ID
  currency: 'VND' | 'USD';
  dateFormat: 'DD/MM/YYYY' | 'YYYY-MM-DD';
  numberFormat: '1.000.000' | '1,000,000';
  defaultView: 'dashboard' | 'transactions';
  theme: 'light' | 'dark' | 'system';
}
```

### Database Strategy (Supabase)

#### Database Tables
- **transactions** - User transactions with RLS
- **categories** - Default + user custom categories with RLS
- **user_settings** - User preferences with RLS
- **auth.users** - Managed by Supabase Auth

#### Row Level Security (RLS) Policies
```sql
-- Users can only access their own data
CREATE POLICY "Users can view own transactions" ON transactions
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can create own transactions" ON transactions
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- Similar policies for categories and settings
```

#### Authentication Flow
1. User registers with email + password
2. Email verification sent (Supabase)
3. User logs in → JWT token stored in cookie
4. All API requests authenticated via JWT
5. RLS policies enforce data isolation

#### LocalStorage (Settings Only)
```typescript
const STORAGE_KEYS = {
  THEME_PREFERENCE: 'expense-tracker:theme',  // UI theme only
} as const;
```

#### Data Versioning
```typescript
interface StoredData<T> {
  version: string;        // Semantic version: "1.0.0"
  data: T;
  lastModified: string;   // ISO timestamp
}
```

### State Management Pattern

#### Store Structure (Pinia + Supabase)
```typescript
// app/stores/transactions.ts
export const useTransactionsStore = defineStore('transactions', () => {
  const supabase = useSupabaseClient();
  const user = useSupabaseUser();
  
  // State (reactive refs)
  const transactions = ref<Transaction[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);
  
  // Getters (computed)
  const sortedTransactions = computed(() => 
    [...transactions.value].sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    )
  );
  const totalIncome = computed(() => 
    transactions.value
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0)
  );
  const totalExpense = computed(() => 
    transactions.value
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0)
  );
  
  // Actions (methods)
  async function fetchTransactions() {
    loading.value = true;
    error.value = null;
    try {
      const { data, error: fetchError } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', user.value?.id)
        .order('date', { ascending: false });
      
      if (fetchError) throw fetchError;
      transactions.value = data || [];
    } catch (e) {
      error.value = e.message;
    } finally {
      loading.value = false;
    }
  }
  
  async function addTransaction(input: TransactionInput) {
    const { data, error: insertError } = await supabase
      .from('transactions')
      .insert({ ...input, user_id: user.value?.id })
      .select()
      .single();
    
    if (insertError) throw insertError;
    transactions.value.push(data);
    return data;
  }
  
  async function updateTransaction(id: string, updates: Partial<Transaction>) {
    const { data, error: updateError } = await supabase
      .from('transactions')
      .update(updates)
      .eq('id', id)
      .eq('user_id', user.value?.id)
      .select()
      .single();
    
    if (updateError) throw updateError;
    const index = transactions.value.findIndex(t => t.id === id);
    if (index !== -1) transactions.value[index] = data;
    return data;
  }
  
  async function deleteTransaction(id: string) {
    const { error: deleteError } = await supabase
      .from('transactions')
      .delete()
      .eq('id', id)
      .eq('user_id', user.value?.id);
    
    if (deleteError) throw deleteError;
    transactions.value = transactions.value.filter(t => t.id !== id);
  }
  
  return {
    transactions,
    loading,
    error,
    sortedTransactions,
    totalIncome,
    totalExpense,
    addTransaction,
    updateTransaction,
    deleteTransaction
  };
});
```

### Component Architecture

#### Atomic Design Hierarchy

**Atoms** (primitives)
- `Button.vue` - Styled button variants
- `Input.vue` - Form inputs with validation states
- `Select.vue` - Dropdown select
- `DatePicker.vue` - Native date input with formatting

**Molecules** (composites)
- `TransactionCard.vue` - Display single transaction
- `StatCard.vue` - Dashboard summary card
- `FilterBar.vue` - Multi-filter controls

**Organisms** (features)
- `TransactionForm.vue` - Add/edit transaction modal
- `TransactionList.vue` - Paginated transaction list
- `DashboardChart.vue` - Chart.js wrapper with data

#### Component Communication
- **Props down**: Parent passes data to children
- **Events up**: Children emit events to parent
- **Store for shared state**: Transactions, categories, settings
- **Composables for logic**: Reusable business logic

### Routing Strategy

```typescript
// Auto-generated by Nuxt from /app/pages
routes: [
  { path: '/', component: 'app/pages/index.vue' },              // Dashboard
  { path: '/transactions', component: 'app/pages/transactions/index.vue' },
  { path: '/settings', component: 'app/pages/settings.vue' }
]
```

### Composables Pattern

#### useFormatters
```typescript
export const useFormatters = () => {
  const settingsStore = useSettingsStore();
  
  const formatCurrency = (amount: number): string => {
    // Use settings.currency and settings.numberFormat
  };
  
  const formatDate = (date: Date): string => {
    // Use settings.dateFormat
  };
  
  return { formatCurrency, formatDate };
};
```

#### useDateRange
```typescript
export const useDateRange = () => {
  const currentPeriod = ref<'daily' | 'weekly' | 'monthly'>('monthly');
  const currentDate = ref(new Date());
  
  const dateRange = computed(() => {
    // Calculate start/end based on period
  });
  
  const goToNext = () => { /* ... */ };
  const goToPrevious = () => { /* ... */ };
  
  return { currentPeriod, dateRange, goToNext, goToPrevious };
};
```

## Feature Implementation Details

### P1: Core MVP Features

#### 1. Transaction Management

**Components**
- `TransactionForm.vue` - Modal with form validation
- `TransactionCard.vue` - Display with edit/delete actions
- `TransactionList.vue` - Scrollable list with empty states

**Store Actions**
```typescript
addTransaction(input: TransactionInput): Transaction
updateTransaction(id: string, updates: Partial<Transaction>): void
deleteTransaction(id: string): void
getTransactionById(id: string): Transaction | undefined
```

**Validation Schema (Zod)**
```typescript
const TransactionSchema = z.object({
  date: z.date(),
  type: z.enum(['income', 'expense']),
  amount: z.number().positive().multipleOf(0.01),
  category: z.string().min(1),
  description: z.string().max(500),
  tags: z.array(z.string()).optional()
});
```

#### 2. Dashboard

**Layout**
- 3-column grid (mobile: stacked)
- Summary cards: Income, Expense, Balance
- Period selector: Daily, Weekly, Monthly
- Date navigation: Prev/Next buttons
- Recent transactions list (10 items)

**Computed Properties**
```typescript
periodTransactions = computed(() => {
  return transactionsStore.getTransactionsByDateRange(
    dateRange.value.start,
    dateRange.value.end
  );
});

periodIncome = computed(() => 
  periodTransactions.value
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0)
);
```

#### 3. CSV Export

**Export Format**
```csv
"Date","Type","Amount","Category","Description","Tags"
"04/12/2025","Chi","150000","Ăn uống","Lunch at cafe",""
"03/12/2025","Thu","5000000","Lương","Monthly salary",""
```

**Implementation**
```typescript
export const useCSVExport = () => {
  const categoriesStore = useCategoriesStore();
  
  const exportTransactions = (transactions: Transaction[]) => {
    const csv = Papa.unparse(transactions.map(t => ({
      'Date': formatDate(t.date),
      'Type': t.type === 'income' ? 'Thu' : 'Chi',
      'Amount': t.amount,
      'Category': categoriesStore.getCategoryById(t.category)?.name,
      'Description': t.description,
      'Tags': t.tags?.join(', ') || ''
    })));
    
    // Add UTF-8 BOM for Excel
    const bom = '\uFEFF';
    const blob = new Blob([bom + csv], { type: 'text/csv;charset=utf-8;' });
    
    // Trigger download
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `expense-tracker-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };
  
  return { exportTransactions };
};
```

### P2: Enhanced Features

#### 4. Filtering & Search

**Filter State**
```typescript
interface FilterState {
  types: ('income' | 'expense' | 'all')[];
  categories: string[];
  dateRange: { start: Date; end: Date } | null;
  amountRange: { min: number; max: number } | null;
  searchQuery: string;
}
```

**Implementation**
```typescript
const filteredTransactions = computed(() => {
  let result = transactionsStore.transactions;
  
  // Filter by type
  if (filters.types.length && !filters.types.includes('all')) {
    result = result.filter(t => filters.types.includes(t.type));
  }
  
  // Filter by categories
  if (filters.categories.length) {
    result = result.filter(t => filters.categories.includes(t.category));
  }
  
  // Filter by date range
  if (filters.dateRange) {
    result = result.filter(t => 
      t.date >= filters.dateRange.start && 
      t.date <= filters.dateRange.end
    );
  }
  
  // Search in description
  if (filters.searchQuery) {
    const query = filters.searchQuery.toLowerCase();
    result = result.filter(t => 
      t.description.toLowerCase().includes(query)
    );
  }
  
  return result;
});
```

#### 5. Charts Visualization

**Chart Configuration**
```typescript
// Line chart: Income vs Expense over time
const lineChartData = computed(() => ({
  labels: dateLabels.value,
  datasets: [
    {
      label: 'Thu nhập',
      data: incomeByDate.value,
      borderColor: '#10B981',
      backgroundColor: 'rgba(16, 185, 129, 0.1)'
    },
    {
      label: 'Chi tiêu',
      data: expenseByDate.value,
      borderColor: '#EF4444',
      backgroundColor: 'rgba(239, 68, 68, 0.1)'
    }
  ]
}));

// Pie chart: Expense by category
const pieChartData = computed(() => ({
  labels: categoryNames.value,
  datasets: [{
    data: expenseByCategory.value,
    backgroundColor: categoryColors.value
  }]
}));
```

### P3: Future Enhancements

#### 6. Custom Categories
- Add/edit/delete custom categories
- Validation: prevent deletion if in use
- Color picker integration

#### 7. CSV Import
- File upload with validation
- Preview before import
- Duplicate detection
- Error reporting

#### 8. Settings Page
- Currency selection
- Date/number format toggles
- Default view preference
- Reset to defaults button

## Build & Deployment

### Development
```bash
npm run dev          # Start dev server
npm run build        # Build for production
npm run preview      # Preview production build
```

### Production Build
- **Mode**: Static Site Generation (SSG)
- **Output**: `.output/public` directory
- **Hosting**: Any static host (Vercel, Netlify, GitHub Pages)

### Build Optimization
```typescript
// nuxt.config.ts
export default defineNuxtConfig({
  nitro: {
    preset: 'static'
  },
  
  vite: {
    build: {
      chunkSizeWarningLimit: 600,
      rollupOptions: {
        output: {
          manualChunks: {
            'chart': ['chart.js', 'vue-chartjs']
          }
        }
      }
    }
  }
});
```

## Performance Optimizations

### Code Splitting
- Lazy load Chart.js components
- Route-based code splitting (automatic with Nuxt)
- Dynamic imports for heavy features

### Asset Optimization
- TailwindCSS JIT for minimal CSS
- Tree-shaking unused date-fns functions
- Image optimization (if adding images later)

### Runtime Performance
- Virtual scrolling for long transaction lists (>100 items)
- Debounced search input (300ms)
- Memoized computed properties
- LocalStorage access optimization

## Browser Compatibility

### Target Browsers
- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile Safari 14+
- Chrome Mobile 90+

### Polyfills
None required - using only modern ES2020+ features supported by target browsers.

### Feature Detection
```typescript
// Check LocalStorage availability
const hasLocalStorage = (() => {
  try {
    localStorage.setItem('test', 'test');
    localStorage.removeItem('test');
    return true;
  } catch {
    return false;
  }
})();
```

## Security Considerations

### Input Sanitization
```typescript
// Sanitize user input before storage
const sanitizeDescription = (input: string): string => {
  return input
    .trim()
    .replace(/<script[^>]*>.*?<\/script>/gi, '') // Remove scripts
    .substring(0, 500); // Limit length
};
```

### Content Security Policy
```typescript
// nuxt.config.ts
app: {
  head: {
    meta: [
      {
        'http-equiv': 'Content-Security-Policy',
        content: "default-src 'self'; script-src 'self' 'unsafe-inline'"
      }
    ]
  }
}
```

## Error Handling Strategy

### User-Facing Errors
```typescript
try {
  transactionsStore.addTransaction(input);
  showSuccess('Transaction added successfully');
} catch (error) {
  if (error instanceof ValidationError) {
    showError('Please check your input and try again');
  } else {
    showError('Something went wrong. Please try again');
    console.error('Transaction error:', error);
  }
}
```

### Storage Errors
```typescript
// Handle quota exceeded
try {
  localStorage.setItem(key, value);
} catch (error) {
  if (error.name === 'QuotaExceededError') {
    showError('Storage limit reached. Please export and clear old data');
  }
}
```

## Testing Strategy

### Type Checking
```bash
npx nuxi typecheck    # Run TypeScript compiler
```

### Manual Testing Checklist
- [ ] Add transaction (income/expense)
- [ ] Edit transaction
- [ ] Delete transaction with confirmation
- [ ] View dashboard with different periods
- [ ] Filter transactions by category/type
- [ ] Search transactions
- [ ] Export to CSV
- [ ] Change settings
- [ ] Test mobile responsive
- [ ] Test LocalStorage persistence
- [ ] Test with 100+ transactions

### Future Automated Testing
- **Unit**: Vitest for composables, utils
- **Component**: Vue Test Utils
- **E2E**: Playwright for critical paths

## Migration & Data Management

### Schema Versioning
```typescript
const CURRENT_VERSION = '1.0.0';

const migrateData = (stored: StoredData<any>) => {
  if (stored.version === CURRENT_VERSION) {
    return stored.data;
  }
  
  // Run migrations
  let data = stored.data;
  if (stored.version < '1.1.0') {
    data = migrateToV1_1(data);
  }
  
  return data;
};
```

### Backup & Restore
- Export creates full backup
- Import validates and merges data
- Duplicate detection by date + amount + description

## Development Timeline

### Phase 1: Foundation (Day 1)
- ✅ Project setup
- ✅ TypeScript types
- ✅ Pinia stores
- ✅ Composables
- ✅ Basic layouts

### Phase 2: Core Features (Day 2)
- ✅ Transaction CRUD
- ✅ Dashboard
- ✅ Categories
- ✅ CSV Export

### Phase 3: Enhancement (Day 3)
- 🔨 Filters & Search
- 🔨 Charts
- 🔨 Settings

### Phase 4: Polish (Day 4)
- ⏳ Mobile optimization
- ⏳ Error handling
- ⏳ Documentation
- ⏳ Testing

## Success Criteria

### Technical
- ✅ Zero TypeScript errors
- ✅ Lighthouse Performance > 90
- ✅ Bundle size < 500KB gzipped
- ✅ Works offline after first load

### Functional
- ✅ All P1 features working
- ✅ Data persists correctly
- ✅ CSV export successful
- ✅ Responsive on mobile/desktop

### User Experience
- ✅ First transaction in < 60 seconds
- ✅ No console errors
- ✅ Intuitive navigation
- ✅ Fast interactions (< 100ms)

---

**This plan provides the technical foundation for building the Expense Tracker according to the specification and constitution.**
