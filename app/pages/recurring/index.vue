<script setup lang="ts">
import type { RecurringTransaction, RecurringTransactionInput } from '~/types/transaction'

definePageMeta({
  layout: 'default',
})

const recurringStore = useRecurringStore()
const categoriesStore = useCategoriesStore()

// UI state
const showForm = ref(false)
const formMode = ref<'create' | 'edit'>('create')
const editingTemplate = ref<RecurringTransaction | null>(null)

// Initialize stores
onMounted(async () => {
  await Promise.all([
    categoriesStore.fetchCategories(),
    recurringStore.initialize(),
  ])
})

// Cleanup on unmount
onUnmounted(() => {
  recurringStore.cleanup()
})

// Open create form
const openCreateForm = () => {
  formMode.value = 'create'
  editingTemplate.value = null
  showForm.value = true
}

// Open edit form
const openEditForm = (template: RecurringTransaction) => {
  formMode.value = 'edit'
  editingTemplate.value = template
  showForm.value = true
}

// Handle form submit
const handleSubmit = async (data: RecurringTransactionInput) => {
  if (formMode.value === 'create') {
    const result = await recurringStore.createRecurringTransaction(data)
    if (result) {
      showForm.value = false
      // Show success message
      console.log('Created recurring transaction:', result.id)
    }
  } else if (formMode.value === 'edit' && editingTemplate.value) {
    const success = await recurringStore.updateRecurringTransaction(
      editingTemplate.value.id,
      data
    )
    if (success) {
      showForm.value = false
      editingTemplate.value = null
      console.log('Updated recurring transaction')
    }
  }
}

// Handle delete
const handleDelete = async (templateId: string) => {
  const success = await recurringStore.deleteRecurringTransaction(templateId)
  if (success) {
    console.log('Deleted recurring transaction:', templateId)
  }
}

// Handle skip
const handleSkip = async (templateId: string) => {
  const success = await recurringStore.skipNextOccurrence(templateId)
  if (success) {
    console.log('Skipped next occurrence for:', templateId)
  }
}

// Handle view details (placeholder)
const handleViewDetails = (template: RecurringTransaction) => {
  console.log('View details:', template)
  // TODO: Implement detail modal
}

// Prepare form initial data for edit mode
const formInitialData = computed<Partial<RecurringTransactionInput> | undefined>(() => {
  if (formMode.value === 'edit' && editingTemplate.value) {
    return {
      name: editingTemplate.value.name,
      type: editingTemplate.value.type,
      amount: editingTemplate.value.amount,
      categoryId: editingTemplate.value.categoryId,
      description: editingTemplate.value.description,
      frequency: editingTemplate.value.frequency,
      interval: editingTemplate.value.interval,
      startDate: editingTemplate.value.startDate,
      endDate: editingTemplate.value.endDate,
      weekdays: editingTemplate.value.weekdays,
      monthlyType: editingTemplate.value.monthlyType,
      monthlyDay: editingTemplate.value.monthlyDay,
      monthlyWeekday: editingTemplate.value.monthlyWeekday,
      monthlyWeekPosition: editingTemplate.value.monthlyWeekPosition,
      autoCreate: editingTemplate.value.autoCreate,
      maxOccurrences: editingTemplate.value.maxOccurrences,
    }
  }
  return undefined
})

useHead({
  title: 'Giao dịch định kỳ',
})
</script>

<template>
  <div class="container mx-auto px-4 py-8 max-w-6xl">
    <!-- Header -->
    <div class="mb-8">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-3xl font-bold text-slate-900 dark:text-white">
            Giao dịch định kỳ
          </h1>
          <p class="text-slate-600 dark:text-zinc-400 mt-2">
            Quản lý các mẫu giao dịch tự động lặp lại
          </p>
        </div>

        <Button variant="primary" @click="openCreateForm" class="flex items-center gap-2">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Tạo mẫu mới
        </Button>
      </div>

      <!-- Summary Stats -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
        <div class="bg-blue-50 dark:bg-blue-950/30 rounded-lg border border-blue-200 dark:border-blue-800 p-4">
          <div class="flex items-center gap-3">
            <div class="p-3 bg-blue-100 dark:bg-blue-900/50 rounded-lg">
              <svg class="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor"
                viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p class="text-sm text-slate-600 dark:text-zinc-400">Mẫu đang hoạt động</p>
              <p class="text-2xl font-bold text-slate-900 dark:text-white">
                {{ recurringStore.activeCount }}
              </p>
            </div>
          </div>
        </div>

        <div class="bg-green-50 dark:bg-green-950/30 rounded-lg border border-green-200 dark:border-green-800 p-4">
          <div class="flex items-center gap-3">
            <div class="p-3 bg-green-100 dark:bg-green-900/50 rounded-lg">
              <svg class="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor"
                viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
              </svg>
            </div>
            <div>
              <p class="text-sm text-slate-600 dark:text-zinc-400">Thu nhập định kỳ</p>
              <p class="text-2xl font-bold text-green-600">
                {{ recurringStore.getRecurringByType('income').length }}
              </p>
            </div>
          </div>
        </div>

        <div class="bg-red-50 dark:bg-red-950/30 rounded-lg border border-red-200 dark:border-red-800 p-4">
          <div class="flex items-center gap-3">
            <div class="p-3 bg-red-100 dark:bg-red-900/50 rounded-lg">
              <svg class="w-6 h-6 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 12H4" />
              </svg>
            </div>
            <div>
              <p class="text-sm text-slate-600 dark:text-zinc-400">Chi tiêu định kỳ</p>
              <p class="text-2xl font-bold text-red-600">
                {{ recurringStore.getRecurringByType('expense').length }}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Templates List -->
    <RecurringList :templates="recurringStore.activeRecurring" :loading="recurringStore.loading" @edit="openEditForm"
      @delete="handleDelete" @skip="handleSkip" @view-details="handleViewDetails" />

    <!-- Recurring Form Modal -->
    <RecurringForm :is-open="showForm" :mode="formMode" :initial-data="formInitialData"
      @update:is-open="showForm = $event" @submit="handleSubmit" />

    <!-- Error Display -->
    <div v-if="recurringStore.error"
      class="fixed bottom-4 right-4 bg-red-100 dark:bg-red-900/50 border border-red-400 dark:border-red-700 text-red-700 dark:text-red-300 px-4 py-3 rounded shadow-lg">
      <p class="font-medium">Lỗi</p>
      <p class="text-sm">{{ recurringStore.error }}</p>
    </div>
  </div>
</template>
