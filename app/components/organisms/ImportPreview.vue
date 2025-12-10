<script setup lang="ts">
import type { ParseResult } from '~/utils/csv-import'
import type { ImportResult } from '~/composables/useCSVImport'

interface Props {
  parseResult: ParseResult
}

const props = defineProps<Props>()
const emit = defineEmits<{
  close: []
  complete: [result: ImportResult]
}>()

const { importTransactions, isImporting, importProgress } = useCSVImport()
const { formatCurrency, formatDate } = useFormatters()

const skipDuplicates = ref(true)
const showInvalidRows = ref(false)
const showDuplicateRows = ref(false)

// Summary stats
const totalValid = computed(() => props.parseResult.validRows.length)
const totalInvalid = computed(() => props.parseResult.invalidRows.length)
const totalDuplicates = computed(() => props.parseResult.duplicateRows.length)

const incomeCount = computed(() =>
  props.parseResult.validRows.filter(r => r.parsed?.type === 'income').length
)
const expenseCount = computed(() =>
  props.parseResult.validRows.filter(r => r.parsed?.type === 'expense').length
)

const totalAmount = computed(() => {
  return props.parseResult.validRows.reduce((sum, row) => {
    if (!row.parsed) return sum
    return sum + (row.parsed.type === 'income' ? row.parsed.amount : -row.parsed.amount)
  }, 0)
})

// Preview rows (first 10 valid rows)
const previewRows = computed(() => props.parseResult.validRows.slice(0, 10))

const handleImport = async () => {
  const allRows = [
    ...props.parseResult.validRows,
    ...props.parseResult.duplicateRows
  ]

  const result = await importTransactions(allRows, skipDuplicates.value)
  emit('complete', result)
}

const handleClose = () => {
  if (isImporting.value) return
  emit('close')
}

// Format file size
const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}
</script>

<template>
  <Teleport to="body">
    <Transition enter-active-class="transition ease-out duration-200" enter-from-class="opacity-0"
      enter-to-class="opacity-100" leave-active-class="transition ease-in duration-150" leave-from-class="opacity-100"
      leave-to-class="opacity-0">
      <div class="fixed inset-0 z-50 flex items-center justify-center px-4 py-6 overflow-y-auto">
        <!-- Backdrop -->
        <div class="absolute inset-0 bg-black bg-opacity-40" @click="handleClose" />

        <!-- Modal -->
        <div
          class="relative w-full max-w-4xl rounded-2xl bg-white dark:bg-zinc-900 p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
          <!-- Header -->
          <div class="flex items-start justify-between mb-6">
            <div>
              <h3 class="text-2xl font-bold text-slate-900 dark:text-white">Xem trước dữ liệu nhập</h3>
              <p class="text-sm text-slate-600 dark:text-zinc-400 mt-1">
                {{ parseResult.fileName }} ({{ formatFileSize(parseResult.fileSize) }})
              </p>
            </div>
            <button v-if="!isImporting" @click="handleClose"
              class="text-slate-400 dark:text-zinc-500 hover:text-slate-600 dark:hover:text-zinc-300 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24"
                stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <!-- Summary Stats -->
          <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div class="bg-slate-50 dark:bg-zinc-800 rounded-lg p-4">
              <p class="text-sm text-slate-600 dark:text-zinc-400">Tổng số dòng</p>
              <p class="text-2xl font-bold text-slate-900 dark:text-white">{{ parseResult.totalRows }}</p>
            </div>
            <div class="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
              <p class="text-sm text-green-700 dark:text-green-400">Hợp lệ</p>
              <p class="text-2xl font-bold text-green-600 dark:text-green-400">{{ totalValid }}</p>
            </div>
            <div class="bg-red-50 dark:bg-red-900/20 rounded-lg p-4">
              <p class="text-sm text-red-700 dark:text-red-400">Không hợp lệ</p>
              <p class="text-2xl font-bold text-red-600 dark:text-red-400">{{ totalInvalid }}</p>
            </div>
            <div class="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-4">
              <p class="text-sm text-yellow-700 dark:text-yellow-400">Trùng lặp</p>
              <p class="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{{ totalDuplicates }}</p>
            </div>
          </div>

          <!-- Financial Summary -->
          <div class="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 mb-6">
            <div class="grid grid-cols-3 gap-4">
              <div>
                <p class="text-sm text-blue-700 dark:text-blue-400">Thu</p>
                <p class="text-lg font-semibold text-blue-600 dark:text-blue-300">{{ incomeCount }} giao dịch</p>
              </div>
              <div>
                <p class="text-sm text-blue-700 dark:text-blue-400">Chi</p>
                <p class="text-lg font-semibold text-blue-600 dark:text-blue-300">{{ expenseCount }} giao dịch</p>
              </div>
              <div>
                <p class="text-sm text-blue-700 dark:text-blue-400">Tổng</p>
                <p class="text-lg font-semibold"
                  :class="totalAmount >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'">
                  {{ formatCurrency(Math.abs(totalAmount)) }}
                </p>
              </div>
            </div>
          </div>

          <!-- Preview Table -->
          <div v-if="previewRows.length > 0" class="mb-6">
            <h4 class="text-lg font-semibold text-slate-900 dark:text-white mb-3">
              Xem trước ({{ Math.min(10, totalValid) }}/{{ totalValid }} dòng đầu tiên)
            </h4>
            <div class="overflow-x-auto rounded-lg border border-slate-200 dark:border-zinc-700">
              <table class="w-full text-sm">
                <thead class="bg-slate-50 dark:bg-zinc-800">
                  <tr>
                    <th class="px-4 py-3 text-left text-xs font-semibold text-slate-700 dark:text-zinc-300 uppercase">
                      Ngày</th>
                    <th class="px-4 py-3 text-left text-xs font-semibold text-slate-700 dark:text-zinc-300 uppercase">
                      Loại</th>
                    <th class="px-4 py-3 text-right text-xs font-semibold text-slate-700 dark:text-zinc-300 uppercase">
                      Số tiền</th>
                    <th class="px-4 py-3 text-left text-xs font-semibold text-slate-700 dark:text-zinc-300 uppercase">
                      Danh mục</th>
                    <th class="px-4 py-3 text-left text-xs font-semibold text-slate-700 dark:text-zinc-300 uppercase">Mô
                      tả</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-slate-200 dark:divide-zinc-700">
                  <tr v-for="row in previewRows" :key="row.index" class="hover:bg-slate-50 dark:hover:bg-zinc-800">
                    <td class="px-4 py-3 whitespace-nowrap text-slate-900 dark:text-white">{{
                      formatDate(row.parsed!.date) }}</td>
                    <td class="px-4 py-3 whitespace-nowrap">
                      <span v-if="row.parsed!.type === 'income'"
                        class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400">
                        Thu
                      </span>
                      <span v-else
                        class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400">
                        Chi
                      </span>
                    </td>
                    <td class="px-4 py-3 text-right whitespace-nowrap font-medium text-slate-900 dark:text-white">
                      {{ formatCurrency(row.parsed!.amount) }}
                    </td>
                    <td class="px-4 py-3 text-slate-900 dark:text-white">{{ row.parsed!.category }}</td>
                    <td class="px-4 py-3 text-slate-600 dark:text-zinc-400">{{ row.parsed!.description || '-' }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <!-- Invalid Rows Section -->
          <div v-if="totalInvalid > 0" class="mb-6">
            <button @click="showInvalidRows = !showInvalidRows"
              class="flex items-center justify-between w-full bg-red-50 dark:bg-red-900/20 rounded-lg p-4 hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors">
              <div class="flex items-center gap-3">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-red-600 dark:text-red-400" fill="none"
                  viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span class="font-semibold text-red-700 dark:text-red-400">{{ totalInvalid }} dòng không hợp lệ</span>
              </div>
              <svg xmlns="http://www.w3.org/2000/svg"
                class="h-5 w-5 text-red-600 dark:text-red-400 transition-transform"
                :class="{ 'rotate-180': showInvalidRows }" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            <div v-if="showInvalidRows" class="mt-3 space-y-2">
              <div v-for="row in parseResult.invalidRows" :key="row.index"
                class="bg-white dark:bg-zinc-800 border border-red-200 dark:border-red-800 rounded-lg p-3">
                <div class="flex items-start justify-between">
                  <span class="text-sm font-medium text-slate-700 dark:text-zinc-300">Dòng {{ row.index + 2 }}</span>
                  <span class="text-xs text-red-600 dark:text-red-400">{{ row.errors.join(', ') }}</span>
                </div>
                <div class="text-xs text-slate-500 dark:text-zinc-500 mt-1">
                  {{ row.row.date }} | {{ row.row.type }} | {{ row.row.amount }} | {{ row.row.category }}
                </div>
              </div>
            </div>
          </div>

          <!-- Duplicate Rows Section -->
          <div v-if="totalDuplicates > 0" class="mb-6">
            <button @click="showDuplicateRows = !showDuplicateRows"
              class="flex items-center justify-between w-full bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-4 hover:bg-yellow-100 dark:hover:bg-yellow-900/30 transition-colors">
              <div class="flex items-center gap-3">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-yellow-600 dark:text-yellow-400" fill="none"
                  viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                <span class="font-semibold text-yellow-700 dark:text-yellow-400">{{ totalDuplicates }} giao dịch trùng
                  lặp</span>
              </div>
              <svg xmlns="http://www.w3.org/2000/svg"
                class="h-5 w-5 text-yellow-600 dark:text-yellow-400 transition-transform"
                :class="{ 'rotate-180': showDuplicateRows }" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            <div v-if="showDuplicateRows" class="mt-3 space-y-2">
              <div v-for="row in parseResult.duplicateRows" :key="row.index"
                class="bg-white dark:bg-zinc-800 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3">
                <div class="text-sm text-slate-700 dark:text-zinc-300">
                  Dòng {{ row.index + 2 }}: {{ formatDate(row.parsed!.date) }} | {{ row.parsed!.type === 'income' ?
                    'Thu' : 'Chi' }} | {{ formatCurrency(row.parsed!.amount) }} | {{ row.parsed!.category }}
                </div>
                <div class="text-xs text-slate-500 dark:text-zinc-500 mt-1">{{ row.parsed!.description }}</div>
              </div>
            </div>
          </div>

          <!-- Duplicate Handling Option -->
          <div v-if="totalDuplicates > 0" class="mb-6">
            <label class="flex items-center gap-3 cursor-pointer">
              <input v-model="skipDuplicates" type="checkbox"
                class="w-4 h-4 text-blue-600 rounded border-slate-300 dark:border-zinc-600 dark:bg-zinc-800">
              <span class="text-sm text-slate-700 dark:text-zinc-300">Bỏ qua các giao dịch trùng lặp (khuyến
                nghị)</span>
            </label>
          </div>

          <!-- Import Progress -->
          <div v-if="isImporting" class="mb-6">
            <div class="flex items-center justify-between mb-2">
              <span class="text-sm font-medium text-slate-700 dark:text-zinc-300">Đang nhập dữ liệu...</span>
              <span class="text-sm text-slate-600 dark:text-zinc-400">{{ importProgress }}%</span>
            </div>
            <div class="w-full bg-slate-200 dark:bg-zinc-700 rounded-full h-2">
              <div class="bg-blue-600 h-2 rounded-full transition-all duration-300"
                :style="{ width: `${importProgress}%` }" />
            </div>
          </div>

          <!-- Actions -->
          <div class="flex items-center justify-end gap-3">
            <button v-if="!isImporting" @click="handleClose"
              class="px-6 py-2 text-slate-700 dark:text-zinc-300 bg-slate-100 dark:bg-zinc-800 rounded-lg hover:bg-slate-200 dark:hover:bg-zinc-700 transition-colors">
              Hủy
            </button>
            <button @click="handleImport" :disabled="isImporting || totalValid === 0"
              class="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
              {{ isImporting ? 'Đang nhập...' : `Nhập ${totalValid} giao dịch` }}
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>
