<script setup lang="ts">
import type { TransactionInput } from '~/types/transaction'
import { validateTransaction } from '~/utils/validators'

interface Props {
  initialData?: Partial<TransactionInput>
  isOpen: boolean
}

const props = withDefaults(defineProps<Props>(), {
  isOpen: false,
})

const emit = defineEmits<{
  'update:isOpen': [value: boolean]
  submit: [data: TransactionInput]
}>()

const categoriesStore = useCategoriesStore()

// Form state
const formData = ref<TransactionInput>({
  date: new Date(),
  type: 'expense',
  amount: 0,
  category: '',
  description: '',
  tags: [],
})

const errors = ref<Record<string, string>>({})
const isSubmitting = ref(false)

// Fetch categories when modal opens if categories are empty
watch(() => props.isOpen, async (isOpen) => {
  if (isOpen && categoriesStore.categories.length === 0) {
    await categoriesStore.fetchCategories()
  }
})

// Filtered categories based on transaction type
const filteredCategories = computed(() => {
  if (formData.value.type === 'income') {
    return categoriesStore.incomeCategories
  } else {
    return categoriesStore.expenseCategories
  }
})

const categoryOptions = computed(() => {
  return filteredCategories.value.map((cat) => ({
    value: cat.id,
    label: cat.name,
  }))
})

// Watch for initial data changes
watch(
  () => props.initialData,
  (data) => {
    if (data) {
      formData.value = {
        date: data.date || new Date(),
        type: data.type || 'expense',
        amount: data.amount || 0,
        category: data.category || '',
        description: data.description || '',
        tags: data.tags || [],
      }
      errors.value = {}
    }
  },
  { immediate: true }
)

// Watch for type changes to reset category
watch(
  () => formData.value.type,
  () => {
    // Reset category when type changes if current category is not in filtered list
    const validCategory = filteredCategories.value.find(
      (cat) => cat.id === formData.value.category
    )
    if (!validCategory) {
      formData.value.category = ''
    }
  }
)

// Validation on blur
const validateField = (field: keyof TransactionInput) => {
  const result = validateTransaction(formData.value)

  if (!result.success) {
    const fieldError = result.error.errors.find((err) => err.path[0] === field)
    if (fieldError) {
      errors.value[field] = fieldError.message
    } else {
      delete errors.value[field]
    }
  } else {
    delete errors.value[field]
  }
}

// Submit handler
const handleSubmit = async () => {
  // Validate all fields
  const result = validateTransaction(formData.value)

  if (!result.success) {
    errors.value = {}
    result.error.errors.forEach((err) => {
      errors.value[err.path[0] as string] = err.message
    })
    return
  }

  isSubmitting.value = true

  try {
    emit('submit', formData.value)
    handleClose()
  } catch (error) {
    console.error('Error submitting transaction:', error)
  } finally {
    isSubmitting.value = false
  }
}

const handleClose = () => {
  emit('update:isOpen', false)
  // Reset form after closing animation
  setTimeout(() => {
    formData.value = {
      date: new Date(),
      type: 'expense',
      amount: 0,
      category: '',
      description: '',
      tags: [],
    }
    errors.value = {}
  }, 300)
}

// Close on Escape key
const handleKeydown = (event: KeyboardEvent) => {
  if (event.key === 'Escape' && props.isOpen) {
    handleClose()
  }
}

onMounted(() => {
  window.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown)
})
</script>

<template>
  <Teleport to="body">
    <Transition enter-active-class="transition ease-out duration-300" enter-from-class="opacity-0"
      enter-to-class="opacity-100" leave-active-class="transition ease-in duration-200" leave-from-class="opacity-100"
      leave-to-class="opacity-0">
      <div v-if="isOpen" class="fixed inset-0 z-50 overflow-y-auto" @click.self="handleClose">
        <!-- Backdrop -->
        <div class="fixed inset-0 bg-black bg-opacity-50" />

        <!-- Modal -->
        <div class="flex min-h-full items-center justify-center p-4">
          <Transition enter-active-class="transition ease-out duration-300" enter-from-class="opacity-0 scale-95"
            enter-to-class="opacity-100 scale-100" leave-active-class="transition ease-in duration-200"
            leave-from-class="opacity-100 scale-100" leave-to-class="opacity-0 scale-95">
            <div v-if="isOpen" class="relative bg-white rounded-2xl shadow-2xl max-w-xl w-full p-6" @click.stop>
              <!-- Header -->
              <div class="flex items-center justify-between mb-4">
                <h2 class="text-xl font-semibold text-gray-900">
                  {{ initialData?.category ? 'Chỉnh sửa giao dịch' : 'Thêm giao dịch' }}
                </h2>
                <button class="text-gray-400 hover:text-gray-600 transition-colors" @click="handleClose">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24"
                    stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <!-- Form -->
              <form @submit.prevent="handleSubmit">
                <div class="space-y-6">
                  <div class="rounded-xl border border-gray-100 bg-slate-50 p-4 shadow-inner">
                    <div class="flex items-center justify-between">
                      <div>
                        <p class="text-xs uppercase tracking-[0.3em] text-gray-400">Loại</p>
                        <p class="text-lg font-semibold text-gray-900">{{ initialData?.category ? 'Chỉnh sửa' : 'Tạo mới' }}</p>
                      </div>
                      <span class="text-sm text-gray-500">Bắt buộc *</span>
                    </div>
                    <div class="mt-4 grid grid-cols-2 gap-3">
                      <button type="button" :class="[
                        'px-4 py-2 rounded-2xl font-medium transition-all duration-200',
                        formData.type === 'income'
                          ? 'bg-green-600 text-white shadow-lg'
                          : 'bg-white text-gray-600 border border-gray-200 hover:border-gray-300',
                      ]" @click="formData.type = 'income'">
                        Thu nhập
                      </button>
                      <button type="button" :class="[
                        'px-4 py-2 rounded-2xl font-medium transition-all duration-200',
                        formData.type === 'expense'
                          ? 'bg-red-600 text-white shadow-lg'
                          : 'bg-white text-gray-600 border border-gray-200 hover:border-gray-300',
                      ]" @click="formData.type = 'expense'">
                        Chi tiêu
                      </button>
                    </div>
                  </div>

                  <div class="grid gap-4 md:grid-cols-2">
                    <div>
                      <DatePicker v-model="formData.date" label="Ngày" required :error="errors.date"
                        @blur="validateField('date')" />
                    </div>
                    <div>
                      <Input v-model="formData.amount" type="number" label="Số tiền" placeholder="0" required :min="0"
                        :step="1000" :error="errors.amount" @blur="validateField('amount')" />
                    </div>
                  </div>

                  <div>
                    <Select v-model="formData.category" label="Danh mục" placeholder="Chọn danh mục" required
                      :options="categoryOptions" :error="errors.category" @change="validateField('category')" />
                  </div>

                  <div>
                    <label for="description" class="block text-sm font-medium text-gray-700 mb-1">
                      Ghi chú
                    </label>
                    <textarea id="description" v-model="formData.description" rows="3"
                      class="w-full px-3 py-2 border border-gray-300 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-sm"
                      placeholder="Thêm ghi chú cho giao dịch này..."></textarea>
                  </div>
                </div>

                <!-- Actions -->
                <div class="mt-6 flex items-center justify-end space-x-3">
                  <Button type="button" variant="ghost" @click="handleClose">
                    Hủy
                  </Button>
                  <Button type="submit" variant="primary" :loading="isSubmitting" :disabled="isSubmitting">
                    {{ initialData?.category ? 'Cập nhật' : 'Thêm' }}
                  </Button>
                </div>
              </form>
            </div>
          </Transition>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>
