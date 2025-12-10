<script setup lang="ts">
const { parseFile, parseResult, reset } = useCSVImport()
const { formatCurrency } = useFormatters()

const fileInputRef = ref<HTMLInputElement | null>(null)
const showPreview = ref(false)
const showResults = ref(false)
const isParsing = ref(false)
const parseError = ref<string | null>(null)

const handleFileSelect = async (event: Event) => {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]

  if (!file) return

  isParsing.value = true
  parseError.value = null

  try {
    const result = await parseFile(file)

    if (result.success) {
      showPreview.value = true
    } else {
      parseError.value = result.errors.join('\n')
    }
  } catch (error: any) {
    parseError.value = error?.message || 'Lỗi không xác định'
  } finally {
    isParsing.value = false
  }

  // Reset file input
  if (fileInputRef.value) {
    fileInputRef.value.value = ''
  }
}

const openFilePicker = () => {
  if (isParsing.value) return
  parseError.value = null
  fileInputRef.value?.click()
}

const handleImportComplete = (result: any) => {
  showPreview.value = false
  showResults.value = true
}

const handleClosePreview = () => {
  showPreview.value = false
  reset()
}

const handleCloseResults = () => {
  showResults.value = false
  reset()
}

// Close error toast
const closeError = () => {
  parseError.value = null
}
</script>

<template>
  <div>
    <!-- Hidden file input -->
    <input ref="fileInputRef" type="file" accept=".csv,text/csv" class="hidden" @change="handleFileSelect" />

    <!-- Import button -->
    <button @click="openFilePicker" :disabled="isParsing"
      class="inline-flex items-center gap-2 rounded-xl border border-blue-200 dark:border-blue-700 bg-blue-50 dark:bg-blue-900/30 px-4 py-2.5 text-sm font-medium text-blue-700 dark:text-blue-300 shadow-sm transition-all hover:border-blue-300 dark:hover:border-blue-600 hover:bg-blue-100 dark:hover:bg-blue-900/50 hover:shadow disabled:cursor-not-allowed disabled:opacity-50"
      :class="{ 'cursor-wait': isParsing }">
      <!-- Loading Spinner -->
      <svg v-if="isParsing" class="h-4 w-4 animate-spin text-blue-600 dark:text-blue-400"
        xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
        <path class="opacity-75" fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
      </svg>

      <!-- Upload Icon -->
      <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-blue-600 dark:text-blue-400" fill="none"
        viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
        <path stroke-linecap="round" stroke-linejoin="round"
          d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
      </svg>

      <span>{{ isParsing ? 'Đang đọc...' : 'Nhập CSV' }}</span>
    </button>

    <!-- Error Toast -->
    <Teleport to="body">
      <Transition enter-active-class="transition ease-out duration-200" enter-from-class="translate-y-4 opacity-0"
        enter-to-class="translate-y-0 opacity-100" leave-active-class="transition ease-in duration-150"
        leave-from-class="translate-y-0 opacity-100" leave-to-class="translate-y-4 opacity-0">
        <div v-if="parseError" class="fixed bottom-6 right-6 z-50">
          <div class="bg-red-600 text-white px-5 py-4 rounded-xl shadow-2xl max-w-md">
            <div class="flex items-start justify-between gap-3">
              <div class="flex items-start gap-3">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 flex-shrink-0 mt-0.5" fill="none"
                  viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <p class="font-semibold">Lỗi đọc file CSV</p>
                  <p class="text-sm text-red-100 mt-1 whitespace-pre-line">{{ parseError }}</p>
                </div>
              </div>
              <button class="text-red-200 hover:text-white" @click="closeError">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24"
                  stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- Preview modal -->
    <ImportPreview v-if="showPreview && parseResult" :parse-result="parseResult" @close="handleClosePreview"
      @complete="handleImportComplete" />

    <!-- Results modal -->
    <ImportResults v-if="showResults" @close="handleCloseResults" />
  </div>
</template>
