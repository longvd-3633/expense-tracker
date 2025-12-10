<script setup lang="ts">
import type { RecurringTransaction } from '~/types/transaction'
import { formatRecurrencePattern } from '~/utils/recurrence'
import { format as formatDate } from 'date-fns'
import { vi } from 'date-fns/locale'

interface Props {
  templates: RecurringTransaction[]
  loading?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
})

const emit = defineEmits<{
  edit: [template: RecurringTransaction]
  delete: [templateId: string]
  skip: [templateId: string]
  viewDetails: [template: RecurringTransaction]
}>()

const categoriesStore = useCategoriesStore()

// Get category name
const getCategoryName = (categoryId: string): string => {
  const category = categoriesStore.categories.find(c => c.id === categoryId)
  return category?.name || 'Không xác định'
}

// Get category color
const getCategoryColor = (categoryId: string): string => {
  const category = categoriesStore.categories.find(c => c.id === categoryId)
  return category?.color || '#6B7280'
}

// Format amount
const formatAmount = (amount: number): string => {
  return new Intl.NumberFormat('vi-VN').format(amount) + ' ₫'
}

// Format next occurrence
const formatNextOccurrence = (date: Date): string => {
  return formatDate(date, 'dd/MM/yyyy (EEEE)', { locale: vi })
}

// Format pattern
const getPatternText = (template: RecurringTransaction): string => {
  return formatRecurrencePattern({
    frequency: template.frequency,
    interval: template.interval,
    weekdays: template.weekdays,
    monthlyType: template.monthlyType,
    monthlyDay: template.monthlyDay,
    monthlyWeekday: template.monthlyWeekday,
    monthlyWeekPosition: template.monthlyWeekPosition,
  })
}

// Handle actions
const handleEdit = (template: RecurringTransaction) => {
  emit('edit', template)
}

const handleDelete = (templateId: string) => {
  if (confirm('Bạn có chắc muốn xóa mẫu giao dịch định kỳ này? Các giao dịch đã tạo sẽ không bị xóa.')) {
    emit('delete', templateId)
  }
}

const handleSkip = (templateId: string) => {
  if (confirm('Bỏ qua lần lặp tiếp theo?')) {
    emit('skip', templateId)
  }
}
</script>

<template>
  <div class="space-y-4">
    <!-- Loading State -->
    <div v-if="loading" class="text-center py-8">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
      <p class="text-sm text-slate-500 dark:text-zinc-400 mt-2">Đang tải...</p>
    </div>

    <!-- Empty State -->
    <div v-else-if="templates.length === 0" class="text-center py-12">
      <svg class="w-16 h-16 text-slate-400 dark:text-zinc-600 mx-auto mb-4" fill="none" stroke="currentColor"
        viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      <h3 class="text-lg font-medium text-slate-900 dark:text-white mb-2">
        Chưa có giao dịch định kỳ
      </h3>
      <p class="text-sm text-slate-500 dark:text-zinc-400">
        Tạo mẫu giao dịch định kỳ để tự động thêm giao dịch hằng tháng
      </p>
    </div>

    <!-- Templates List -->
    <div v-else class="grid gap-4">
      <div v-for="template in templates" :key="template.id"
        class="bg-white dark:bg-zinc-900 rounded-lg border border-slate-200 dark:border-zinc-800 p-4 hover:shadow-md transition-shadow">
        <div class="flex items-start justify-between gap-4">
          <!-- Left: Template Info -->
          <div class="flex-1 min-w-0">
            <!-- Name & Type -->
            <div class="flex items-center gap-2 mb-2">
              <h3 class="text-lg font-semibold text-slate-900 dark:text-white truncate">
                {{ template.name }}
              </h3>
              <span :class="[
                'px-2 py-0.5 text-xs font-medium rounded',
                template.type === 'income'
                  ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                  : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
              ]">
                {{ template.type === 'income' ? 'Thu' : 'Chi' }}
              </span>
            </div>

            <!-- Amount -->
            <p :class="[
              'text-2xl font-bold mb-2',
              template.type === 'income' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
            ]">
              {{ template.type === 'income' ? '+' : '-' }}{{ formatAmount(template.amount) }}
            </p>

            <!-- Category -->
            <div class="flex items-center gap-2 mb-2">
              <span class="w-3 h-3 rounded-full"
                :style="{ backgroundColor: getCategoryColor(template.categoryId) }"></span>
              <span class="text-sm text-slate-600 dark:text-zinc-400">
                {{ getCategoryName(template.categoryId) }}
              </span>
            </div>

            <!-- Pattern -->
            <p class="text-sm text-slate-700 dark:text-zinc-300 mb-1">
              📅 {{ getPatternText(template) }}
            </p>

            <!-- Next Occurrence -->
            <p class="text-sm text-blue-600 dark:text-blue-400">
              Lần tiếp theo: {{ formatNextOccurrence(template.nextOccurrenceDate) }}
            </p>

            <!-- Occurrences Count -->
            <p class="text-xs text-slate-500 dark:text-zinc-400 mt-2">
              Đã tạo: {{ template.occurrencesGenerated }} giao dịch
              <span v-if="template.maxOccurrences">
                / {{ template.maxOccurrences }} lần
              </span>
            </p>

            <!-- Description -->
            <p v-if="template.description" class="text-sm text-slate-600 dark:text-zinc-400 mt-2 italic">
              {{ template.description }}
            </p>
          </div>

          <!-- Right: Actions -->
          <div class="flex flex-col gap-2">
            <button @click="handleEdit(template)"
              class="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition-colors"
              title="Chỉnh sửa">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </button>

            <button @click="handleSkip(template.id)"
              class="p-2 text-yellow-600 hover:bg-yellow-50 dark:hover:bg-yellow-900/20 rounded transition-colors"
              title="Bỏ qua lần tiếp theo">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 5l7 7-7 7M5 5l7 7-7 7" />
              </svg>
            </button>

            <button @click="emit('viewDetails', template)"
              class="p-2 text-slate-600 dark:text-zinc-400 hover:bg-slate-50 dark:hover:bg-zinc-800 rounded transition-colors"
              title="Xem chi tiết">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </button>

            <button @click="handleDelete(template.id)"
              class="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors" title="Xóa">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        </div>

        <!-- Auto-create status -->
        <div v-if="!template.autoCreate"
          class="mt-3 flex items-center gap-2 text-yellow-600 dark:text-yellow-400 text-sm">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <span>Không tự động tạo giao dịch</span>
        </div>
      </div>
    </div>
  </div>
</template>
