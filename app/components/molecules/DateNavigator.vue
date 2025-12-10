<script setup lang="ts">
const props = withDefaults(defineProps<{
  label: string
  canGoNext: boolean
  disableToday?: boolean
  isCurrentPeriod?: boolean
}>(), {
  disableToday: false,
  isCurrentPeriod: false,
})

const emit = defineEmits<{
  (e: 'previous'): void
  (e: 'next'): void
  (e: 'today'): void
}>()

const isInputElement = (target: EventTarget | null): boolean => {
  if (!target || !(target as HTMLElement).tagName) return false
  const el = target as HTMLElement
  const tag = el.tagName.toUpperCase()
  return ['INPUT', 'TEXTAREA', 'SELECT'].includes(tag) || el.isContentEditable
}

const handleKeydown = (event: KeyboardEvent) => {
  if (event.metaKey || event.ctrlKey || event.altKey) return
  if (isInputElement(event.target)) return

  if (event.key === 'ArrowLeft') {
    event.preventDefault()
    emit('previous')
  } else if (event.key === 'ArrowRight') {
    if (!props.canGoNext) return
    event.preventDefault()
    emit('next')
  } else if (event.key.toLowerCase() === 't') {
    if (props.disableToday) return
    event.preventDefault()
    emit('today')
  }
}

onMounted(() => {
  window.addEventListener('keydown', handleKeydown)
})

onBeforeUnmount(() => {
  window.removeEventListener('keydown', handleKeydown)
})
</script>

<template>
  <div class="flex flex-wrap items-center gap-3" aria-live="polite">
    <button type="button"
      class="rounded-2xl border border-slate-200 dark:border-zinc-600 p-3 text-slate-700 dark:text-zinc-300 transition hover:border-blue-300 dark:hover:border-blue-500 hover:text-blue-600 dark:hover:text-blue-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
      @click="emit('previous')">
      <span class="sr-only">Kỳ trước</span>
      <svg class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
        <path fill-rule="evenodd"
          d="M12.707 15.707a1 1 0 01-1.414 0l-5-5a1 1 0 010-1.414l5-5a1 1 0 111.414 1.414L8.414 10l4.293 4.293a1 1 0 010 1.414z"
          clip-rule="evenodd" />
      </svg>
    </button>

    <div class="min-w-[160px] text-center">
      <p class="text-xs uppercase tracking-wide text-slate-400 dark:text-zinc-500">Chu kỳ đang xem</p>
      <p class="text-base font-semibold text-slate-900 dark:text-white">{{ label }}</p>
      <span v-if="props.isCurrentPeriod"
        class="mt-1 inline-flex items-center gap-1 rounded-full bg-emerald-50 dark:bg-emerald-900/40 px-2 py-0.5 text-[11px] font-semibold text-emerald-700 dark:text-emerald-400">
        <span class="h-1.5 w-1.5 rounded-full bg-emerald-500" />
        Hiện tại
      </span>
      <slot name="meta" />
    </div>

    <button type="button"
      class="rounded-2xl border p-3 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
      :class="props.canGoNext
        ? 'border-slate-200 dark:border-zinc-600 text-slate-700 dark:text-zinc-300 hover:border-blue-300 dark:hover:border-blue-500 hover:text-blue-600 dark:hover:text-blue-400'
        : 'border-slate-100 dark:border-zinc-700 text-slate-300 dark:text-zinc-600 cursor-not-allowed'"
      :disabled="!props.canGoNext" @click="emit('next')">
      <span class="sr-only">Kỳ tiếp theo</span>
      <svg class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
        <path fill-rule="evenodd"
          d="M7.293 4.293a1 1 0 011.414 0l5 5a1 1 0 010 1.414l-5 5a1 1 0 01-1.414-1.414L11.586 10 7.293 5.707a1 1 0 010-1.414z"
          clip-rule="evenodd" />
      </svg>
    </button>

    <button type="button"
      class="rounded-2xl border px-4 py-2 text-sm font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
      :class="props.disableToday
        ? 'border-slate-100 dark:border-zinc-700 text-slate-300 dark:text-zinc-600 cursor-not-allowed'
        : 'border-slate-200 dark:border-zinc-600 text-slate-700 dark:text-zinc-300 hover:border-blue-300 dark:hover:border-blue-500 hover:text-blue-600 dark:hover:text-blue-400'"
      :disabled="props.disableToday" @click="emit('today')">
      Hôm nay · phím T
    </button>
  </div>
</template>
