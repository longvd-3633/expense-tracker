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
  animation: { duration: 300 },
  interaction: { intersect: false, mode: 'index' as const },
  plugins: {
    legend: {
      display: true,
      labels: {
        usePointStyle: true,
        pointStyle: 'circle',
        padding: 20,
      },
      position: 'bottom' as const,
    },
    tooltip: {
      callbacks: {
        label(context: any) {
          const datasetLabel = context.dataset?.label ?? ''
          const value = typeof context.parsed?.y === 'number' ? context.parsed.y : context.parsed
          return `${datasetLabel}: ${formatCurrency(value || 0)}`
        },
      },
    },
  },
  scales: {
    x: {
      grid: { display: false },
      ticks: { maxRotation: 0, autoSkip: true },
    },
    y: {
      beginAtZero: true,
      ticks: {
        callback(value: string | number) {
          const numericValue = typeof value === 'string' ? Number(value) : value
          return formatCurrency(numericValue)
        },
      },
      grid: { color: '#F1F5F9' },
    },
  },
}))
</script>

<template>
  <section class="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
    <header class="mb-4">
      <p class="text-xs font-semibold uppercase tracking-[0.2em] text-blue-500">{{ title }}</p>
      <p v-if="periodLabel" class="text-sm text-gray-500">{{ periodLabel }}</p>
    </header>

    <div v-if="loading" class="h-72 w-full animate-pulse rounded-xl bg-slate-50" />

    <div v-else>
      <div v-if="!hasValues"
        class="rounded-xl border border-dashed border-gray-200 bg-slate-50/60 p-8 text-center text-sm text-gray-500">
        {{ emptyLabel }}
      </div>

      <ClientOnly v-else>
        <div class="h-72 w-full">
          <Line :data="chartData" :options="chartOptions" />
        </div>
        <template #fallback>
          <div class="h-72 w-full animate-pulse rounded-xl bg-slate-50" />
        </template>
      </ClientOnly>
    </div>
  </section>
</template>
