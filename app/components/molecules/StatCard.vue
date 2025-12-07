<script setup lang="ts">
const props = withDefaults(defineProps<{
  label: string
  amount: number
  variant?: 'income' | 'expense' | 'balance'
  description?: string
  chipLabel?: string
}>(), {
  variant: 'balance',
  description: '',
})

const easing = (t: number) => 1 - Math.pow(1 - t, 3)
const animationId = ref<number | null>(null)
const animatedValue = ref(0)

const { formatCurrency } = useFormatters()

const stopAnimation = () => {
  if (animationId.value !== null && process.client) {
    cancelAnimationFrame(animationId.value)
    animationId.value = null
  }
}

const animateTo = (target: number) => {
  if (!process.client) {
    animatedValue.value = target
    return
  }

  stopAnimation()

  const startValue = animatedValue.value
  const startTime = performance.now()
  const duration = 400

  const step = (timestamp: number) => {
    const elapsed = timestamp - startTime
    const progress = Math.min(elapsed / duration, 1)
    animatedValue.value = startValue + (target - startValue) * easing(progress)

    if (progress < 1) {
      animationId.value = requestAnimationFrame(step)
    } else {
      animationId.value = null
    }
  }

  animationId.value = requestAnimationFrame(step)
}

watch(
  () => props.amount,
  (value) => {
    animateTo(value)
  },
  { immediate: true }
)

onBeforeUnmount(() => {
  stopAnimation()
})

const variantMap = {
  income: {
    text: 'text-emerald-600',
    muted: 'text-emerald-500',
    iconWrap: 'bg-emerald-100 text-emerald-600',
    badge: 'bg-emerald-50 text-emerald-700',
    prefix: '+',
  },
  expense: {
    text: 'text-rose-600',
    muted: 'text-rose-500',
    iconWrap: 'bg-rose-100 text-rose-600',
    badge: 'bg-rose-50 text-rose-700',
    prefix: '-',
  },
  balance: {
    text: 'text-blue-600',
    muted: 'text-blue-500',
    iconWrap: 'bg-blue-100 text-blue-600',
    badge: 'bg-blue-50 text-blue-700',
    prefix: '',
  },
} as const

const currentVariant = computed(() => variantMap[props.variant ?? 'balance'])

const formattedValue = computed(() => {
  const value = props.variant === 'expense' ? Math.abs(animatedValue.value) : Math.abs(animatedValue.value)
  return formatCurrency(value)
})

const resolvedPrefix = computed(() => {
  if (props.variant === 'balance') {
    if (animatedValue.value < 0) return '-'
    if (animatedValue.value > 0) return '+'
    return ''
  }
  return currentVariant.value.prefix
})
</script>

<template>
  <article class="relative overflow-hidden rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
    <div class="flex items-start justify-between gap-4">
      <div>
        <p class="text-sm font-medium text-gray-500">{{ label }}</p>
        <p class="text-3xl font-semibold" :class="currentVariant.text">
          <span class="mr-1">{{ resolvedPrefix }}</span>{{ formattedValue }}
        </p>
      </div>
      <span class="inline-flex h-12 w-12 items-center justify-center rounded-xl" :class="currentVariant.iconWrap">
        <slot name="icon">
          <svg class="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"
            stroke-linecap="round">
            <path v-if="props.variant === 'income'" d="M6 15l6-6 6 6" />
            <path v-else-if="props.variant === 'expense'" d="M6 9l6 6 6-6" />
            <path v-else d="M5 12h14M12 5v14" />
          </svg>
        </slot>
      </span>
    </div>

    <div class="mt-4 flex flex-wrap items-center gap-3 text-sm text-gray-500">
      <span v-if="chipLabel" class="inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium"
        :class="currentVariant.badge">
        <span class="h-1.5 w-1.5 rounded-full bg-current" />
        {{ chipLabel }}
      </span>
      <p v-if="description" class="text-gray-500">{{ description }}</p>
      <slot name="meta" />
    </div>
  </article>
</template>
