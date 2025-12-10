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
        ? 'border-blue-300 dark:border-blue-500/50 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 shadow-sm'
        : 'border-slate-200 dark:border-zinc-600 text-slate-600 dark:text-zinc-300 hover:border-blue-300 dark:hover:border-blue-500/50 hover:text-blue-600 dark:hover:text-blue-400'"
      @click="handleSelect(option)">
      <span class="text-sm font-semibold">{{ labels[option].label }}</span>
      <p class="text-xs text-slate-500 dark:text-zinc-400">{{ labels[option].hint }}</p>
    </button>
  </div>
</template>
