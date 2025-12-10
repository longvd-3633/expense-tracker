<script setup lang="ts">
import { computed } from 'vue'
import { Line } from 'vue-chartjs'
import {
  Chart,
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js'
import type { TooltipItem } from 'chart.js'

Chart.register(LineElement, PointElement, LinearScale, CategoryScale, Tooltip, Legend, Filler)

interface DashboardChartProps {
  labels: string[]
  income: number[]
  expense: number[]
  loading?: boolean
  title?: string
  periodLabel?: string
  emptyLabel?: string
}

const props = withDefaults(defineProps<DashboardChartProps>(), {
  labels: () => [],
  income: () => [],
  expense: () => [],
  loading: false,
  title: 'Diễn biến thu · chi',
  periodLabel: '',
  emptyLabel: 'Không có dữ liệu trong khoảng thời gian này',
})

const { formatCurrency } = useFormatters()
const tooltipDateFormatter = new Intl.DateTimeFormat('vi-VN', { day: '2-digit', month: 'short' })

// Detect dark mode for chart colors
const colorMode = useColorMode()
const isDark = computed(() => colorMode.value === 'dark')

const hasValues = computed(() => {
  return props.income.some(value => value > 0) || props.expense.some(value => value > 0)
})

const chartData = computed(() => ({
  labels: props.labels,
  datasets: [
    {
      label: 'Thu nhập',
      data: props.income,
      borderColor: '#10B981',
      backgroundColor: 'rgba(16, 185, 129, 0.15)',
      tension: 0.35,
      pointRadius: 3,
      pointHoverRadius: 5,
      fill: true,
    },
    {
      label: 'Chi tiêu',
      data: props.expense,
      borderColor: '#EF4444',
      backgroundColor: 'rgba(239, 68, 68, 0.15)',
      tension: 0.35,
      pointRadius: 3,
      pointHoverRadius: 5,
      fill: true,
    },
  ],
}))

const chartOptions = computed(() => ({
  responsive: true,
  maintainAspectRatio: false,
  animation: { duration: 420, easing: 'easeOutCubic' as const },
  layout: { padding: { top: 12, bottom: 16, left: 0, right: 0 } },
  interaction: { intersect: false, mode: 'index' as const },
  plugins: {
    legend: {
      display: true,
      position: 'bottom' as const,
      align: 'end' as const,
      labels: {
        usePointStyle: true,
        pointStyle: 'circle',
        padding: 18,
        boxWidth: 10,
        font: { size: 12 },
        color: isDark.value ? '#A1A1AA' : '#475569',
      },
      onClick(event: any, legendItem: any, legend: any) {
        const ci = legend.chart
        const datasetIndex = legendItem.datasetIndex ?? 0
        const meta = ci.getDatasetMeta(datasetIndex)
        meta.hidden = !meta.hidden
        ci.update()
      },
    },
    tooltip: {
      backgroundColor: isDark.value ? '#3F3F46' : '#0F172A',
      titleColor: '#F8FAFC',
      bodyColor: '#E2E8F0',
      borderColor: isDark.value ? '#52525B' : '#1E293B',
      borderWidth: 1,
      padding: 10,
      caretPadding: 6,
      callbacks: {
        title(context: TooltipItem<'line'>[]) {
          const label = context[0]?.label
          if (!label) return ''
          const parsedDate = new Date(label)
          const formatted = Number.isNaN(parsedDate.getTime()) ? label : tooltipDateFormatter.format(parsedDate)
          return `Ngày ${formatted}`
        },
        label(context: TooltipItem<'line'>) {
          const datasetLabel = context.dataset?.label ?? ''
          const parsedValue =
            typeof context.parsed === 'number'
              ? context.parsed
              : typeof context.parsed?.y === 'number'
                ? context.parsed.y
                : 0
          return `${datasetLabel}: ${formatCurrency(parsedValue)}`
        },
        footer(context: TooltipItem<'line'>[]) {
          if (!context.length) return ''
          const total = context.reduce((acc, item) => acc + (item.parsed?.y ?? 0), 0)
          return `Tổng: ${formatCurrency(total)}`
        },
      },
    },
  },
  scales: {
    x: {
      grid: {
        color: isDark.value ? 'rgba(63, 63, 70, 0.5)' : 'rgba(15,23,42,0.05)',
        borderColor: isDark.value ? '#52525B' : '#E2E8F0'
      },
      ticks: {
        maxRotation: 0,
        autoSkip: true,
        color: isDark.value ? '#A1A1AA' : '#475569',
        padding: 6,
        font: { size: 12 },
      },
    },
    y: {
      beginAtZero: true,
      ticks: {
        callback(value: string | number) {
          const numericValue = typeof value === 'string' ? Number(value) : value
          return formatCurrency(numericValue)
        },
        color: isDark.value ? '#A1A1AA' : '#64748B',
        padding: 8,
      },
      grid: {
        drawBorder: false,
        borderDash: [4, 4],
        color(context: any) {
          const value = context?.tick?.value
          if (isDark.value) {
            return value === 0 ? '#71717A' : 'rgba(63, 63, 70, 0.5)'
          }
          return value === 0 ? '#94A3B8' : '#E2E8F0'
        },
      },
    },
  },
}))
</script>

<template>
  <section
    class="rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 shadow-sm h-full flex flex-col">
    <header class="mb-4">
      <p class="text-xs font-semibold uppercase tracking-[0.2em] text-blue-500">{{ title }}</p>
      <p v-if="periodLabel" class="text-sm text-slate-500 dark:text-zinc-400">{{ periodLabel }}</p>
    </header>

    <div v-if="loading" class="h-72 w-full animate-pulse rounded-xl bg-slate-50 dark:bg-zinc-800" />

    <div v-else class="flex-1 flex flex-col">
      <div v-if="!hasValues"
        class="rounded-xl border border-dashed border-slate-200 dark:border-zinc-700 bg-slate-50/60 dark:bg-zinc-800/60 p-8 text-center text-sm text-slate-500 dark:text-zinc-400 flex-1 flex items-center justify-center">
        {{ emptyLabel }}
      </div>

      <ClientOnly v-else>
        <div class="flex-1 w-full min-h-[300px]">
          <Line :data="chartData" :options="chartOptions" />
        </div>
        <template #fallback>
          <div class="h-72 w-full animate-pulse rounded-xl bg-slate-50 dark:bg-zinc-800" />
        </template>
      </ClientOnly>
    </div>
  </section>
</template>
