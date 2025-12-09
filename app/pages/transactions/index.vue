<script setup lang="ts">
import FilterBar from '~/components/molecules/FilterBar.vue'
import type { Transaction, TransactionInput } from '~/types/transaction'
import { useFilters, type FilterType, type FilterQueryInput } from '~/composables/useFilters'
import type { LocationQuery } from 'vue-router'

const transactionsStore = useTransactionsStore()
const categoriesStore = useCategoriesStore()
const user = useSupabaseUser()
const { formatCurrency, formatDate } = useFormatters()

const isFormOpen = ref(false)
const editingTransaction = ref<Transaction | null>(null)
const editingSnapshot = ref<Transaction | null>(null)
const editingVersion = ref<string | null>(null)
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
type ConflictStateType = 'deleted' | 'updated'

const conflictState = ref<{
  type: ConflictStateType
  server: Transaction | null
  yourChanges: TransactionInput
  base?: Transaction | null
} | null>(null)
const conflictDetailsVisible = ref(false)

// Load data when component mounts (auth is already checked by middleware)
onMounted(async () => {
  try {
    // Wait a tick to ensure Supabase client is ready
    await nextTick()
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
  editingSnapshot.value = null
  editingVersion.value = null
  conflictState.value = null
  conflictDetailsVisible.value = false
  isFormOpen.value = true
}

const handleEditTransaction = (transaction: Transaction) => {
  editingTransaction.value = cloneTransaction(transaction)
  editingSnapshot.value = cloneTransaction(transaction)
  editingVersion.value = transaction.updatedAt.toISOString()
  conflictState.value = null
  conflictDetailsVisible.value = false
  isFormOpen.value = true
}

interface SubmitOptions { skipConflict?: boolean }

const handleSubmit = async (data: TransactionInput, options: SubmitOptions = {}) => {
  try {
    if (editingTransaction.value) {
      const shouldCheck = !options.skipConflict && !!editingVersion.value
      if (shouldCheck) {
        const serverVersion = transactionsStore.transactions.find(
          (transaction) => transaction.id === editingTransaction.value?.id
        )

        if (!serverVersion) {
          conflictState.value = {
            type: 'deleted',
            server: null,
            yourChanges: data,
            base: editingSnapshot.value ? cloneTransaction(editingSnapshot.value) : null,
          }
          conflictDetailsVisible.value = false
          return
        }

        const serverTimestamp = serverVersion.updatedAt.toISOString()
        if (serverTimestamp !== editingVersion.value) {
          conflictState.value = {
            type: 'updated',
            server: cloneTransaction(serverVersion),
            yourChanges: data,
            base: editingSnapshot.value ? cloneTransaction(editingSnapshot.value) : null,
          }
          conflictDetailsVisible.value = false
          return
        }
      }

      await transactionsStore.updateTransaction(editingTransaction.value.id, data)
    } else {
      await transactionsStore.addTransaction(data)
    }
  } catch (error) {
    console.error('Error saving transaction:', error)
  }
}

const dismissConflict = () => {
  conflictState.value = null
  conflictDetailsVisible.value = false
}

const resolveConflictOverwrite = async () => {
  if (!conflictState.value) return
  const payload = conflictState.value.yourChanges
  dismissConflict()
  await handleSubmit(payload, { skipConflict: true })
}

const applyServerVersion = () => {
  if (!conflictState.value) return
  const { server } = conflictState.value
  if (server) {
    editingTransaction.value = cloneTransaction(server)
    editingSnapshot.value = cloneTransaction(server)
    editingVersion.value = server.updatedAt.toISOString()
  } else {
    editingTransaction.value = null
    editingSnapshot.value = null
    editingVersion.value = null
    isFormOpen.value = false
  }
  dismissConflict()
}

const toggleConflictDetails = () => {
  conflictDetailsVisible.value = !conflictDetailsVisible.value
}

const handleConflictReload = async () => {
  dismissConflict()
  isFormOpen.value = false
  await handleRetry()
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
    category: editingTransaction.value.category ?? undefined,
    description: editingTransaction.value.description,
    tags: editingTransaction.value.tags,
  }
})

const formatCategoryLabel = (categoryId?: string | null) => {
  if (!categoryId) return 'Không xác định'
  return categoriesStore.getCategoryById(categoryId)?.name ?? 'Không xác định'
}

const formatTagList = (tags?: string[] | null) => {
  if (!tags || !tags.length) return 'Không có'
  return tags.join(', ')
}

const filters = useFilters()
const route = useRoute()
const router = useRouter()
const isSyncingRouteQuery = ref(false)

const normalizeQuery = (input: LocationQuery) => {
  const normalized: Record<string, string> = {}
  Object.entries(input).forEach(([key, value]) => {
    if (value === null || value === undefined) return
    const entries = Array.isArray(value) ? value : [value]
    normalized[key] = entries.map(String).join(',')
  })
  return normalized
}

watch(
  () => route.query,
  (query) => {
    isSyncingRouteQuery.value = true
    filters.setFromQuery(query as FilterQueryInput)
    isSyncingRouteQuery.value = false
  },
  { immediate: true, deep: true }
)

watch(
  () => filters.queryString,
  () => {
    if (isSyncingRouteQuery.value) return
    const nextQuery = filters.buildQuery()
    const currentQuery = normalizeQuery(route.query)
    if (JSON.stringify(nextQuery) === JSON.stringify(currentQuery)) return
    router.replace({ query: nextQuery })
  }
)

const filteredTransactions = computed(() =>
  filters.filterTransactions(transactionsStore.sortedTransactions, (categoryId) =>
    categoriesStore.getCategoryById(categoryId)?.name
  )
)

const setTypeFilter = (value: FilterType) => {
  filters.typeFilter.value = value
}

const setStartDate = (value: string | null) => {
  filters.startDate.value = value
}

const setEndDate = (value: string | null) => {
  filters.endDate.value = value
}

const setMinAmount = (value: number | null) => {
  filters.minAmount.value = value
}

const setMaxAmount = (value: number | null) => {
  filters.maxAmount.value = value
}

const setSearchQuery = (value: string) => {
  filters.searchQuery.value = value
}

const conflictDiffs = computed(() => {
  if (!conflictState.value || conflictState.value.type !== 'updated' || !conflictState.value.server) {
    return []
  }

  const server = conflictState.value.server
  const yours = conflictState.value.yourChanges
  const diffs: Array<{ field: string; label: string; server: string; yours: string }> = []

  if (server.date.getTime() !== yours.date.getTime()) {
    diffs.push({
      field: 'date',
      label: 'Ngày',
      server: formatDate(server.date),
      yours: formatDate(yours.date),
    })
  }

  if (server.type !== yours.type) {
    diffs.push({
      field: 'type',
      label: 'Loại',
      server: server.type === 'income' ? 'Thu' : 'Chi',
      yours: yours.type === 'income' ? 'Thu' : 'Chi',
    })
  }

  if (server.amount !== yours.amount) {
    diffs.push({
      field: 'amount',
      label: 'Số tiền',
      server: formatCurrency(server.amount),
      yours: formatCurrency(yours.amount),
    })
  }

  if (server.category !== yours.category) {
    diffs.push({
      field: 'category',
      label: 'Danh mục',
      server: formatCategoryLabel(server.category),
      yours: formatCategoryLabel(yours.category),
    })
  }

  if ((server.description || '') !== (yours.description || '')) {
    diffs.push({
      field: 'description',
      label: 'Ghi chú',
      server: server.description || 'Không có',
      yours: yours.description || 'Không có',
    })
  }

  const serverTags = formatTagList(server.tags)
  const yourTags = formatTagList(yours.tags)
  if (serverTags !== yourTags) {
    diffs.push({
      field: 'tags',
      label: 'Thẻ',
      server: serverTags,
      yours: yourTags,
    })
  }

  return diffs
})

const deletingCategory = computed(() => {
  if (!deleteTarget.value || !deleteTarget.value.category) return null
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

      <div class="flex items-center gap-3">
        <ExportButton :transactions="transactionsStore.transactions" :filtered-transactions="filteredTransactions"
          :is-filtered="filters.hasActiveFilters.value" />

        <Button variant="primary" size="lg" @click="handleAddTransaction">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24"
            stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
          Thêm giao dịch
        </Button>
      </div>
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
      <Button variant="secondary" size="sm" @click="handleReconnect">
        Kết nối lại
      </Button>
    </div>

    <!-- Transaction Filters -->
    <div class="mb-6">
      <FilterBar :categories="categoriesStore.categories" :type-filter="filters.typeFilter.value"
        :selected-categories="filters.selectedCategories.value" :start-date="filters.startDate.value"
        :end-date="filters.endDate.value" :min-amount="filters.minAmount.value" :max-amount="filters.maxAmount.value"
        :search-query="filters.searchQuery.value" :result-count="filteredTransactions.length"
        :has-active-filters="filters.hasActiveFilters.value" :on-type-change="setTypeFilter"
        :on-category-toggle="filters.toggleCategory" :on-start-date-change="setStartDate"
        :on-end-date-change="setEndDate" :on-min-amount-change="setMinAmount" :on-max-amount-change="setMaxAmount"
        :on-search-change="setSearchQuery" :on-clear="filters.resetFilters" />
    </div>

    <!-- Transaction List -->
    <TransactionList :transactions="filteredTransactions" :loading="isLoading" :error="transactionsStore.error"
      @edit="handleEditTransaction" @delete="requestDeleteTransaction" @retry="handleRetry" />

    <!-- Transaction Form Modal -->
    <TransactionForm v-model:is-open="isFormOpen" :initial-data="formInitialData" @submit="handleSubmit" />

    <!-- Delete Confirmation Modal -->
    <Teleport to="body">
      <Transition enter-active-class="transition ease-out duration-200" enter-from-class="opacity-0"
        enter-to-class="opacity-100" leave-active-class="transition ease-in duration-150" leave-from-class="opacity-100"
        leave-to-class="opacity-0">
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
              <Button variant="ghost" @click="resetDeleteState">
                Hủy
              </Button>
              <Button variant="danger" :loading="isDeletingTransaction" :disabled="isDeletingTransaction"
                @click="confirmDeleteTransaction">
                Xóa
              </Button>
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

    <!-- Conflict Resolution Modal -->
    <Teleport to="body">
      <Transition enter-active-class="transition ease-out duration-200" enter-from-class="opacity-0"
        enter-to-class="opacity-100" leave-active-class="transition ease-in duration-150" leave-from-class="opacity-100"
        leave-to-class="opacity-0">
        <div v-if="conflictState" class="fixed inset-0 z-50 flex items-center justify-center px-4 py-6">
          <div class="absolute inset-0 bg-black bg-opacity-40" />
          <div class="relative w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl space-y-5">
            <div class="flex items-start justify-between gap-4">
              <div>
                <p class="text-sm uppercase tracking-wide text-blue-500">Xung đột</p>
                <h3 class="text-xl font-semibold text-gray-900">
                  {{ conflictState.type === 'deleted' ? 'Giao dịch đã bị xóa' : 'Giao dịch có phiên bản mới' }}
                </h3>
                <p class="text-sm text-gray-600">
                  {{ conflictState.type === 'deleted'
                    ? 'Giao dịch bạn đang chỉnh sửa không còn tồn tại trên Supabase.'
                    : 'Giao dịch bạn đang chỉnh sửa đã được cập nhật bởi thiết bị khác.' }}
                </p>
              </div>
              <button class="text-gray-400 hover:text-gray-600" @click="dismissConflict">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24"
                  stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div v-if="conflictState.type === 'updated' && conflictState.server"
              class="rounded-lg bg-gray-50 p-3 text-sm text-gray-600">
              <p class="font-semibold text-gray-900">
                Phiên bản mới nhất cập nhật vào {{ formatDate(conflictState.server.updatedAt) }}
              </p>
              <p class="text-xs text-gray-500">Tự động đồng bộ từ Supabase.</p>
            </div>

            <div class="space-y-3" v-if="conflictState.type === 'updated'">
              <div class="flex flex-wrap gap-3">
                <Button variant="primary" @click="resolveConflictOverwrite">
                  Đè lên thay đổi của tôi
                </Button>
                <Button variant="secondary" @click="applyServerVersion">
                  Giữ thay đổi mới nhất
                </Button>
                <button class="text-sm font-semibold text-blue-600 hover:text-blue-800" @click="toggleConflictDetails">
                  {{ conflictDetailsVisible ? 'Ẩn sự khác biệt' : 'Xem sự khác biệt' }}
                </button>
              </div>

              <div v-if="conflictDetailsVisible" class="space-y-3 rounded-xl border border-gray-100 bg-white p-4">
                <p class="text-xs font-semibold uppercase tracking-wide text-gray-500">So sánh phiên bản</p>
                <div v-if="conflictDiffs.length === 0" class="text-sm text-gray-500">
                  Thay đổi không thể so sánh chi tiết.
                </div>
                <div v-else class="space-y-3">
                  <div v-for="diff in conflictDiffs" :key="diff.field" class="space-y-1 rounded-lg bg-gray-50 p-3">
                    <p class="text-sm font-semibold text-gray-700">{{ diff.label }}</p>
                    <div class="grid grid-cols-2 gap-3 text-sm text-gray-600">
                      <div>
                        <p class="text-[11px] uppercase tracking-wide text-gray-500">Thiết bị khác</p>
                        <p class="text-sm text-gray-900">{{ diff.server }}</p>
                      </div>
                      <div>
                        <p class="text-[11px] uppercase tracking-wide text-gray-500">Thay đổi của tôi</p>
                        <p class="text-sm text-gray-900">{{ diff.yours }}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div v-else class="space-y-3">
              <p class="text-sm text-gray-600">
                Vui lòng tải lại danh sách để lấy dữ liệu mới nhất và tiếp tục thao tác.
              </p>
              <div class="flex flex-wrap gap-3">
                <Button variant="danger" @click="handleConflictReload">
                  Tải lại
                </Button>
                <Button variant="ghost" @click="dismissConflict">
                  Đóng
                </Button>
              </div>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>
