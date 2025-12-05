<script setup lang="ts">
import type { Transaction, TransactionInput } from '~/types/transaction'

definePageMeta({
  middleware: 'auth',
})

const transactionsStore = useTransactionsStore()
const categoriesStore = useCategoriesStore()

const isFormOpen = ref(false)
const editingTransaction = ref<Transaction | null>(null)
const isLoading = ref(true)

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

const handleDeleteTransaction = async (id: string) => {
  if (confirm('Bạn có chắc chắn muốn xóa giao dịch này?')) {
    try {
      await transactionsStore.deleteTransaction(id)
    } catch (error) {
      console.error('Error deleting transaction:', error)
    }
  }
}

const handleRetry = async () => {
  isLoading.value = true
  await transactionsStore.fetchTransactions()
  isLoading.value = false
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

    <!-- Transaction List -->
    <OrganismsTransactionList :transactions="transactionsStore.sortedTransactions" :loading="isLoading"
      :error="transactionsStore.error" @edit="handleEditTransaction" @delete="handleDeleteTransaction"
      @retry="handleRetry" />

    <!-- Transaction Form Modal -->
    <OrganismsTransactionForm v-model:is-open="isFormOpen" :initial-data="formInitialData" @submit="handleSubmit" />
  </div>
</template>
