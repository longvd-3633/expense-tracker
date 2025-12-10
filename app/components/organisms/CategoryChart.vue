<script setup lang="ts">
import { computed } from 'vue'
import { Doughnut } from 'vue-chartjs'
import { Chart, ArcElement, Tooltip, Legend } from 'chart.js'

Chart.register(ArcElement, Tooltip, Legend)

interface CategorySlice {
  label: string
  value: number
  color: string
  categoryId?: string | null
  isOthers?: boolean
}

const props = withDefaults(defineProps<{ slices: CategorySlice[]; loading?: boolean; title?: string }>(), {
  slices: () => [],
  loading: false,
  title: 'Cơ cấu chi tiêu theo danh mục',
})

const emit = defineEmits<{
  sliceClick: [categoryId: string | null | undefined, isOthers: boolean]
}>()

const { formatCurrency } = useFormatters()

// Detect dark mode for chart colors
const colorMode = useColorMode()
const isDark = computed(() => colorMode.value === 'dark')

const totalValue = computed(() => props.slices.reduce((sum, slice) => sum + slice.value, 0))
const hasData = computed(() => totalValue.value > 0)
const minAngle = computed(() => (props.slices.length ? Math.PI * 0.02 : 0))

const chartData = computed(() => ({
  labels: props.slices.map(slice => slice.label),
  datasets: [
    {
      data: props.slices.map(slice => slice.value),
      backgroundColor: props.slices.map(slice => slice.color),
      hoverOffset: 8,
      borderWidth: 0,
    },
  ],
}))

const chartOptions = computed(() => ({
  responsive: true,
  maintainAspectRatio: false,
  cutout: '60%',
  animation: { duration: 300 },
  layout: { padding: 20 },
  onClick: (_event: any, elements: any[]) => {
    if (elements.length > 0) {
      const index = elements[0].index
      const slice = props.slices[index]
      if (slice) {
        emit('sliceClick', slice.categoryId, slice.isOthers || false)
      }
    }
  },
  plugins: {
    legend: { display: false },
    tooltip: {
      backgroundColor: isDark.value ? '#3F3F46' : '#0F172A',
      titleColor: '#F8FAFC',
      bodyColor: '#E2E8F0',
      borderColor: isDark.value ? '#52525B' : '#1E293B',
      borderWidth: 1,
      callbacks: {
        title(context: any) {
          return context[0]?.label || ''
        },
        label(context: any) {
          const label = context.label || ''
          const value = typeof context.parsed === 'number' ? context.parsed : 0
          const percentage = totalValue.value ? ((value / totalValue.value) * 100).toFixed(1) : '0.0'
          return `${label}: ${formatCurrency(value)} · ${percentage}%`
        },
      },
    },
  },
  elements: {
    arc: {
      borderWidth: 2,
      borderColor: isDark.value ? '#27272A' : '#ffffff',
      hoverOffset: 14,
      minAngle: minAngle.value,
    },
  },
}))

const legendItems = computed(() =>
  props.slices.map(slice => ({
    ...slice,
    percentage: totalValue.value ? ((slice.value / totalValue.value) * 100).toFixed(1) : '0.0',
  }))
)
</script>

<template>
  <section
    class="rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 shadow-sm h-full flex flex-col">
    <header class="mb-4">
      <p class="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-500">{{ title }}</p>
      <p class="text-sm text-slate-500 dark:text-zinc-400">Tổng chi: {{ formatCurrency(totalValue) }}</p>
    </header>

    <div v-if="loading" class="h-72 w-full animate-pulse rounded-xl bg-slate-50 dark:bg-zinc-800" />

    <div v-else>
      <div v-if="!hasData"
        class="rounded-xl border border-dashed border-slate-200 dark:border-zinc-700 bg-slate-50/60 dark:bg-zinc-800/60 p-8 text-center text-sm text-slate-500 dark:text-zinc-400">
        Không có dữ liệu chi tiêu trong giai đoạn này
      </div>

      <div v-else class="flex flex-col gap-6 lg:flex-row lg:items-center">
        <ClientOnly>
          <div class="relative mx-auto h-64 w-64 cursor-pointer">
            <Doughnut :data="chartData" :options="chartOptions" />
            <div
              class="absolute inset-0 flex flex-col items-center justify-center px-4 text-center pointer-events-none">
              <span class="text-sm uppercase tracking-widest text-slate-400 dark:text-zinc-500">Tổng chi</span>
              <span class="text-lg font-semibold text-slate-900 dark:text-white whitespace-nowrap">{{
                formatCurrency(totalValue) }}</span>
            </div>
          </div>
          <template #fallback>
            <div class="h-64 w-64 animate-pulse rounded-full bg-slate-50 dark:bg-zinc-800" />
          </template>
        </ClientOnly>

        <ul class="flex-1 space-y-3">
          <li v-for="item in legendItems" :key="item.label" class="flex items-center justify-between text-sm">
            <div class="flex items-center gap-3">
              <span class="inline-flex h-3 w-3 rounded-full" :style="{ backgroundColor: item.color }" />
              <span class="font-medium text-slate-900 dark:text-white">{{ item.label }}</span>
              <span v-if="item.isOthers"
                class="rounded-full bg-slate-100 dark:bg-zinc-800 px-2 py-0.5 text-xs text-slate-500 dark:text-zinc-400">Gộp</span>
            </div>
            <div class="text-right text-slate-500 dark:text-zinc-400">
              <p class="font-medium text-slate-900 dark:text-white">{{ formatCurrency(item.value) }}</p>
              <p class="text-xs">{{ item.percentage }}%</p>
            </div>
          </li>
        </ul>
      </div>
    </div>
  </section>
</template>
