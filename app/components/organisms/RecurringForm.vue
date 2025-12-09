<script setup lang="ts">
import type { RecurringTransactionInput, RecurrenceFrequency, MonthlyType } from '~/types/transaction'
import { formatRecurrencePattern, calculateOccurrencesBetween } from '~/utils/recurrence'
import { addMonths, format as formatDate } from 'date-fns'
import { vi } from 'date-fns/locale'

interface Props {
  initialData?: Partial<RecurringTransactionInput>
  isOpen: boolean
  mode?: 'create' | 'edit'
}

const props = withDefaults(defineProps<Props>(), {
  isOpen: false,
  mode: 'create',
})

const emit = defineEmits<{
  'update:isOpen': [value: boolean]
  submit: [data: RecurringTransactionInput]
}>()

const categoriesStore = useCategoriesStore()

// Form state - using interface that allows undefined for proper two-way binding
interface FormData {
  name: string
  type: 'income' | 'expense'
  amount: number
  categoryId: string
  description: string
  frequency: RecurrenceFrequency
  interval: number
  startDate: Date
  endDate: Date | null
  weekdays?: number[]
  monthlyType: MonthlyType
  monthlyDay?: number
  monthlyWeekday?: number
  monthlyWeekPosition?: 'first' | 'second' | 'third' | 'fourth' | 'last'
  autoCreate: boolean
  maxOccurrences?: number | null
}

const formData = ref<FormData>({
  name: '',
  type: 'expense',
  amount: 0,
  categoryId: '',
  description: '',
  frequency: 'monthly',
  interval: 1,
  startDate: new Date(),
  endDate: null,
  weekdays: undefined,
  monthlyType: 'by_date',
  monthlyDay: 1,
  monthlyWeekday: undefined,
  monthlyWeekPosition: undefined,
  autoCreate: true,
  maxOccurrences: null,
})

const errors = ref<Record<string, string>>({})
const isSubmitting = ref(false)
const showPreview = ref(false)

// Computed writable refs for optional number fields to handle Input/Select component requirements
const monthlyDayModel = computed({
  get: () => formData.value.monthlyDay ?? 1,
  set: (val) => { formData.value.monthlyDay = val === '' ? undefined : Number(val) }
})

const monthlyWeekPositionModel = computed({
  get: () => formData.value.monthlyWeekPosition ?? 'first',
  set: (val) => { formData.value.monthlyWeekPosition = val as any }
})

const monthlyWeekdayModel = computed({
  get: () => formData.value.monthlyWeekday ?? 0,
  set: (val) => { formData.value.monthlyWeekday = val === '' ? undefined : Number(val) }
})

const maxOccurrencesModel = computed({
  get: () => formData.value.maxOccurrences ?? 0,
  set: (val) => { formData.value.maxOccurrences = val === '' || val === 0 ? null : Number(val) }
})

const endDateModel = computed({
  get: () => formData.value.endDate ?? new Date(),
  set: (val) => { formData.value.endDate = val }
})

// End condition options
const endCondition = ref<'never' | 'on_date' | 'after_count'>('never')

// Fetch categories when modal opens
watch(() => props.isOpen, async (isOpen) => {
  if (isOpen) {
    if (categoriesStore.categories.length === 0) {
      await categoriesStore.fetchCategories()
    }
    // Reset form if creating new
    if (props.mode === 'create' && !props.initialData) {
      resetForm()
    }
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
        name: data.name || '',
        type: data.type || 'expense',
        amount: data.amount || 0,
        categoryId: data.categoryId || '',
        description: data.description || '',
        frequency: data.frequency || 'monthly',
        interval: data.interval || 1,
        startDate: data.startDate || new Date(),
        endDate: data.endDate || null,
        weekdays: data.weekdays,
        monthlyType: data.monthlyType || 'by_date',
        monthlyDay: data.monthlyDay || 1,
        monthlyWeekday: data.monthlyWeekday,
        monthlyWeekPosition: data.monthlyWeekPosition,
        autoCreate: data.autoCreate ?? true,
        maxOccurrences: data.maxOccurrences || null,
      }

      // Set end condition based on data
      if (data.endDate) {
        endCondition.value = 'on_date'
      } else if (data.maxOccurrences) {
        endCondition.value = 'after_count'
      } else {
        endCondition.value = 'never'
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
    const validCategory = filteredCategories.value.find(
      (cat) => cat.id === formData.value.categoryId
    )
    if (!validCategory) {
      formData.value.categoryId = ''
    }
  }
)

// Watch frequency to set defaults
watch(
  () => formData.value.frequency,
  (newFrequency) => {
    if (newFrequency === 'weekly' && !formData.value.weekdays) {
      // Default to current day of week
      formData.value.weekdays = [new Date().getDay()]
    }
    if (newFrequency === 'monthly' && !formData.value.monthlyType) {
      formData.value.monthlyType = 'by_date'
      formData.value.monthlyDay = new Date().getDate()
    }
  }
)

// Watch end condition to update form data
watch(endCondition, (condition) => {
  if (condition === 'never') {
    formData.value.endDate = null
    formData.value.maxOccurrences = null
  } else if (condition === 'on_date') {
    formData.value.maxOccurrences = null
    if (!formData.value.endDate) {
      formData.value.endDate = addMonths(formData.value.startDate, 12)
    }
  } else if (condition === 'after_count') {
    formData.value.endDate = null
    if (!formData.value.maxOccurrences) {
      formData.value.maxOccurrences = 12
    }
  }
})

// Preview next occurrences
const nextOccurrences = computed(() => {
  try {
    const endDate = formData.value.endDate || addMonths(formData.value.startDate, 6)
    return calculateOccurrencesBetween(
      {
        frequency: formData.value.frequency,
        interval: formData.value.interval,
        startDate: formData.value.startDate,
        endDate: endDate,
        weekdays: formData.value.weekdays,
        monthlyType: formData.value.monthlyType,
        monthlyDay: formData.value.monthlyDay,
        monthlyWeekday: formData.value.monthlyWeekday,
        monthlyWeekPosition: formData.value.monthlyWeekPosition,
        maxOccurrences: formData.value.maxOccurrences || undefined,
      },
      formData.value.startDate,
      endDate
    ).slice(0, 5) // Show first 5 occurrences
  } catch (error) {
    console.error('Error calculating occurrences:', error)
    return []
  }
})

// Human-readable pattern description
const patternDescription = computed(() => {
  return formatRecurrencePattern({
    frequency: formData.value.frequency,
    interval: formData.value.interval,
    weekdays: formData.value.weekdays,
    monthlyType: formData.value.monthlyType,
    monthlyDay: formData.value.monthlyDay,
    monthlyWeekday: formData.value.monthlyWeekday,
    monthlyWeekPosition: formData.value.monthlyWeekPosition,
  })
})

// Weekday options for weekly recurrence
const weekdayOptions = [
  { value: 0, label: 'Chủ Nhật' },
  { value: 1, label: 'Thứ 2' },
  { value: 2, label: 'Thứ 3' },
  { value: 3, label: 'Thứ 4' },
  { value: 4, label: 'Thứ 5' },
  { value: 5, label: 'Thứ 6' },
  { value: 6, label: 'Thứ 7' },
]

// Week position options for monthly by weekday
const weekPositionOptions = [
  { value: 1, label: 'Đầu tiên' },
  { value: 2, label: 'Thứ hai' },
  { value: 3, label: 'Thứ ba' },
  { value: 4, label: 'Thứ tư' },
  { value: 5, label: 'Cuối cùng' },
]

// Validation
const validate = (): boolean => {
  errors.value = {}

  if (!formData.value.name.trim()) {
    errors.value.name = 'Tên giao dịch định kỳ là bắt buộc'
  }

  if (formData.value.amount <= 0) {
    errors.value.amount = 'Số tiền phải lớn hơn 0'
  }

  if (!formData.value.categoryId) {
    errors.value.categoryId = 'Danh mục là bắt buộc'
  }

  if (formData.value.interval <= 0) {
    errors.value.interval = 'Khoảng lặp lại phải lớn hơn 0'
  }

  if (formData.value.frequency === 'weekly' && (!formData.value.weekdays || formData.value.weekdays.length === 0)) {
    errors.value.weekdays = 'Chọn ít nhất một ngày trong tuần'
  }

  if (formData.value.frequency === 'monthly' && formData.value.monthlyType === 'by_date') {
    if (!formData.value.monthlyDay || formData.value.monthlyDay < 1 || formData.value.monthlyDay > 31) {
      errors.value.monthlyDay = 'Ngày trong tháng phải từ 1-31'
    }
  }

  if (formData.value.frequency === 'monthly' && formData.value.monthlyType === 'by_weekday') {
    if (formData.value.monthlyWeekday === undefined) {
      errors.value.monthlyWeekday = 'Chọn ngày trong tuần'
    }
    if (formData.value.monthlyWeekPosition === undefined) {
      errors.value.monthlyWeekPosition = 'Chọn vị trí trong tháng'
    }
  }

  if (endCondition.value === 'on_date' && formData.value.endDate) {
    if (formData.value.endDate <= formData.value.startDate) {
      errors.value.endDate = 'Ngày kết thúc phải sau ngày bắt đầu'
    }
  }

  if (endCondition.value === 'after_count' && formData.value.maxOccurrences) {
    if (formData.value.maxOccurrences <= 0) {
      errors.value.maxOccurrences = 'Số lần lặp phải lớn hơn 0'
    }
  }

  return Object.keys(errors.value).length === 0
}

// Submit handler
const handleSubmit = async () => {
  if (!validate()) {
    return
  }

  isSubmitting.value = true

  try {
    emit('submit', formData.value)
  } finally {
    isSubmitting.value = false
  }
}

// Close handler
const handleClose = () => {
  emit('update:isOpen', false)
}

// Reset form
const resetForm = () => {
  formData.value = {
    name: '',
    type: 'expense',
    amount: 0,
    categoryId: '',
    description: '',
    frequency: 'monthly',
    interval: 1,
    startDate: new Date(),
    endDate: null,
    weekdays: undefined,
    monthlyType: 'by_date',
    monthlyDay: new Date().getDate(),
    monthlyWeekday: undefined,
    monthlyWeekPosition: undefined,
    autoCreate: true,
    maxOccurrences: null,
  }
  endCondition.value = 'never'
  errors.value = {}
}

// Toggle weekday selection
const toggleWeekday = (day: number) => {
  if (!formData.value.weekdays) {
    formData.value.weekdays = [day]
  } else {
    const index = formData.value.weekdays.indexOf(day)
    if (index > -1) {
      formData.value.weekdays.splice(index, 1)
    } else {
      formData.value.weekdays.push(day)
    }
  }
}
</script>

<template>
  <div v-if="isOpen" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
    @click.self="handleClose">
    <div class="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
      <!-- Header -->
      <div class="sticky top-0 bg-white border-b border-gray-200 px-6 py-4">
        <div class="flex items-center justify-between">
          <h2 class="text-xl font-semibold text-gray-900">
            {{ mode === 'edit' ? 'Chỉnh sửa giao dịch định kỳ' : 'Tạo giao dịch định kỳ' }}
          </h2>
          <button @click="handleClose" class="text-gray-400 hover:text-gray-600">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      <!-- Form -->
      <form @submit.prevent="handleSubmit" class="p-6 space-y-6">
        <!-- Template Name -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Tên mẫu *
          </label>
          <Input v-model="formData.name" placeholder="VD: Lương hằng tháng, Tiền thuê nhà" :error="errors.name" />
        </div>

        <!-- Type & Amount -->
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Loại *
            </label>
            <Select v-model="formData.type" :options="[
              { value: 'income', label: 'Thu' },
              { value: 'expense', label: 'Chi' },
            ]" />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Số tiền *
            </label>
            <Input v-model.number="formData.amount" type="number" placeholder="0" :error="errors.amount" />
          </div>
        </div>

        <!-- Category -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Danh mục *
          </label>
          <Select v-model="formData.categoryId" :options="categoryOptions" placeholder="Chọn danh mục"
            :error="errors.categoryId" />
        </div>

        <!-- Description -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Mô tả
          </label>
          <Input v-model="formData.description" placeholder="Ghi chú thêm" />
        </div>

        <!-- Divider -->
        <div class="border-t border-gray-200"></div>

        <!-- Recurrence Pattern -->
        <div class="space-y-4">
          <h3 class="text-lg font-medium text-gray-900">Lịch lặp lại</h3>

          <!-- Frequency & Interval -->
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Tần suất *
              </label>
              <Select v-model="formData.frequency" :options="[
                { value: 'daily', label: 'Hằng ngày' },
                { value: 'weekly', label: 'Hằng tuần' },
                { value: 'monthly', label: 'Hằng tháng' },
                { value: 'yearly', label: 'Hằng năm' },
              ]" />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Mỗi
              </label>
              <Input v-model="formData.interval" type="number" :min="1"
                :placeholder="formData.frequency === 'daily' ? 'ngày' : formData.frequency === 'weekly' ? 'tuần' : formData.frequency === 'monthly' ? 'tháng' : 'năm'"
                :error="errors.interval" />
            </div>
          </div>

          <!-- Weekly: Weekday Selection -->
          <div v-if="formData.frequency === 'weekly'">
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Chọn ngày trong tuần *
            </label>
            <div class="flex flex-wrap gap-2">
              <button v-for="day in weekdayOptions" :key="day.value" type="button" @click="toggleWeekday(day.value)"
                :class="[
                  'px-3 py-2 rounded-md text-sm font-medium transition-colors',
                  formData.weekdays?.includes(day.value)
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                ]">
                {{ day.label }}
              </button>
            </div>
            <p v-if="errors.weekdays" class="mt-1 text-sm text-red-600">
              {{ errors.weekdays }}
            </p>
          </div>

          <!-- Monthly: Type Selection -->
          <div v-if="formData.frequency === 'monthly'">
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Loại lặp lại hằng tháng *
            </label>
            <div class="space-y-2">
              <label class="flex items-center">
                <input type="radio" v-model="formData.monthlyType" value="by_date" class="mr-2" />
                <span class="text-sm text-gray-700">Theo ngày trong tháng</span>
              </label>
              <label class="flex items-center">
                <input type="radio" v-model="formData.monthlyType" value="by_weekday" class="mr-2" />
                <span class="text-sm text-gray-700">Theo ngày trong tuần</span>
              </label>
            </div>

            <!-- By Date -->
            <div v-if="formData.monthlyType === 'by_date'" class="mt-3">
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Ngày trong tháng (1-31)
              </label>
              <Input v-model="monthlyDayModel" type="number" :min="1" :max="31" placeholder="15"
                :error="errors.monthlyDay" />
            </div>

            <!-- By Weekday -->
            <div v-if="formData.monthlyType === 'by_weekday'" class="mt-3 space-y-3">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  Vị trí
                </label>
                <Select v-model="monthlyWeekPositionModel" :options="weekPositionOptions" placeholder="Chọn vị trí"
                  :error="errors.monthlyWeekPosition" />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  Ngày trong tuần
                </label>
                <Select v-model="monthlyWeekdayModel" :options="weekdayOptions" placeholder="Chọn ngày"
                  :error="errors.monthlyWeekday" />
              </div>
            </div>
          </div>

          <!-- Start Date -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Ngày bắt đầu *
            </label>
            <DatePicker v-model="formData.startDate" />
          </div>

          <!-- End Condition -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Kết thúc
            </label>
            <div class="space-y-3">
              <label class="flex items-center">
                <input type="radio" v-model="endCondition" value="never" class="mr-2" />
                <span class="text-sm text-gray-700">Không bao giờ</span>
              </label>

              <label class="flex items-center">
                <input type="radio" v-model="endCondition" value="on_date" class="mr-2" />
                <span class="text-sm text-gray-700">Vào ngày</span>
              </label>
              <div v-if="endCondition === 'on_date'" class="ml-6">
                <DatePicker v-model="endDateModel" :error="errors.endDate" />
              </div>

              <label class="flex items-center">
                <input type="radio" v-model="endCondition" value="after_count" class="mr-2" />
                <span class="text-sm text-gray-700">Sau</span>
              </label>
              <div v-if="endCondition === 'after_count'" class="ml-6">
                <Input v-model="maxOccurrencesModel" type="number" :min="1" placeholder="12" suffix="lần"
                  :error="errors.maxOccurrences" />
              </div>
            </div>
          </div>
        </div>

        <!-- Preview -->
        <div class="bg-blue-50 rounded-lg p-4">
          <div class="flex items-start gap-2 mb-3">
            <svg class="w-5 h-5 text-blue-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div class="flex-1">
              <p class="text-sm font-medium text-blue-900">
                {{ patternDescription }}
              </p>
              <p class="text-xs text-blue-700 mt-1">
                5 lần tiếp theo:
              </p>
              <ul class="text-xs text-blue-600 mt-1 space-y-0.5">
                <li v-for="(date, index) in nextOccurrences" :key="index">
                  {{ formatDate(date, 'dd/MM/yyyy (EEEE)', { locale: vi }) }}
                </li>
              </ul>
            </div>
          </div>
        </div>

        <!-- Auto Create Toggle -->
        <div>
          <label class="flex items-center">
            <input type="checkbox" v-model="formData.autoCreate" class="mr-2 rounded" />
            <span class="text-sm text-gray-700">
              Tự động tạo giao dịch (khuyến nghị)
            </span>
          </label>
          <p class="text-xs text-gray-500 mt-1 ml-6">
            Nếu tắt, bạn cần tạo giao dịch thủ công từ mẫu này
          </p>
        </div>

        <!-- Actions -->
        <div class="flex gap-3 pt-4">
          <Button type="submit" variant="primary" :loading="isSubmitting" class="flex-1">
            {{ mode === 'edit' ? 'Cập nhật' : 'Tạo mẫu' }}
          </Button>
          <Button type="button" variant="secondary" @click="handleClose" :disabled="isSubmitting">
            Hủy
          </Button>
        </div>
      </form>
    </div>
  </div>
</template>
