<script setup lang="ts">
import type { Transaction } from '~/types/transaction'

interface Props {
  transactions: Transaction[]
  filteredTransactions: Transaction[]
  isFiltered: boolean
}

const props = defineProps<Props>()

const { exportTransactions } = useCSVExport()
const isExporting = ref(false)
const showExportMenu = ref(false)

const exportAll = async () => {
  try {
    isExporting.value = true
    showExportMenu.value = false

    exportTransactions(props.transactions)

    // Show success toast
    const count = props.transactions.length
    // TODO: Replace with toast notification component when available
    console.log(`Đã xuất ${count} giao dịch`)

  } catch (error) {
    console.error('Export error:', error)
    // TODO: Replace with error toast notification
  } finally {
    // Small delay to show loading state
    await new Promise(resolve => setTimeout(resolve, 300))
    isExporting.value = false
  }
}

const exportFiltered = async () => {
  try {
    isExporting.value = true
    showExportMenu.value = false

    exportTransactions(props.filteredTransactions)

    // Show success toast
    const count = props.filteredTransactions.length
    // TODO: Replace with toast notification component when available
    console.log(`Đã xuất ${count} giao dịch (đã lọc)`)

  } catch (error) {
    console.error('Export error:', error)
    // TODO: Replace with error toast notification
  } finally {
    // Small delay to show loading state
    await new Promise(resolve => setTimeout(resolve, 300))
    isExporting.value = false
  }
}

// Close menu when clicking outside
const menuRef = ref<HTMLElement | null>(null)
onClickOutside(menuRef, () => {
  showExportMenu.value = false
})
</script>

<template>
  <div class="relative" ref="menuRef">
    <!-- Main Export Button -->
    <button @click="showExportMenu = !showExportMenu" :disabled="isExporting || transactions.length === 0"
      class="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      :class="{ 'opacity-50 cursor-wait': isExporting }">
      <!-- Loading Spinner -->
      <svg v-if="isExporting" class="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none"
        viewBox="0 0 24 24">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
        <path class="opacity-75" fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z">
        </path>
      </svg>

      <!-- Download Icon -->
      <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24"
        stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
          d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>

      <span>{{ isExporting ? 'Đang xuất...' : 'Xuất CSV' }}</span>

      <!-- Chevron Down -->
      <svg v-if="!isExporting" xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24"
        stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
      </svg>
    </button>

    <!-- Export Options Menu -->
    <Transition enter-active-class="transition ease-out duration-100" enter-from-class="transform opacity-0 scale-95"
      enter-to-class="transform opacity-100 scale-100" leave-active-class="transition ease-in duration-75"
      leave-from-class="transform opacity-100 scale-100" leave-to-class="transform opacity-0 scale-95">
      <div v-show="showExportMenu"
        class="absolute right-0 mt-2 w-64 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-10">
        <div class="py-2">
          <!-- Export All Option -->
          <button @click="exportAll"
            class="w-full px-4 py-3 text-left hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex items-start gap-3">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-gray-600 dark:text-gray-400 mt-0.5" fill="none"
              viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <div>
              <div class="font-medium text-gray-900 dark:text-gray-100">
                Xuất tất cả
              </div>
              <div class="text-sm text-gray-500 dark:text-gray-400">
                {{ transactions.length }} giao dịch
              </div>
            </div>
          </button>

          <!-- Export Filtered Option -->
          <button v-if="isFiltered" @click="exportFiltered"
            class="w-full px-4 py-3 text-left hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex items-start gap-3 border-t border-gray-200 dark:border-gray-700">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" fill="none"
              viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
            <div>
              <div class="font-medium text-gray-900 dark:text-gray-100">
                Xuất kết quả lọc
              </div>
              <div class="text-sm text-gray-500 dark:text-gray-400">
                {{ filteredTransactions.length }} giao dịch
              </div>
            </div>
          </button>

          <!-- No Filtered Results Warning -->
          <div v-else-if="filteredTransactions.length === 0"
            class="px-4 py-3 text-sm text-gray-500 dark:text-gray-400 border-t border-gray-200 dark:border-gray-700">
            Không có kết quả lọc
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>
