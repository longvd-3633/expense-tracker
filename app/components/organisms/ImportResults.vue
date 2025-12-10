<script setup lang="ts">
import type { ImportResult } from '~/composables/useCSVImport'

const emit = defineEmits<{
  close: []
}>()

const router = useRouter()
const { parseResult } = useCSVImport()

// Get import result from parseResult (set during import)
const importResult = ref<ImportResult | null>(null)

// This component expects import to be complete
// Result should be passed via event or composable state
onMounted(() => {
  // For now, we'll get result from the last import
  // In real implementation, pass via props or global state
})

const handleViewTransactions = () => {
  emit('close')
  router.push('/transactions')
}

const handleClose = () => {
  emit('close')
}

// Mock result for now - will be replaced with actual result
const result = computed(() => ({
  total: parseResult.value?.totalRows || 0,
  success: parseResult.value?.validRows.length || 0,
  errors: parseResult.value?.invalidRows.length || 0,
  duplicatesSkipped: parseResult.value?.duplicateRows.length || 0,
  errorMessages: []
}))
</script>

<template>
  <Teleport to="body">
    <Transition enter-active-class="transition ease-out duration-200" enter-from-class="opacity-0"
      enter-to-class="opacity-100" leave-active-class="transition ease-in duration-150" leave-from-class="opacity-100"
      leave-to-class="opacity-0">
      <div class="fixed inset-0 z-50 flex items-center justify-center px-4 py-6">
        <!-- Backdrop -->
        <div class="absolute inset-0 bg-black bg-opacity-40" @click="handleClose" />

        <!-- Modal -->
        <div class="relative w-full max-w-md rounded-2xl bg-white dark:bg-zinc-900 p-6 shadow-2xl">
          <!-- Success Icon -->
          <div
            class="flex items-center justify-center w-16 h-16 mx-auto mb-4 bg-green-100 dark:bg-green-900/30 rounded-full">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 text-green-600 dark:text-green-400" fill="none"
              viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
            </svg>
          </div>

          <!-- Title -->
          <h3 class="text-2xl font-bold text-slate-900 dark:text-white text-center mb-2">
            Nhập dữ liệu thành công!
          </h3>
          <p class="text-slate-600 dark:text-zinc-400 text-center mb-6">
            Dữ liệu đã được nhập vào hệ thống
          </p>

          <!-- Results Summary -->
          <div class="space-y-3 mb-6">
            <div class="flex items-center justify-between p-3 bg-slate-50 dark:bg-zinc-800 rounded-lg">
              <span class="text-sm text-slate-600 dark:text-zinc-400">Tổng số dòng</span>
              <span class="text-lg font-semibold text-slate-900 dark:text-white">{{ result.total }}</span>
            </div>

            <div class="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <div class="flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-green-600 dark:text-green-400" fill="none"
                  viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                </svg>
                <span class="text-sm text-green-700 dark:text-green-400">Nhập thành công</span>
              </div>
              <span class="text-lg font-semibold text-green-600 dark:text-green-400">{{ result.success }}</span>
            </div>

            <div v-if="result.duplicatesSkipped > 0"
              class="flex items-center justify-between p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
              <div class="flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-yellow-600 dark:text-yellow-400" fill="none"
                  viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span class="text-sm text-yellow-700 dark:text-yellow-400">Bỏ qua (trùng lặp)</span>
              </div>
              <span class="text-lg font-semibold text-yellow-600 dark:text-yellow-400">{{ result.duplicatesSkipped
                }}</span>
            </div>

            <div v-if="result.errors > 0"
              class="flex items-center justify-between p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
              <div class="flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-red-600 dark:text-red-400" fill="none"
                  viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span class="text-sm text-red-700 dark:text-red-400">Bỏ qua (không hợp lệ)</span>
              </div>
              <span class="text-lg font-semibold text-red-600 dark:text-red-400">{{ result.errors }}</span>
            </div>
          </div>

          <!-- Error Messages (if any) -->
          <div v-if="result.errorMessages && result.errorMessages.length > 0" class="mb-6">
            <div class="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
              <p class="text-sm font-semibold text-red-700 dark:text-red-400 mb-2">Chi tiết lỗi:</p>
              <div class="space-y-1 max-h-32 overflow-y-auto">
                <p v-for="(error, index) in result.errorMessages.slice(0, 5)" :key="index"
                  class="text-xs text-red-600 dark:text-red-400">
                  {{ error }}
                </p>
                <p v-if="result.errorMessages.length > 5" class="text-xs text-red-500 dark:text-red-500 italic">
                  ...và {{ result.errorMessages.length - 5 }} lỗi khác
                </p>
              </div>
            </div>
          </div>

          <!-- Actions -->
          <div class="flex flex-col gap-3">
            <button @click="handleViewTransactions"
              class="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors">
              Xem danh sách giao dịch
            </button>
            <button @click="handleClose"
              class="w-full px-6 py-3 text-slate-700 dark:text-zinc-300 bg-slate-100 dark:bg-zinc-800 rounded-lg hover:bg-slate-200 dark:hover:bg-zinc-700 transition-colors">
              Đóng
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>
