<script setup lang="ts">
interface Props {
  modelValue: string | number
  type?: 'text' | 'number' | 'email' | 'password' | 'tel'
  label?: string
  placeholder?: string
  disabled?: boolean
  error?: string
  hint?: string
  required?: boolean
  min?: number
  max?: number
  step?: number
}

const props = withDefaults(defineProps<Props>(), {
  type: 'text',
  disabled: false,
  required: false,
})

const emit = defineEmits<{
  'update:modelValue': [value: string | number]
  blur: [event: FocusEvent]
  focus: [event: FocusEvent]
}>()

const inputId = computed(() => `input-${Math.random().toString(36).substr(2, 9)}`)

const handleInput = (event: Event) => {
  const target = event.target as HTMLInputElement
  if (props.type === 'number') {
    emit('update:modelValue', target.valueAsNumber || 0)
  } else {
    emit('update:modelValue', target.value)
  }
}
</script>

<template>
  <div class="w-full">
    <label v-if="label" :for="inputId" class="block text-sm font-medium text-gray-700 mb-1">
      {{ label }}
      <span v-if="required" class="text-red-500">*</span>
    </label>

    <input :id="inputId" :type="type" :value="modelValue" :placeholder="placeholder" :disabled="disabled"
      :required="required" :min="min" :max="max" :step="step" :class="[
        'w-full px-3 py-2 border rounded-lg transition-colors duration-200',
        'focus:outline-none focus:ring-2 focus:ring-offset-0',
        error
          ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
          : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500',
        disabled
          ? 'bg-gray-100 text-gray-500 cursor-not-allowed'
          : 'bg-white text-gray-900',
      ]" @input="handleInput" @blur="emit('blur', $event)" @focus="emit('focus', $event)" />

    <p v-if="error" class="mt-1 text-sm text-red-600">
      {{ error }}
    </p>

    <p v-else-if="hint" class="mt-1 text-sm text-gray-500">
      {{ hint }}
    </p>
  </div>
</template>
