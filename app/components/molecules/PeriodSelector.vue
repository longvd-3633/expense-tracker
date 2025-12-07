<script setup lang="ts">
import type { PeriodType } from '~/composables/useDateRange'

const props = withDefaults(defineProps<{
  modelValue: PeriodType
  options?: PeriodType[]
}>(), {
  options: () => ['daily', 'weekly', 'monthly'],
})

const emit = defineEmits<{
  (e: 'update:modelValue', value: PeriodType): void
  (e: 'change', value: PeriodType): void
}>()

const labels: Record<PeriodType, { label: string; hint: string }> = {
  daily: { label: 'Theo ngày', hint: 'Nhịp biến động từng ngày' },
  weekly: { label: 'Theo tuần', hint: 'Bao quát 7 ngày, bắt đầu từ thứ 2' },
  monthly: { label: 'Theo tháng', hint: 'Tổng quan trong tháng hiện tại' },
}

const handleSelect = (value: PeriodType) => {
  if (value === props.modelValue) return
  emit('update:modelValue', value)
  emit('change', value)
}
</script>

<template>
  <div class="flex flex-wrap gap-3" role="tablist" aria-label="Chọn chu kỳ thống kê">
    <button v-for="option in props.options" :key="option" type="button" role="tab"
      :aria-selected="props.modelValue === option"
      class="flex-1 min-w-[140px] rounded-2xl border px-4 py-3 text-left transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
      :class="props.modelValue === option
        ? 'border-blue-200 bg-blue-50 text-blue-700 shadow-sm'
        : 'border-gray-200 text-gray-600 hover:border-blue-200 hover:text-blue-600'" @click="handleSelect(option)">
      <span class="text-sm font-semibold">{{ labels[option].label }}</span>
      <p class="text-xs text-gray-500">{{ labels[option].hint }}</p>
    </button>
  </div>
</template>
