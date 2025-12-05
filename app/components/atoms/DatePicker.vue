<script setup lang="ts">
import { format, parse } from 'date-fns'

interface Props {
  modelValue: Date | string
  label?: string
  disabled?: boolean
  error?: string
  required?: boolean
  min?: string
  max?: string
}

const props = withDefaults(defineProps<Props>(), {
  disabled: false,
  required: false,
})

const emit = defineEmits<{
  'update:modelValue': [value: Date]
  change: [value: Date]
}>()

const inputId = computed(() => `datepicker-${Math.random().toString(36).substr(2, 9)}`)

const formattedValue = computed(() => {
  if (!props.modelValue) return ''

  const date = props.modelValue instanceof Date
    ? props.modelValue
    : new Date(props.modelValue)

  return format(date, 'yyyy-MM-dd')
})

const handleChange = (event: Event) => {
  const target = event.target as HTMLInputElement
  const value = target.value

  if (value) {
    const date = parse(value, 'yyyy-MM-dd', new Date())
    emit('update:modelValue', date)
    emit('change', date)
  }
}
</script>

<template>
  <div class="w-full">
    <label v-if="label" :for="inputId" class="block text-sm font-medium text-gray-700 mb-1">
      {{ label }}
      <span v-if="required" class="text-red-500">*</span>
    </label>

    <input :id="inputId" type="date" :value="formattedValue" :disabled="disabled" :required="required" :min="min"
      :max="max" :class="[
        'w-full px-3 py-2 border rounded-lg transition-colors duration-200',
        'focus:outline-none focus:ring-2 focus:ring-offset-0',
        error
          ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
          : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500',
        disabled
          ? 'bg-gray-100 text-gray-500 cursor-not-allowed'
          : 'bg-white text-gray-900',
      ]" @change="handleChange" />

    <p v-if="error" class="mt-1 text-sm text-red-600">
      {{ error }}
    </p>
  </div>
</template>
