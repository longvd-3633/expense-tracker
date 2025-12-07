<script setup lang="ts">
import type { Transaction, TransactionInput } from '~/types/transaction'

const transactionsStore = useTransactionsStore()
const categoriesStore = useCategoriesStore()
const { formatCurrency, formatDate } = useFormatters()

const isFormOpen = ref(false)
const editingTransaction = ref<Transaction | null>(null)
const isLoading = ref(true)
const deleteTarget = ref<Transaction | null>(null)
const isDeletingTransaction = ref(false)
const lastDeletedTransaction = ref<Transaction | null>(null)
const undoToastVisible = ref(false)
const undoCountdown = ref(5)
const undoTimeoutId = ref<ReturnType<typeof setTimeout> | null>(null)
const undoCountdownIntervalId = ref<ReturnType<typeof setInterval> | null>(null)
const UNDO_DURATION_SECONDS = 5
const undoProgress = computed(() => (undoCountdown.value / UNDO_DURATION_SECONDS) * 100)

onMounted(async () => {
  try {
    await Promise.all([
      categoriesStore.fetchCategories(),
      transactionsStore.fetchTransactions(),
    ])
  } catch (error) {
    console.error('Error loading data:', error)
  } finally {
    isLoading.value = false
  }
})

onUnmounted(() => {
  if (undoTimeoutId.value) {
    clearTimeout(undoTimeoutId.value)
  }
  if (undoCountdownIntervalId.value) {
    clearInterval(undoCountdownIntervalId.value)
  }
})

const handleAddTransaction = () => {
  editingTransaction.value = null
  isFormOpen.value = true
}

const handleEditTransaction = (transaction: Transaction) => {
  editingTransaction.value = transaction
  isFormOpen.value = true
}

const handleSubmit = async (data: TransactionInput) => {
  try {
    if (editingTransaction.value) {
      await transactionsStore.updateTransaction(editingTransaction.value.id, data)
    } else {
      await transactionsStore.addTransaction(data)
    }
  } catch (error) {
    console.error('Error saving transaction:', error)
  }
}

const handleRetry = async () => {
  isLoading.value = true
  await transactionsStore.fetchTransactions()
  isLoading.value = false
}

const handleReconnect = async () => {
  await handleRetry()
  transactionsStore.ensureSubscription()
}

const formInitialData = computed(() => {
  if (!editingTransaction.value) return undefined

  return {
    date: new Date(editingTransaction.value.date),
    type: editingTransaction.value.type,
    amount: editingTransaction.value.amount,
    category: editingTransaction.value.category,
    description: editingTransaction.value.description,
    tags: editingTransaction.value.tags,
  }
})

const deletingCategory = computed(() => {
  if (!deleteTarget.value) return null
  return categoriesStore.getCategoryById(deleteTarget.value.category)
})

const requestDeleteTransaction = (transaction: Transaction) => {
  deleteTarget.value = transaction
}

const resetDeleteState = () => {
  deleteTarget.value = null
}

const cloneTransaction = (transaction: Transaction): Transaction => ({
  ...transaction,
  date: new Date(transaction.date),
  createdAt: new Date(transaction.createdAt),
  updatedAt: new Date(transaction.updatedAt),
  tags: transaction.tags ? [...transaction.tags] : [],
})

const hideUndoToast = () => {
  undoToastVisible.value = false
  lastDeletedTransaction.value = null
  if (undoTimeoutId.value) {
    clearTimeout(undoTimeoutId.value)
    undoTimeoutId.value = null
  }
  if (undoCountdownIntervalId.value) {
    clearInterval(undoCountdownIntervalId.value)
    undoCountdownIntervalId.value = null
  }
}

const startUndoCountdown = (transaction: Transaction) => {
  lastDeletedTransaction.value = transaction
  undoCountdown.value = UNDO_DURATION_SECONDS
  undoToastVisible.value = true

  if (undoTimeoutId.value) {
    clearTimeout(undoTimeoutId.value)
  }
  if (undoCountdownIntervalId.value) {
    clearInterval(undoCountdownIntervalId.value)
  }

  undoCountdownIntervalId.value = setInterval(() => {
    undoCountdown.value = Math.max(undoCountdown.value - 1, 0)
  }, 1000)

  undoTimeoutId.value = setTimeout(() => {
    hideUndoToast()
  }, UNDO_DURATION_SECONDS * 1000)
}

const confirmDeleteTransaction = async () => {
  if (!deleteTarget.value) return
  isDeletingTransaction.value = true
  const snapshot = cloneTransaction(deleteTarget.value)

  try {
    await transactionsStore.deleteTransaction(deleteTarget.value.id)
    resetDeleteState()
    startUndoCountdown(snapshot)
  } catch (error) {
    console.error('Error deleting transaction:', error)
  } finally {
    isDeletingTransaction.value = false
  }
}

const handleUndoDelete = async () => {
  if (!lastDeletedTransaction.value) return

  try {
    await transactionsStore.restoreTransaction(lastDeletedTransaction.value)
  } catch (error) {
    console.error('Error restoring transaction:', error)
  } finally {
    hideUndoToast()
  }
}
</script>

<template>
  <div>
    <!-- Header -->
    <div class="flex items-center justify-between mb-8">
      <div>
        <h1 class="text-3xl font-bold text-gray-900 mb-2">Giao dịch</h1>
        <p class="text-gray-600">Quản lý thu chi của bạn</p>
      </div>

      <AtomsButton variant="primary" size="lg" @click="handleAddTransaction">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24"
          stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
        </svg>
        Thêm giao dịch
      </AtomsButton>
    </div>

    <div v-if="transactionsStore.realtimeDisconnected"
      class="mb-6 flex flex-col gap-3 rounded-xl border border-yellow-300 bg-yellow-50 p-4 text-yellow-900 sm:flex-row sm:items-center sm:justify-between">
      <div class="flex items-start gap-3">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 flex-shrink-0" fill="none" viewBox="0 0 24 24"
          stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
            d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0zM12 9v4m0 4h.01" />
        </svg>
        <div>
          <p class="font-semibold">Mất kết nối realtime</p>
          <p class="text-sm">Vui lòng tải lại để đồng bộ dữ liệu mới nhất.</p>
        </div>
      </div>
      <AtomsButton variant="secondary" size="sm" @click="handleReconnect">
        Kết nối lại
      </AtomsButton>
    </div>

    <!-- Transaction List -->
    <OrganismsTransactionList :transactions="transactionsStore.sortedTransactions" :loading="isLoading"
      :error="transactionsStore.error" @edit="handleEditTransaction" @delete="requestDeleteTransaction"
      @retry="handleRetry" />

    <!-- Transaction Form Modal -->
    <OrganismsTransactionForm v-model:is-open="isFormOpen" :initial-data="formInitialData"
      @submit="handleSubmit" />

    <!-- Delete Confirmation Modal -->
    <Teleport to="body">
      <Transition enter-active-class="transition ease-out duration-200" enter-from-class="opacity-0"
        enter-to-class="opacity-100" leave-active-class="transition ease-in duration-150"
        leave-from-class="opacity-100" leave-to-class="opacity-0">
        <div v-if="deleteTarget" class="fixed inset-0 z-50 flex items-center justify-center px-4 py-6">
          <div class="absolute inset-0 bg-black bg-opacity-50" @click="resetDeleteState" />
          <div class="relative bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
            <div class="flex items-start justify-between mb-4">
              <div>
                <h3 class="text-xl font-semibold text-gray-900">Xóa giao dịch?</h3>
                <p class="text-sm text-gray-500">Bạn không thể hoàn tác sau khi hết thời gian cho phép.</p>
              </div>
              <button class="text-gray-400 hover:text-gray-600" @click="resetDeleteState">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24"
                  stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div class="space-y-3 mb-6 rounded-lg bg-gray-50 p-4">
              <div class="flex items-center justify-between">
                <span class="text-sm text-gray-600">Số tiền</span>
                <span :class="[
                  'text-lg font-semibold',
                  deleteTarget.type === 'income' ? 'text-green-600' : 'text-red-600',
                ]">
                  {{ deleteTarget.type === 'income' ? '+' : '-' }}{{ formatCurrency(deleteTarget.amount) }}
                </span>
              </div>
              <div class="flex items-center justify-between text-sm text-gray-600">
                <span>Danh mục</span>
                <span>{{ deletingCategory?.name || 'Không xác định' }}</span>
              </div>
              <div class="flex items-center justify-between text-sm text-gray-600">
                <span>Ngày</span>
                <span>{{ formatDate(deleteTarget.date) }}</span>
              </div>
            </div>

            <p v-if="deleteTarget.description" class="text-sm text-gray-500 mb-6">
              "{{ deleteTarget.description }}"
            </p>

            <div class="flex items-center justify-end space-x-3">
              <AtomsButton variant="ghost" @click="resetDeleteState">
                Hủy
              </AtomsButton>
              <AtomsButton variant="danger" :loading="isDeletingTransaction" :disabled="isDeletingTransaction"
                @click="confirmDeleteTransaction">
                Xóa
              </AtomsButton>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- Undo Toast -->
    <Teleport to="body">
      <Transition enter-active-class="transition ease-out duration-200" enter-from-class="translate-y-4 opacity-0"
        enter-to-class="translate-y-0 opacity-100" leave-active-class="transition ease-in duration-150"
        leave-from-class="translate-y-0 opacity-100" leave-to-class="translate-y-4 opacity-0">
        <div v-if="undoToastVisible" class="fixed bottom-6 right-6 z-50">
          <div class="bg-gray-900 text-white px-5 py-4 rounded-xl shadow-2xl w-80">
            <div class="flex items-start justify-between">
              <div>
                <p class="font-semibold">Đã xóa giao dịch</p>
                <p class="text-sm text-gray-300">Hoàn tác trong {{ undoCountdown }}s</p>
              </div>
              <button class="text-gray-400 hover:text-white" @click="hideUndoToast">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24"
                  stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div class="mt-2 h-1 bg-gray-700 rounded-full overflow-hidden">
              <div class="h-full bg-blue-400 transition-[width] duration-200" :style="{ width: `${undoProgress}%` }" />
            </div>
            <div class="mt-3 flex items-center justify-between">
              <span class="text-sm text-gray-300">Hoàn tác thao tác này?</span>
              <button class="text-blue-300 font-semibold hover:text-white" @click="handleUndoDelete">
                Hoàn tác
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>
