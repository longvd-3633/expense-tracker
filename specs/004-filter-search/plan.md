# US4: Filter & Search - Technical Implementation Plan

**Feature**: Transaction Filtering and Search  
**Version**: 1.0  
**Date**: December 9, 2025

## Executive Summary

Implement client-side filtering and search for transactions with URL state persistence. Use Vue 3 composition API, reactive filtering, debounced search, and Nuxt's router for URL sync.

## Technology Stack

### Core Technologies
- **Vue 3 Composition API** - Reactive filter state
- **Nuxt 3 Router** - URL query param management
- **VueUse** - `useDebounceFn`, `useUrlSearchParams`
- **date-fns** - Date range calculations

### Components & Composables
- `useFilters.ts` - Filter state and logic composable
- `FilterBar.vue` - Main filter UI component
- `SearchInput.vue` - Debounced search input atom

## Architecture

### Data Flow

```
User Input → FilterBar.vue → useFilters.ts → URL Sync → Filtered Transactions → TransactionList.vue
```

### Filter State Management

```typescript
// app/composables/useFilters.ts
export interface FilterState {
  type: 'all' | 'income' | 'expense'
  categoryIds: string[]
  dateRange: {
    start: Date | null
    end: Date | null
    preset: 'today' | 'week' | 'month' | 'last30' | 'last90' | 'custom'
  }
  amountRange: {
    min: number | null
    max: number | null
  }
  searchQuery: string
}

export function useFilters() {
  const route = useRoute()
  const router = useRouter()
  const transactionsStore = useTransactionsStore()
  
  // Initialize from URL or defaults
  const filters = ref<FilterState>(getFiltersFromURL())
  
  // Computed filtered transactions
  const filteredTransactions = computed(() => {
    return filterTransactions(transactionsStore.transactions, filters.value)
  })
  
  // Sync to URL (throttled)
  watch(filters, syncToURL, { deep: true, throttle: 500 })
  
  return {
    filters,
    filteredTransactions,
    clearFilters,
    setTypeFilter,
    setCategoryFilter,
    setDateRangeFilter,
    setAmountRangeFilter,
    setSearchQuery
  }
}
```

### URL Sync Strategy

**Serialize filters to URL:**
```typescript
function syncToURL(filters: FilterState) {
  const query: Record<string, string> = {}
  
  if (filters.type !== 'all') query.type = filters.type
  if (filters.categoryIds.length > 0) {
    query.categories = filters.categoryIds.join(',')
  }
  if (filters.dateRange.start) {
    query.startDate = format(filters.dateRange.start, 'yyyy-MM-dd')
  }
  if (filters.dateRange.end) {
    query.endDate = format(filters.dateRange.end, 'yyyy-MM-dd')
  }
  if (filters.amountRange.min !== null) {
    query.minAmount = filters.amountRange.min.toString()
  }
  if (filters.amountRange.max !== null) {
    query.maxAmount = filters.amountRange.max.toString()
  }
  if (filters.searchQuery) {
    query.search = filters.searchQuery
  }
  
  router.replace({ query })
}
```

**Deserialize URL to filters:**
```typescript
function getFiltersFromURL(): FilterState {
  const query = route.query
  
  return {
    type: (query.type as string) || 'all',
    categoryIds: query.categories 
      ? (query.categories as string).split(',')
      : [],
    dateRange: {
      start: query.startDate ? parseISO(query.startDate as string) : null,
      end: query.endDate ? parseISO(query.endDate as string) : null,
      preset: 'custom'
    },
    amountRange: {
      min: query.minAmount ? Number(query.minAmount) : null,
      max: query.maxAmount ? Number(query.maxAmount) : null
    },
    searchQuery: (query.search as string) || ''
  }
}
```

## Component Structure

### FilterBar.vue (Molecule)

```vue
<template>
  <div class="filter-bar">
    <!-- Mobile: Collapsible -->
    <div v-if="isMobile" class="mobile-filter-toggle">
      <button @click="toggleFilters">
        <IconFilter />
        Bộ lọc
        <span v-if="activeFilterCount > 0" class="badge">
          {{ activeFilterCount }}
        </span>
      </button>
    </div>
    
    <!-- Filter Controls -->
    <div v-show="!isMobile || showFilters" class="filter-controls">
      <!-- Type Filter -->
      <div class="filter-group">
        <label>Loại giao dịch</label>
        <div class="button-group">
          <button
            v-for="type in typeOptions"
            :key="type.value"
            :class="{ active: filters.type === type.value }"
            @click="setTypeFilter(type.value)"
          >
            {{ type.label }}
          </button>
        </div>
      </div>
      
      <!-- Category Filter -->
      <div class="filter-group">
        <label>Danh mục</label>
        <CategoryMultiSelect
          v-model="filters.categoryIds"
          :categories="allCategories"
        />
      </div>
      
      <!-- Date Range Filter -->
      <div class="filter-group">
        <label>Khoảng thời gian</label>
        <DateRangePresets v-model="filters.dateRange" />
      </div>
      
      <!-- Amount Range Filter -->
      <div class="filter-group">
        <label>Khoảng số tiền</label>
        <div class="amount-range">
          <Input
            v-model.number="filters.amountRange.min"
            type="number"
            placeholder="Tối thiểu"
          />
          <span>-</span>
          <Input
            v-model.number="filters.amountRange.max"
            type="number"
            placeholder="Tối đa"
          />
        </div>
      </div>
      
      <!-- Search -->
      <div class="filter-group">
        <label>Tìm kiếm</label>
        <SearchInput
          v-model="filters.searchQuery"
          placeholder="Tìm theo mô tả..."
        />
      </div>
      
      <!-- Actions -->
      <div class="filter-actions">
        <button @click="clearFilters" class="btn-secondary">
          Xóa bộ lọc
        </button>
        <span class="results-count">
          {{ filteredCount }} giao dịch
        </span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useFilters } from '~/composables/useFilters'

const { filters, filteredTransactions, clearFilters, setTypeFilter } = useFilters()
const isMobile = ref(window.innerWidth < 768)
const showFilters = ref(!isMobile.value)

const activeFilterCount = computed(() => {
  let count = 0
  if (filters.value.type !== 'all') count++
  if (filters.value.categoryIds.length > 0) count++
  if (filters.value.dateRange.start || filters.value.dateRange.end) count++
  if (filters.value.amountRange.min !== null || filters.value.amountRange.max !== null) count++
  if (filters.value.searchQuery) count++
  return count
})

const filteredCount = computed(() => filteredTransactions.value.length)
</script>
```

### SearchInput.vue (Atom)

```vue
<template>
  <div class="search-input">
    <IconSearch class="search-icon" />
    <input
      :value="modelValue"
      @input="onInput"
      type="text"
      :placeholder="placeholder"
      class="input"
    />
    <button
      v-if="modelValue"
      @click="clear"
      class="clear-btn"
      aria-label="Clear search"
    >
      <IconX />
    </button>
  </div>
</template>

<script setup lang="ts">
import { useDebounceFn } from '@vueuse/core'

interface Props {
  modelValue: string
  placeholder?: string
  debounce?: number
}

const props = withDefaults(defineProps<Props>(), {
  placeholder: 'Search...',
  debounce: 300
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const debouncedUpdate = useDebounceFn((value: string) => {
  emit('update:modelValue', value)
}, props.debounce)

const onInput = (e: Event) => {
  const target = e.target as HTMLInputElement
  debouncedUpdate(target.value)
}

const clear = () => {
  emit('update:modelValue', '')
}
</script>
```

## Implementation Phases

### Phase 1: Core Composable (T150-T153)
1. Create `useFilters.ts` with reactive state
2. Implement `filterTransactions()` function
3. Add URL sync logic (serialize/deserialize)
4. Add `clearFilters()` helper

### Phase 2: UI Components (T154-T163)
1. Create `SearchInput.vue` with debounce
2. Create `FilterBar.vue` with all filter controls
3. Add responsive layout (mobile collapse)
4. Style components with Tailwind

### Phase 3: Integration (T164-T168)
1. Add `FilterBar` to transactions page
2. Pass `filteredTransactions` to `TransactionList`
3. Connect all filter controls
4. Test URL sync on mount and updates

### Phase 4: Testing (T169-T176)
1. Test individual filters
2. Test combined filters
3. Test URL sync and sharing
4. Test mobile responsive behavior

## Performance Optimizations

### Client-Side Filtering
- Use `computed()` for reactive filtering
- Memoize filter results
- Max 1000 transactions (pagination recommended if exceeded)

### Search Debouncing
```typescript
const debouncedSearch = useDebounceFn(
  (query: string) => {
    filters.value.searchQuery = query
  },
  300
)
```

### URL Sync Throttling
```typescript
watch(
  filters,
  () => syncToURL(filters.value),
  { deep: true, flush: 'post', throttle: 500 }
)
```

## Edge Cases

### Invalid URL Parameters
- Invalid date format → Ignore, use defaults
- Invalid category IDs → Filter out non-existent
- Invalid amount range (min > max) → Swap values
- Malformed query string → Reset to defaults

### Empty States
- No transactions match filters → Show empty state with "Clear filters" CTA
- No categories selected → Treat as "all categories"
- No date range → Show all dates

### Mobile UX
- Collapse filter bar by default
- Show active filter count badge
- Expand accordion on filter button click
- Sticky filter bar on scroll (optional)

## File Structure

```
app/
├── composables/
│   └── useFilters.ts           # Filter state and logic
├── components/
│   ├── atoms/
│   │   └── SearchInput.vue     # Debounced search input
│   └── molecules/
│       └── FilterBar.vue       # Complete filter UI
└── pages/
    └── transactions/
        └── index.vue           # Integration point
```

## Dependencies

**Existing:**
- Nuxt 3 router
- VueUse (`useDebounceFn`)
- date-fns (date parsing/formatting)
- Pinia (transactions store)

**New:**
- None (all required dependencies already installed)

## Testing Strategy

### Unit Tests
- `useFilters.ts`: Filter logic, URL serialization
- `SearchInput.vue`: Debounce behavior

### Integration Tests
- FilterBar + TransactionList integration
- URL sync accuracy
- Mobile responsive behavior

### Manual Tests
- Apply filters, verify results
- Share URL, verify filters restore
- Clear filters, verify reset
- Mobile: Collapse/expand behavior
