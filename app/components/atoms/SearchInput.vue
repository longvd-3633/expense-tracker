<template>
  <div class="relative">
    <div class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
      <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
    </div>
    <input :value="modelValue" @input="onInput" type="text" :placeholder="placeholder"
      class="w-full rounded-lg border border-gray-300 py-2 pl-10 pr-10 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20" />
    <button v-if="modelValue" @click="clear"
      class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600" aria-label="Clear search"
      type="button">
      <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
      </svg>
    </button>
  </div>
</template>

<script setup lang="ts">
import { useDebounceFn } from '@vueuse/core'

interface Props {
  modelValue: string
  placeholder?: string
  debounce?: number
}

const props = withDefaults(defineProps<Props>(), {
  placeholder: 'Search...',
  debounce: 300
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const debouncedUpdate = useDebounceFn((value: string) => {
  emit('update:modelValue', value)
}, props.debounce)

const onInput = (e: Event) => {
  const target = e.target as HTMLInputElement
  debouncedUpdate(target.value)
}

const clear = () => {
  emit('update:modelValue', '')
}
</script>
