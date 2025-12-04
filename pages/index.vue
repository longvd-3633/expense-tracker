<template>
  <div>
    <div class="mb-6">
      <h1 class="text-3xl font-bold text-gray-900">Dashboard</h1>
      <p class="mt-2 text-sm text-gray-600">Tổng quan tình hình tài chính của bạn</p>
    </div>

    <!-- Period Selector -->
    <div class="mb-6 flex items-center justify-between">
      <div class="flex space-x-2">
        <button
          v-for="period in ['daily', 'weekly', 'monthly']"
          :key="period"
          @click="setPeriod(period as PeriodType)"
          :class="[
            'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
            currentPeriod === period
              ? 'bg-indigo-600 text-white'
              : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
          ]"
        >
          {{ period === 'daily' ? 'Ngày' : period === 'weekly' ? 'Tuần' : 'Tháng' }}
        </button>
      </div>

      <div class="flex items-center space-x-2">
        <button
          @click="goToPrevious"
          class="p-2 rounded-lg bg-white border border-gray-300 hover:bg-gray-50"
        >
          ←
        </button>
        <button
          v-if="!isToday"
          @click="goToToday"
          class="px-4 py-2 rounded-lg bg-white border border-gray-300 hover:bg-gray-50 text-sm"
        >
          Hôm nay
        </button>
        <button
          @click="goToNext"
          class="p-2 rounded-lg bg-white border border-gray-300 hover:bg-gray-50"
        >
          →
        </button>
      </div>
    </div>

    <!-- Summary Cards -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <div class="bg-white rounded-lg shadow p-6">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-gray-600">Tổng thu</p>
            <p class="mt-2 text-3xl font-bold text-green-600">{{ formatCurrency(periodIncome) }}</p>
          </div>
          <div class="p-3 bg-green-100 rounded-full">
            <span class="text-2xl">↑</span>
          </div>
        </div>
      </div>

      <div class="bg-white rounded-lg shadow p-6">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-gray-600">Tổng chi</p>
            <p class="mt-2 text-3xl font-bold text-red-600">{{ formatCurrency(periodExpense) }}</p>
          </div>
          <div class="p-3 bg-red-100 rounded-full">
            <span class="text-2xl">↓</span>
          </div>
        </div>
      </div>

      <div class="bg-white rounded-lg shadow p-6">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-gray-600">Số dư</p>
            <p :class="[
              'mt-2 text-3xl font-bold',
              periodBalance >= 0 ? 'text-indigo-600' : 'text-red-600'
            ]">
              {{ formatCurrency(periodBalance) }}
            </p>
          </div>
          <div class="p-3 bg-indigo-100 rounded-full">
            <span class="text-2xl">💰</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-if="periodTransactions.length === 0" class="bg-white rounded-lg shadow p-12 text-center">
      <div class="text-gray-400 text-5xl mb-4">📊</div>
      <h3 class="text-lg font-medium text-gray-900 mb-2">Chưa có giao dịch</h3>
      <p class="text-gray-600 mb-6">Bắt đầu bằng cách thêm giao dịch đầu tiên của bạn</p>
      <NuxtLink
        to="/transactions"
        class="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
      >
        Thêm giao dịch
      </NuxtLink>
    </div>

    <!-- Recent Transactions -->
    <div v-else class="bg-white rounded-lg shadow">
      <div class="p-6 border-b border-gray-200">
        <h2 class="text-lg font-semibold text-gray-900">Giao dịch gần đây</h2>
      </div>
      <div class="divide-y divide-gray-200">
        <div
          v-for="transaction in recentTransactions"
          :key="transaction.id"
          class="p-6 hover:bg-gray-50"
        >
          <div class="flex items-center justify-between">
            <div class="flex items-center space-x-4">
              <div
                :class="[
                  'w-10 h-10 rounded-full flex items-center justify-center',
                  transaction.type === 'income' ? 'bg-green-100' : 'bg-red-100'
                ]"
              >
                <span class="text-xl">
                  {{ getCategoryById(transaction.category)?.icon || '💵' }}
                </span>
              </div>
              <div>
                <p class="font-medium text-gray-900">{{ transaction.description }}</p>
                <p class="text-sm text-gray-500">
                  {{ getCategoryById(transaction.category)?.name }} • {{ formatDate(transaction.date) }}
                </p>
              </div>
            </div>
            <div
              :class="[
                'text-lg font-semibold',
                transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
              ]"
            >
              {{ transaction.type === 'income' ? '+' : '-' }}{{ formatCurrency(transaction.amount) }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { PeriodType } from '~/composables/useDateRange';

const transactionsStore = useTransactionsStore();
const categoriesStore = useCategoriesStore();
const { formatCurrency, formatDate } = useFormatters();
const {
  currentPeriod,
  dateRange,
  setPeriod,
  goToPrevious,
  goToNext,
  goToToday,
  isToday,
} = useDateRange();

const periodTransactions = computed(() => {
  return transactionsStore.getTransactionsByDateRange(
    dateRange.value.start,
    dateRange.value.end
  );
});

const periodIncome = computed(() => {
  return periodTransactions.value
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);
});

const periodExpense = computed(() => {
  return periodTransactions.value
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);
});

const periodBalance = computed(() => periodIncome.value - periodExpense.value);

const recentTransactions = computed(() => {
  return [...periodTransactions.value]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 10);
});

const getCategoryById = (id: string) => {
  return categoriesStore.getCategoryById(id);
};
</script>
