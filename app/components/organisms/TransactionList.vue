<script setup lang="ts">
import type { Transaction } from '~/types/transaction'

interface Props {
  transactions: Transaction[]
  loading?: boolean
  error?: string | null
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
  error: null,
})

const emit = defineEmits<{
  edit: [transaction: Transaction]
  delete: [id: string]
  retry: []
}>()

// Group transactions by date
const groupedTransactions = computed(() => {
  const groups = new Map<string, Transaction[]>()

  props.transactions.forEach((transaction) => {
    const dateKey = new Date(transaction.date).toISOString().split('T')[0]
    if (!groups.has(dateKey)) {
      groups.set(dateKey, [])
    }
    groups.get(dateKey)!.push(transaction)
  })

  // Sort groups by date (newest first)
  return Array.from(groups.entries())
    .sort(([dateA], [dateB]) => dateB.localeCompare(dateA))
    .map(([date, items]) => ({
      date,
      transactions: items.sort((a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      ),
    }))
})

const { formatDate } = useFormatters()

const formatGroupDate = (dateString: string) => {
  const date = new Date(dateString)
  const today = new Date()
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)

  if (date.toISOString().split('T')[0] === today.toISOString().split('T')[0]) {
    return 'Hôm nay'
  } else if (date.toISOString().split('T')[0] === yesterday.toISOString().split('T')[0]) {
    return 'Hôm qua'
  } else {
    return formatDate(date)
  }
}

const calculateGroupTotal = (transactions: Transaction[]) => {
  return transactions.reduce((sum, t) => {
    return sum + (t.type === 'income' ? t.amount : -t.amount)
  }, 0)
}
</script>

<template>
  <div class="w-full">
    <!-- Loading State -->
    <div v-if="loading" class="space-y-4">
      <div v-for="i in 3" :key="i" class="bg-white rounded-lg border border-gray-200 p-4 animate-pulse">
        <div class="flex items-center space-x-3">
          <div class="w-10 h-10 bg-gray-200 rounded-full" />
          <div class="flex-1 space-y-2">
            <div class="h-4 bg-gray-200 rounded w-1/4" />
            <div class="h-3 bg-gray-200 rounded w-1/2" />
          </div>
          <div class="h-6 bg-gray-200 rounded w-20" />
        </div>
      </div>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
      <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 text-red-400 mx-auto mb-3" fill="none"
        viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
          d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      <p class="text-red-700 font-medium mb-2">Không thể tải dữ liệu</p>
      <p class="text-red-600 text-sm mb-4">{{ error }}</p>
      <AtomsButton variant="danger" size="sm" @click="emit('retry')">
        Thử lại
      </AtomsButton>
    </div>

    <!-- Empty State -->
    <div v-else-if="!transactions.length"
      class="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-12 text-center">
      <svg xmlns="http://www.w3.org/2000/svg" class="h-16 w-16 text-gray-400 mx-auto mb-4" fill="none"
        viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
      <p class="text-gray-600 font-medium mb-2">Chưa có giao dịch nào</p>
      <p class="text-gray-500 text-sm">
        Bắt đầu theo dõi thu chi của bạn bằng cách thêm giao dịch đầu tiên
      </p>
    </div>

    <!-- Transaction List -->
    <div v-else class="space-y-6">
      <div v-for="group in groupedTransactions" :key="group.date" class="space-y-3">
        <!-- Date Header -->
        <div class="flex items-center justify-between">
          <h3 class="text-sm font-semibold text-gray-700">
            {{ formatGroupDate(group.date) }}
          </h3>
          <span :class="[
            'text-sm font-medium',
            calculateGroupTotal(group.transactions) >= 0
              ? 'text-green-600'
              : 'text-red-600',
          ]">
            {{ calculateGroupTotal(group.transactions) >= 0 ? '+' : '' }}
            {{ calculateGroupTotal(group.transactions).toLocaleString('vi-VN') }}₫
          </span>
        </div>

        <!-- Transaction Cards -->
        <div class="space-y-2">
          <MoleculesTransactionCard v-for="transaction in group.transactions" :key="transaction.id"
            :transaction="transaction" @edit="emit('edit', transaction)" @delete="emit('delete', $event)" />
        </div>
      </div>
    </div>
  </div>
</template>
