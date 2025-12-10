<template>
  <div class="space-y-8">
    <!-- Header -->
    <div>
      <h1 class="text-2xl font-bold text-slate-900 dark:text-white">Cài đặt</h1>
      <p class="mt-1 text-sm text-slate-500 dark:text-zinc-400">Tùy chỉnh trải nghiệm của bạn</p>
    </div>

    <!-- Settings Grid -->
    <div class="grid gap-6 lg:grid-cols-2">
      <!-- Currency Card -->
      <div class="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <div class="mb-4 flex items-center gap-3">
          <div
            class="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400">
            <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round"
                d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <h3 class="font-semibold text-slate-900 dark:text-white">Tiền tệ</h3>
            <p class="text-sm text-slate-500 dark:text-zinc-400">Đơn vị tiền tệ hiển thị</p>
          </div>
        </div>
        <div class="flex flex-wrap gap-2">
          <button v-for="currency in currencies" :key="currency.value"
            @click="updateSettings({ currency: currency.value })" :class="[
              'rounded-xl px-4 py-2.5 text-sm font-medium transition-all',
              settings.currency === currency.value
                ? 'bg-emerald-100 text-emerald-700 ring-2 ring-emerald-500 ring-offset-2 dark:bg-emerald-950 dark:text-emerald-400 dark:ring-offset-zinc-900'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-700'
            ]">
            {{ currency.label }}
          </button>
        </div>
      </div>

      <!-- Date Format Card -->
      <div class="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <div class="mb-4 flex items-center gap-3">
          <div
            class="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 text-blue-600 dark:bg-blue-950 dark:text-blue-400">
            <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round"
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <div>
            <h3 class="font-semibold text-slate-900 dark:text-white">Định dạng ngày</h3>
            <p class="text-sm text-slate-500 dark:text-zinc-400">Cách hiển thị ngày tháng</p>
          </div>
        </div>
        <div class="flex flex-wrap gap-2">
          <button v-for="format in dateFormats" :key="format.value"
            @click="updateSettings({ dateFormat: format.value })" :class="[
              'rounded-xl px-4 py-2.5 text-sm font-medium transition-all',
              settings.dateFormat === format.value
                ? 'bg-blue-100 text-blue-700 ring-2 ring-blue-500 ring-offset-2 dark:bg-blue-950 dark:text-blue-400 dark:ring-offset-zinc-900'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-700'
            ]">
            {{ format.label }}
          </button>
        </div>
      </div>

      <!-- Number Format Card -->
      <div class="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <div class="mb-4 flex items-center gap-3">
          <div
            class="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-100 text-violet-600 dark:bg-violet-950 dark:text-violet-400">
            <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
            </svg>
          </div>
          <div>
            <h3 class="font-semibold text-slate-900 dark:text-white">Định dạng số</h3>
            <p class="text-sm text-slate-500 dark:text-zinc-400">Cách hiển thị số tiền</p>
          </div>
        </div>
        <div class="flex flex-wrap gap-2">
          <button v-for="format in numberFormats" :key="format.value"
            @click="updateSettings({ numberFormat: format.value })" :class="[
              'rounded-xl px-4 py-2.5 text-sm font-medium transition-all',
              settings.numberFormat === format.value
                ? 'bg-violet-100 text-violet-700 ring-2 ring-violet-500 ring-offset-2 dark:bg-violet-950 dark:text-violet-400 dark:ring-offset-zinc-900'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-700'
            ]">
            {{ format.label }}
          </button>
        </div>
      </div>

      <!-- Default View Card -->
      <div class="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <div class="mb-4 flex items-center gap-3">
          <div
            class="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100 text-amber-600 dark:bg-amber-950 dark:text-amber-400">
            <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round"
                d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
          </div>
          <div>
            <h3 class="font-semibold text-slate-900 dark:text-white">Trang mặc định</h3>
            <p class="text-sm text-slate-500 dark:text-zinc-400">Trang hiển thị khi mở app</p>
          </div>
        </div>
        <div class="flex flex-wrap gap-2">
          <button v-for="view in defaultViews" :key="view.value" @click="updateSettings({ defaultView: view.value })"
            :class="[
              'rounded-xl px-4 py-2.5 text-sm font-medium transition-all',
              settings.defaultView === view.value
                ? 'bg-amber-100 text-amber-700 ring-2 ring-amber-500 ring-offset-2 dark:bg-amber-950 dark:text-amber-400 dark:ring-offset-zinc-900'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-700'
            ]">
            {{ view.label }}
          </button>
        </div>
      </div>

      <!-- Theme Card -->
      <div
        class="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 lg:col-span-2">
        <div class="mb-4 flex items-center gap-3">
          <div
            class="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-600 dark:bg-zinc-800 dark:text-zinc-400">
            <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round"
                d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
            </svg>
          </div>
          <div>
            <h3 class="font-semibold text-slate-900 dark:text-white">Giao diện</h3>
            <p class="text-sm text-slate-500 dark:text-zinc-400">Chọn chế độ hiển thị</p>
          </div>
        </div>
        <div class="grid gap-3 sm:grid-cols-3">
          <button v-for="theme in themes" :key="theme.value" @click="updateSettings({ theme: theme.value })" :class="[
            'flex items-center gap-3 rounded-xl px-4 py-3 text-left transition-all',
            settings.theme === theme.value
              ? 'bg-slate-900 text-white ring-2 ring-slate-900 ring-offset-2 dark:bg-white dark:text-slate-900 dark:ring-white dark:ring-offset-zinc-900'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-700'
          ]">
            <component :is="theme.icon" class="h-5 w-5" />
            <span class="font-medium">{{ theme.label }}</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Danger Zone -->
    <div class="rounded-2xl border border-red-200 bg-red-50 p-6 dark:border-red-900 dark:bg-red-950">
      <div class="flex items-center justify-between">
        <div>
          <h3 class="font-semibold text-red-900 dark:text-red-400">Khôi phục cài đặt</h3>
          <p class="mt-1 text-sm text-red-700 dark:text-red-500">Đặt lại tất cả cài đặt về giá trị mặc định</p>
        </div>
        <button @click="handleReset" :disabled="isSaving"
          class="rounded-xl bg-red-600 px-4 py-2.5 text-sm font-medium text-white transition-all hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50">
          Reset
        </button>
      </div>
    </div>

    <!-- Success Toast -->
    <Teleport to="body">
      <Transition enter-active-class="transition ease-out duration-300" enter-from-class="translate-y-4 opacity-0"
        enter-to-class="translate-y-0 opacity-100" leave-active-class="transition ease-in duration-200"
        leave-from-class="translate-y-0 opacity-100" leave-to-class="translate-y-4 opacity-0">
        <div v-if="saveSuccess"
          class="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-3 text-white shadow-lg dark:bg-white dark:text-slate-900">
          <svg class="h-5 w-5 text-emerald-400 dark:text-emerald-600" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
              clip-rule="evenodd" />
          </svg>
          <span class="font-medium">Đã lưu cài đặt</span>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { h } from 'vue'
import { storeToRefs } from 'pinia'
import type { Settings } from '~/stores/settings'

const settingsStore = useSettingsStore()
const user = useSupabaseUser()

const { settings, loading } = storeToRefs(settingsStore)
const isSaving = ref(false)
const saveSuccess = ref(false)

// Options
const currencies = [
  { value: 'VND', label: 'VND (₫)' },
  { value: 'USD', label: 'USD ($)' },
]

const dateFormats = [
  { value: 'DD/MM/YYYY', label: 'DD/MM/YYYY' },
  { value: 'YYYY-MM-DD', label: 'YYYY-MM-DD' },
]

const numberFormats = [
  { value: '1.000.000', label: '1.000.000' },
  { value: '1,000,000', label: '1,000,000' },
]

const defaultViews = [
  { value: 'dashboard', label: 'Dashboard' },
  { value: 'transactions', label: 'Giao dịch' },
]

// Theme icons as render functions
const SunIcon = {
  render: () => h('svg', { fill: 'none', viewBox: '0 0 24 24', stroke: 'currentColor', 'stroke-width': '2' }, [
    h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', d: 'M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z' })
  ])
}

const MoonIcon = {
  render: () => h('svg', { fill: 'none', viewBox: '0 0 24 24', stroke: 'currentColor', 'stroke-width': '2' }, [
    h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', d: 'M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z' })
  ])
}

const MonitorIcon = {
  render: () => h('svg', { fill: 'none', viewBox: '0 0 24 24', stroke: 'currentColor', 'stroke-width': '2' }, [
    h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', d: 'M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z' })
  ])
}

const themes = [
  { value: 'light', label: 'Sáng', icon: SunIcon },
  { value: 'dark', label: 'Tối', icon: MoonIcon },
  { value: 'system', label: 'Hệ thống', icon: MonitorIcon },
]

// Fetch settings on mount and when user changes
onMounted(async () => {
  if (user.value) {
    await settingsStore.fetchSettings()
  }
})

watch(user, async (newUser) => {
  if (newUser) {
    await settingsStore.fetchSettings()
  }
}, { immediate: false })

const updateSettings = async (updates: Partial<Settings>) => {
  console.log('[Settings Page] updateSettings called with:', updates)
  try {
    isSaving.value = true
    await settingsStore.updateSettings(updates)
    console.log('[Settings Page] updateSettings completed')

    saveSuccess.value = true
    setTimeout(() => {
      saveSuccess.value = false
    }, 2000)
  } catch (error) {
    console.error('Failed to update settings:', error)
  } finally {
    isSaving.value = false
  }
}

const handleReset = async () => {
  if (confirm('Bạn có chắc muốn khôi phục tất cả cài đặt về mặc định?')) {
    try {
      isSaving.value = true
      await settingsStore.resetSettings()

      saveSuccess.value = true
      setTimeout(() => {
        saveSuccess.value = false
      }, 2000)
    } catch (error) {
      console.error('Failed to reset settings:', error)
    } finally {
      isSaving.value = false
    }
  }
}
</script>
