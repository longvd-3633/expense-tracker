<script setup lang="ts">
import type { Component } from 'vue'
import type { Transaction } from '~/types/transaction'
import {
  Briefcase,
  ChartBar,
  TrendingUp,
  Gift,
  PlusCircle,
  Utensils,
  Car,
  Home,
  Bolt,
  Heart,
  Film,
  ShoppingBag,
  University,
  MoreHorizontal,
  Cake,
} from 'lucide-vue-next'

interface Props {
  transaction: Transaction
}

const props = defineProps<Props>()

const emit = defineEmits<{
  edit: [transaction: Transaction]
  delete: [transaction: Transaction]
}>()

const { formatCurrency, formatDate } = useFormatters()
const categoriesStore = useCategoriesStore()

const category = computed(() => {
  if (!props.transaction.category) return null
  return categoriesStore.getCategoryById(props.transaction.category)
})

const iconMap: Record<string, Component> = {
  'briefcase': Briefcase,
  'chart-bar': ChartBar,
  'trending-up': TrendingUp,
  'gift': Gift,
  'plus-circle': PlusCircle,
  'utensils': Utensils,
  'car': Car,
  'home': Home,
  'lightning-bolt': Bolt,
  'heart': Heart,
  'film': Film,
  'shopping-bag': ShoppingBag,
  'cake': Cake,
  'academic-cap': University,
  'dots-horizontal': MoreHorizontal,
}

const categoryIconComponent = computed(() => {
  const iconName = category.value?.icon
  return iconName ? iconMap[iconName] : undefined
})

const amountColor = computed(() => {
  return props.transaction.type === 'income' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
})

const amountPrefix = computed(() => {
  return props.transaction.type === 'income' ? '+' : '-'
})
</script>

<template>
  <div
    class="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-zinc-800 p-4 shadow-sm transition hover:shadow-lg dark:hover:shadow-zinc-900/50">
    <div class="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      <!-- Left: Category icon and info -->
      <div class="flex items-start space-x-3 flex-1">
        <div v-if="category" class="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
          :style="{ backgroundColor: category.color + '20' }">
          <component v-if="categoryIconComponent" :is="categoryIconComponent" class="h-5 w-5 text-current"
            aria-hidden="true" />
          <span v-else class="text-xl">
            {{ category?.icon || '📁' }}
          </span>
        </div>

        <div class="flex-1 min-w-0">
          <div class="flex items-center space-x-2">
            <h3 class="text-sm font-medium text-slate-900 dark:text-white">
              {{ category?.name || 'Không xác định' }}
            </h3>
            <span :class="[
              'px-2 py-0.5 text-xs font-medium rounded',
              transaction.type === 'income'
                ? 'bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-400'
                : 'bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-400',
            ]">
              {{ transaction.type === 'income' ? 'Thu' : 'Chi' }}
            </span>
          </div>

          <p v-if="transaction.description" class="mt-1 text-sm text-slate-600 dark:text-zinc-400 line-clamp-2">
            {{ transaction.description }}
          </p>

          <div class="mt-1 flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-zinc-500">
            <span>{{ formatDate(transaction.date) }}</span>
            <span v-if="transaction.tags && transaction.tags.length > 0" class="flex items-center space-x-1">
              <span>•</span>
              <span>{{ transaction.tags.join(', ') }}</span>
            </span>
          </div>
        </div>
      </div>

      <!-- Right: Amount and actions -->
      <div class="flex flex-col items-end space-y-2 md:ml-4">
        <span :class="['text-lg font-bold', amountColor]">
          {{ amountPrefix }}{{ formatCurrency(transaction.amount) }}
        </span>

        <div class="flex items-center space-x-1">
          <button
            class="p-1.5 text-slate-400 dark:text-zinc-500 hover:text-blue-600 dark:hover:text-blue-400 rounded transition-colors"
            title="Chỉnh sửa" @click="emit('edit', transaction)">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24"
              stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </button>

          <button
            class="p-1.5 text-slate-400 dark:text-zinc-500 hover:text-red-600 dark:hover:text-red-400 rounded transition-colors"
            title="Xóa" @click="emit('delete', transaction)">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24"
              stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
