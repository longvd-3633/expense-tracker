<script setup lang="ts">
const transactionsStore = useTransactionsStore()
const categoriesStore = useCategoriesStore()
const {
  currentPeriod,
  dateRange,
  setPeriod,
  goToPrevious,
  goToNext,
  goToToday,
  viewingCurrentPeriod,
  canGoToNext,
  periodLabel,
} = useDateRange()

const { formatCurrency } = useFormatters()

const isLoading = ref(true)
const reconnecting = ref(false)

const rangeFormatter = new Intl.DateTimeFormat('vi-VN', {
  day: '2-digit',
  month: 'short',
  year: 'numeric',
})

const rangeLabel = computed(() => `${rangeFormatter.format(dateRange.value.start)} – ${rangeFormatter.format(dateRange.value.end)}`)

onMounted(async () => {
  try {
    await Promise.all([
      categoriesStore.fetchCategories(),
      transactionsStore.fetchTransactions(),
    ])
    transactionsStore.ensureSubscription()
  } catch (error) {
    console.error('Error loading dashboard data:', error)
  } finally {
    isLoading.value = false
  }
})

const filteredTransactions = computed(() =>
  transactionsStore.getTransactionsByDateRange(
    dateRange.value.start,
    dateRange.value.end,
  )
)

const stats = computed(() => {
  const transactions = filteredTransactions.value
  const incomeTransactions = transactions.filter((t) => t.type === 'income')
  const expenseTransactions = transactions.filter((t) => t.type === 'expense')

  const income = incomeTransactions.reduce((sum, t) => sum + t.amount, 0)
  const expense = expenseTransactions.reduce((sum, t) => sum + t.amount, 0)

  return {
    income,
    expense,
    balance: income - expense,
    count: transactions.length,
    incomeCount: incomeTransactions.length,
    expenseCount: expenseTransactions.length,
  }
})

const incomeShare = computed(() => {
  const total = stats.value.income + stats.value.expense
  if (total === 0) return 0
  return Math.round((stats.value.income / total) * 100)
})

const expenseShare = computed(() => 100 - incomeShare.value)

const statCards = computed(() => {
  const { income, expense, balance, incomeCount, expenseCount } = stats.value
  const incomeAvg = incomeCount ? income / incomeCount : 0
  const expenseAvg = expenseCount ? expense / Math.max(expenseCount, 1) : 0

  return [
    {
      key: 'income',
      label: 'Thu nhập',
      amount: income,
      variant: 'income' as const,
      chipLabel: incomeCount ? `${incomeCount} giao dịch` : 'Chưa có giao dịch',
      description: incomeCount
        ? `TB ${formatCurrency(incomeAvg)} / giao dịch`
        : 'Ghi nhận thu nhập để xem thống kê',
    },
    {
      key: 'expense',
      label: 'Chi tiêu',
      amount: expense,
      variant: 'expense' as const,
      chipLabel: expenseCount ? `${expenseCount} giao dịch` : 'Chưa có giao dịch',
      description: expenseCount
        ? `TB ${formatCurrency(expenseAvg)} / giao dịch`
        : 'Ghi nhận chi phí để xem thống kê',
    },
    {
      key: 'balance',
      label: 'Còn lại',
      amount: balance,
      variant: 'balance' as const,
      chipLabel: `Khoảng: ${rangeLabel.value}`,
      description:
        balance >= 0
          ? 'Bạn đang thặng dư trong giai đoạn này'
          : 'Chi vượt thu · cân nhắc cắt giảm',
    },
  ]
})

type ChartGranularity = 'hour' | 'day'

const chartGranularity = computed<ChartGranularity>(() =>
  currentPeriod.value === 'daily' ? 'hour' : 'day'
)

const incomeBuckets = computed(() =>
  transactionsStore.getIncomeByDate(
    dateRange.value.start,
    dateRange.value.end,
    chartGranularity.value,
  )
)

const expenseBuckets = computed(() =>
  transactionsStore.getExpenseByDate(
    dateRange.value.start,
    dateRange.value.end,
    chartGranularity.value,
  )
)

const rawLineChartData = computed(() => ({
  labels: incomeBuckets.value.map(bucket => bucket.label),
  income: incomeBuckets.value.map(bucket => bucket.total),
  expense: expenseBuckets.value.map(bucket => bucket.total),
}))

const lineChartData = ref(rawLineChartData.value)
const syncLineChartData = useThrottleFn((payload: typeof rawLineChartData.value) => {
  lineChartData.value = payload
}, 1000, true)

watch(
  rawLineChartData,
  value => {
    syncLineChartData(value)
  },
  { deep: true, immediate: true }
)

type StoreCategoryBreakdown = {
  categoryId: string | null | 'others'
  total: number
  isOthers?: boolean
}

type CategoryChartSlice = {
  label: string
  value: number
  color: string
  categoryId?: string | null
  isOthers?: boolean
}

const expenseByCategory = computed<StoreCategoryBreakdown[]>(() =>
  transactionsStore.getExpenseByCategory(dateRange.value.start, dateRange.value.end)
)

const rawCategorySlices = computed<CategoryChartSlice[]>(() =>
  expenseByCategory.value.map(entry => {
    if (entry.isOthers) {
      return {
        label: 'Khác',
        value: entry.total,
        color: '#CBD5F5',
        categoryId: entry.categoryId,
        isOthers: true,
      }
    }

    const category = entry.categoryId ? categoriesStore.getCategoryById(entry.categoryId) : null
    return {
      label: category?.name ?? 'Danh mục không xác định',
      value: entry.total,
      color: category?.color ?? '#E2E8F0',
      categoryId: entry.categoryId,
    }
  })
)

const categoryChartSlices = ref<CategoryChartSlice[]>(rawCategorySlices.value)
const syncCategorySlices = useThrottleFn((payload: CategoryChartSlice[]) => {
  categoryChartSlices.value = payload
}, 1000, true)

watch(
  rawCategorySlices,
  value => {
    syncCategorySlices(value)
  },
  { deep: true, immediate: true }
)

const handleReconnect = async () => {
  if (reconnecting.value) return
  reconnecting.value = true
  try {
    transactionsStore.disposeSubscription()
    await transactionsStore.fetchTransactions()
    transactionsStore.ensureSubscription()
  } catch (error) {
    console.error('Không thể kết nối lại realtime:', error)
  } finally {
    reconnecting.value = false
  }
}
</script>

<template>
  <div class="space-y-6">
    <header class="mb-2">
      <p class="text-sm font-semibold uppercase tracking-[0.2em] text-blue-500">Tổng quan</p>
      <h1 class="mt-2 text-3xl font-bold text-gray-900">Dashboard</h1>
      <p class="text-gray-600">Tình hình tài chính của bạn · {{ periodLabel }}</p>
    </header>

    <section class="rounded-2xl bg-white p-6 shadow-sm">
      <div class="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <PeriodSelector :model-value="currentPeriod" @update:model-value="setPeriod" />

        <DateNavigator :label="periodLabel" :can-go-next="canGoToNext" :disable-today="viewingCurrentPeriod"
          :is-current-period="viewingCurrentPeriod" @previous="goToPrevious" @next="goToNext" @today="goToToday">
          <template #meta>
            <p class="mt-1 text-xs text-gray-500">{{ rangeLabel }}</p>
          </template>
        </DateNavigator>
      </div>
      <p class="mt-4 text-xs text-gray-400">
        Phím tắt: ← kỳ trước · → kỳ tiếp · T quay về hôm nay
      </p>
    </section>

    <div v-if="transactionsStore.realtimeDisconnected"
      class="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
      <div class="flex items-center gap-3">
        <span class="inline-flex h-9 w-9 items-center justify-center rounded-full bg-amber-100 text-amber-600">
          <svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 8v4m0 4h.01" />
            <circle cx="12" cy="12" r="9" />
          </svg>
        </span>
        <div>
          <p class="font-semibold">Mất kết nối realtime</p>
          <p class="text-amber-800">Dữ liệu vẫn khả dụng nhưng sẽ không tự cập nhật cho tới khi kết nối lại.</p>
        </div>
      </div>
      <button type="button"
        class="inline-flex items-center gap-2 rounded-full border border-amber-300 bg-white px-4 py-2 text-sm font-medium text-amber-800 transition hover:border-amber-400 disabled:opacity-60"
        :disabled="reconnecting" @click="handleReconnect">
        <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"
          stroke-linecap="round" stroke-linejoin="round">
          <path d="M21 12a9 9 0 10-3.87 7.19" />
          <path d="M21 3v5h-5" />
        </svg>
        {{ reconnecting ? 'Đang kết nối lại…' : 'Kết nối lại' }}
      </button>
    </div>

    <section v-if="isLoading" class="grid grid-cols-1 gap-6 md:grid-cols-3">
      <div v-for="i in 3" :key="i" class="rounded-2xl bg-white p-6 shadow-sm">
        <div class="h-4 w-1/2 rounded bg-gray-100" />
        <div class="mt-4 h-8 w-3/4 rounded bg-gray-100" />
        <div class="mt-6 h-3 w-2/3 rounded bg-gray-50" />
      </div>
    </section>

    <section v-else>
      <div v-if="stats.count === 0"
        class="rounded-3xl border border-dashed border-gray-200 bg-gradient-to-br from-white via-blue-50 to-white p-10 text-center">
        <div class="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 text-blue-600">
          <svg class="h-8 w-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 6v12m6-6H6" />
          </svg>
        </div>
        <h3 class="text-xl font-semibold text-gray-900">Chưa có dữ liệu trong giai đoạn này</h3>
        <p class="mt-2 text-gray-500">Thêm giao dịch đầu tiên để dashboard bắt đầu hiển thị thống kê realtime.</p>
        <NuxtLink to="/transactions"
          class="mt-6 inline-flex items-center gap-2 rounded-full bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow hover:bg-blue-700">
          Ghi nhận giao dịch
          <svg class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
            <path
              d="M7 4a1 1 0 011-1h8a1 1 0 011 1v8a1 1 0 11-2 0V6.414l-9.293 9.293a1 1 0 11-1.414-1.414L13.586 5H8a1 1 0 01-1-1z" />
          </svg>
        </NuxtLink>
      </div>

      <div v-else class="grid grid-cols-1 gap-6 md:grid-cols-3">
        <StatCard v-for="card in statCards" :key="card.key" :label="card.label" :amount="card.amount"
          :variant="card.variant" :chip-label="card.chipLabel" :description="card.description">
          <template v-if="card.key === 'income'" #meta>
            <span class="text-xs text-gray-400">{{ incomeShare }}% tổng thu + chi</span>
          </template>
          <template v-else-if="card.key === 'expense'" #meta>
            <span class="text-xs text-gray-400">{{ expenseShare }}% tổng thu + chi</span>
          </template>
        </StatCard>
      </div>
    </section>

    <section v-if="!isLoading && stats.count > 0" class="grid grid-cols-1 gap-6 lg:grid-cols-[2fr,1fr]">
      <DashboardChart :labels="lineChartData.labels" :income="lineChartData.income" :expense="lineChartData.expense"
        :loading="isLoading" :period-label="rangeLabel" />
      <CategoryChart :slices="categoryChartSlices" :loading="isLoading" />
    </section>

    <section class="rounded-2xl bg-white p-6 shadow-sm">
      <div class="flex flex-col gap-4">
        <div class="flex flex-wrap items-center gap-4 text-sm text-gray-600">
          <span>
            {{ stats.count }} giao dịch trong
            <span class="font-semibold text-gray-900">{{ rangeLabel }}</span>
          </span>
          <span
            class="inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700">
            <span class="h-2 w-2 rounded-full bg-blue-500" /> Thu {{ incomeShare }}%
            <span class="h-2 w-2 rounded-full bg-rose-500" /> Chi {{ expenseShare }}%
          </span>
        </div>

        <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <NuxtLink to="/transactions"
            class="group flex items-center rounded-2xl border border-gray-200 p-4 transition hover:border-blue-400 hover:bg-blue-50">
            <span class="mr-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 text-blue-600">
              <svg class="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 6v12m6-6H6" />
              </svg>
            </span>
            <div>
              <h3 class="font-semibold text-gray-900">Thêm giao dịch mới</h3>
              <p class="text-sm text-gray-500">Cập nhật thu chi để dashboard luôn chính xác</p>
            </div>
          </NuxtLink>

          <NuxtLink to="/transactions"
            class="group flex items-center rounded-2xl border border-gray-200 p-4 transition hover:border-emerald-400 hover:bg-emerald-50">
            <span
              class="mr-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600">
              <svg class="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
                <path stroke-linecap="round" stroke-linejoin="round"
                  d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" />
              </svg>
            </span>
            <div>
              <h3 class="font-semibold text-gray-900">Xem danh sách chi tiết</h3>
              <p class="text-sm text-gray-500">Quản lý {{ stats.count }} giao dịch trong kỳ đã chọn</p>
            </div>
          </NuxtLink>
        </div>
      </div>
    </section>
  </div>
</template>
