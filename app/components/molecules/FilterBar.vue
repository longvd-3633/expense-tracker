<template>
  <section class="rounded-2xl border border-slate-200 bg-white/90 p-4 shadow-sm backdrop-blur">
    <div class="flex flex-wrap items-start gap-4">
      <div class="flex flex-col gap-2">
        <span class="text-xs font-semibold uppercase tracking-[0.1em] text-slate-500">Loại</span>
        <div class="flex gap-2">
          <button v-for="option in typeOptions" :key="option.value" type="button"
            :class="['rounded-full px-4 py-1.5 text-xs font-semibold transition', option.value === typeFilter ? 'border-blue-600 bg-blue-50 text-blue-600' : 'border-slate-200 bg-white text-slate-500 hover:border-slate-400 hover:text-slate-600']"
            class="border" @click="selectType(option.value)">
            {{ option.label }}
          </button>
        </div>
      </div>

      <div class="flex-1 min-w-[220px]">
        <span class="text-xs font-semibold uppercase tracking-[0.1em] text-slate-500">Danh mục</span>
        <div class="mt-2 flex flex-wrap gap-2">
          <button v-for="category in categories" :key="category.id" type="button"
            class="flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold transition"
            :class="selectedCategories.includes(category.id) ? 'border-blue-600 bg-blue-50 text-blue-600' : 'border-slate-200 bg-white text-slate-600 hover:border-blue-300'"
            @click="selectCategory(category.id)">
            <span class="h-2.5 w-2.5 rounded-full" :style="{ backgroundColor: category.color || '#CBD5F5' }" />
            {{ category.name }}
          </button>
        </div>
      </div>
    </div>

    <div class="mt-4 grid gap-3 md:grid-cols-2 lg:grid-cols-4">
      <label class="flex flex-col gap-1 text-xs font-semibold text-slate-500">
        Từ ngày
        <input type="date"
          class="rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-800 outline-none transition focus:border-blue-500"
          :value="startDate ?? ''" @input="handleDateInput('start', $event)" />
      </label>

      <label class="flex flex-col gap-1 text-xs font-semibold text-slate-500">
        Đến ngày
        <input type="date"
          class="rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-800 outline-none transition focus:border-blue-500"
          :value="endDate ?? ''" @input="handleDateInput('end', $event)" />
      </label>

      <label class="flex flex-col gap-1 text-xs font-semibold text-slate-500">
        Số tiền từ
        <input type="number" min="0" step="1000"
          class="rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-800 outline-none transition focus:border-blue-500"
          :value="minAmount ?? ''" @input="handleAmountInput('min', $event)" />
      </label>

      <label class="flex flex-col gap-1 text-xs font-semibold text-slate-500">
        Đến
        <input type="number" min="0" step="1000"
          class="rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-800 outline-none transition focus:border-blue-500"
          :value="maxAmount ?? ''" @input="handleAmountInput('max', $event)" />
      </label>

      <label class="flex flex-col gap-1 text-xs font-semibold text-slate-500 md:col-span-2">
        Tìm theo nội dung
        <SearchInput :model-value="searchQuery ?? ''" placeholder="Tìm mô tả, ghi chú hoặc danh mục" :debounce="300"
          @update:model-value="handleSearchChange" />
      </label>
    </div>

    <div class="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 pt-3">
      <p class="text-sm font-semibold text-slate-600">
        Hiển thị
        <span class="text-lg text-slate-900">{{ resultCount ?? 0 }}</span>
        giao dịch
      </p>
      <button type="button"
        class="rounded-2xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 transition hover:border-slate-400 hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-60"
        :disabled="!hasActiveFilters" @click="clearFilters">
        Xóa bộ lọc
      </button>
    </div>
  </section>
</template>

<script setup lang="ts">
import { toRefs } from 'vue'
import SearchInput from '~/components/atoms/SearchInput.vue'
import type { Category } from '~/types/category'

type FilterType = 'all' | 'income' | 'expense'

const props = withDefaults(
  defineProps<{
    categories: Category[]
    selectedCategories: string[]
    typeFilter: FilterType
    startDate?: string | null
    endDate?: string | null
    minAmount?: number | null
    maxAmount?: number | null
    searchQuery?: string
    resultCount?: number
    hasActiveFilters?: boolean
    onTypeChange?: (value: FilterType) => void
    onCategoryToggle?: (categoryId: string) => void
    onStartDateChange?: (value: string | null) => void
    onEndDateChange?: (value: string | null) => void
    onMinAmountChange?: (value: number | null) => void
    onMaxAmountChange?: (value: number | null) => void
    onSearchChange?: (value: string) => void
    onClear?: () => void
  }>(),
  {
    categories: () => [],
    selectedCategories: () => [],
    typeFilter: 'all',
    resultCount: 0,
    hasActiveFilters: false,
  },
)

const typeOptions: Array<{ label: string; value: FilterType }> = [
  { label: 'Tất cả', value: 'all' },
  { label: 'Thu', value: 'income' },
  { label: 'Chi', value: 'expense' },
]

const handleDateInput = (mode: 'start' | 'end', event: Event) => {
  const value = (event.target as HTMLInputElement).value
  if (mode === 'start') {
    props.onStartDateChange?.(value || null)
  } else {
    props.onEndDateChange?.(value || null)
  }
}

const handleAmountInput = (mode: 'min' | 'max', event: Event) => {
  const value = (event.target as HTMLInputElement).value
  const parsed = value ? Number(value) : null
  const numericValue = Number.isNaN(parsed) ? null : parsed
  if (mode === 'min') {
    props.onMinAmountChange?.(numericValue)
  } else {
    props.onMaxAmountChange?.(numericValue)
  }
}

const handleSearchChange = (value: string) => {
  props.onSearchChange?.(value)
}

const selectType = (value: FilterType) => props.onTypeChange?.(value)
const selectCategory = (categoryId: string) => props.onCategoryToggle?.(categoryId)
const clearFilters = () => props.onClear?.()

const { categories, selectedCategories, typeFilter, startDate, endDate, minAmount, maxAmount, searchQuery, resultCount, hasActiveFilters } = toRefs(props)
</script>
