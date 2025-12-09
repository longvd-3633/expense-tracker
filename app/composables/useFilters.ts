import { computed, ref } from 'vue'
import type { Transaction } from '~/types/transaction'

export type FilterType = 'all' | 'income' | 'expense'
export type FilterQueryValue = string | number | boolean
export type FilterQueryInput = Record<
  string,
  FilterQueryValue | FilterQueryValue[] | null | undefined
>

type QueryDictionary = Record<string, string>

export const useFilters = () => {
  const typeFilter = ref<FilterType>('all')
  const selectedCategories = ref<string[]>([])
  const startDate = ref<string | null>(null)
  const endDate = ref<string | null>(null)
  const minAmount = ref<number | null>(null)
  const maxAmount = ref<number | null>(null)
  const searchQuery = ref('')

  const hasActiveFilters = computed(() =>
    typeFilter.value !== 'all' ||
    selectedCategories.value.length > 0 ||
    !!startDate.value ||
    !!endDate.value ||
    minAmount.value !== null ||
    maxAmount.value !== null ||
    !!searchQuery.value.trim()
  )

  const buildQuery = (): QueryDictionary => {
    const query: QueryDictionary = {}

    if (typeFilter.value !== 'all') {
      query.type = typeFilter.value
    }

    if (selectedCategories.value.length) {
      query.categories = selectedCategories.value.join(',')
    }

    if (startDate.value) {
      query.startDate = startDate.value
    }

    if (endDate.value) {
      query.endDate = endDate.value
    }

    if (minAmount.value !== null && !Number.isNaN(minAmount.value)) {
      query.min = String(minAmount.value)
    }

    if (maxAmount.value !== null && !Number.isNaN(maxAmount.value)) {
      query.max = String(maxAmount.value)
    }

    if (searchQuery.value.trim().length) {
      query.search = searchQuery.value.trim()
    }

    return query
  }

  const queryString = computed(() => JSON.stringify(buildQuery()))

  const toStringValue = (value: FilterQueryValue | null | undefined) => {
    if (value === null || value === undefined) return null
    return String(value)
  }

  const expandCategoryList = (value: FilterQueryValue | FilterQueryValue[] | null | undefined) => {
    if (value === null || value === undefined) return [] as string[]
    const entries = Array.isArray(value) ? value : [value]
    return entries
      .map(toStringValue)
      .filter((entry): entry is string => entry !== null)
      .flatMap((entry) => entry.split(',').map((item) => item.trim()).filter(Boolean))
  }

  const ensureString = (value: FilterQueryValue | FilterQueryValue[] | null | undefined) => {
    if (value === null || value === undefined) return null
    return Array.isArray(value) ? toStringValue(value[0]) : toStringValue(value)
  }

  const setFromQuery = (query: FilterQueryInput) => {
    const rawCategories = query.categories
    const categoryList = expandCategoryList(rawCategories)

    selectedCategories.value = categoryList

    const rawType = ensureString(query.type)
    typeFilter.value = rawType === 'income' || rawType === 'expense' ? rawType : 'all'

    const rawStart = ensureString(query.startDate)
    startDate.value = rawStart

    const rawEnd = ensureString(query.endDate)
    endDate.value = rawEnd

    const parseNumber = (value: string | null | undefined) => {
      if (value === null || value === undefined || value === '') return null
      const parsed = Number(value)
      return Number.isNaN(parsed) ? null : parsed
    }

    const rawMin = ensureString(query.min)
    minAmount.value = parseNumber(rawMin)

    const rawMax = ensureString(query.max)
    maxAmount.value = parseNumber(rawMax)

    const rawSearch = ensureString(query.search)
    searchQuery.value = rawSearch ?? ''
  }

  const resetFilters = () => {
    typeFilter.value = 'all'
    selectedCategories.value = []
    startDate.value = null
    endDate.value = null
    minAmount.value = null
    maxAmount.value = null
    searchQuery.value = ''
  }

  const toggleCategory = (categoryId: string) => {
    if (!categoryId) return

    const next = [...selectedCategories.value]
    const index = next.indexOf(categoryId)
    if (index !== -1) {
      next.splice(index, 1)
    } else {
      next.push(categoryId)
    }

    selectedCategories.value = next
  }

  const filterTransactions = (
    transactions: Transaction[],
    resolveCategoryName?: (categoryId: string | null) => string | undefined,
  ) => {
    return transactions.filter((transaction) => {
      if (typeFilter.value !== 'all' && transaction.type !== typeFilter.value) {
        return false
      }

      if (selectedCategories.value.length && transaction.category) {
        if (!selectedCategories.value.includes(transaction.category)) {
          return false
        }
      } else if (selectedCategories.value.length && !transaction.category) {
        return false
      }

      if (startDate.value) {
        const startBoundary = new Date(startDate.value)
        startBoundary.setHours(0, 0, 0, 0)
        if (transaction.date < startBoundary) {
          return false
        }
      }

      if (endDate.value) {
        const endBoundary = new Date(endDate.value)
        endBoundary.setHours(23, 59, 59, 999)
        if (transaction.date > endBoundary) {
          return false
        }
      }

      if (minAmount.value !== null && transaction.amount < minAmount.value) {
        return false
      }

      if (maxAmount.value !== null && transaction.amount > maxAmount.value) {
        return false
      }

      if (searchQuery.value.trim()) {
        const keyword = searchQuery.value.trim().toLowerCase()
        const haystack = [
          transaction.description,
          resolveCategoryName?.(transaction.category) ?? '',
          transaction.tags?.join(' ') || '',
          transaction.type === 'income' ? 'thu' : 'chi',
        ]
          .join(' ')
          .toLowerCase()

        if (!haystack.includes(keyword)) {
          return false
        }
      }

      return true
    })
  }

  return {
    typeFilter,
    selectedCategories,
    startDate,
    endDate,
    minAmount,
    maxAmount,
    searchQuery,
    hasActiveFilters,
    filterTransactions,
    setFromQuery,
    resetFilters,
    toggleCategory,
    buildQuery,
    queryString,
  }
}
