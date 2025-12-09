<template>
  <div>
    <div class="mb-6">
      <h1 class="text-3xl font-bold text-gray-900">Settings</h1>
      <p class="mt-2 text-sm text-gray-600">Tùy chỉnh cài đặt ứng dụng</p>
    </div>

    <div class="bg-white rounded-lg shadow divide-y divide-gray-200">
      <!-- Currency -->
      <div class="p-6">
        <h3 class="text-lg font-medium text-gray-900 mb-4">Tiền tệ</h3>
        <div class="flex space-x-2">
          <button @click="updateSettings({ currency: 'VND' })" :class="[
            'px-4 py-2 rounded-lg border-2 font-medium',
            settings.currency === 'VND'
              ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
              : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50'
          ]">
            VND (₫)
          </button>
          <button @click="updateSettings({ currency: 'USD' })" :class="[
            'px-4 py-2 rounded-lg border-2 font-medium',
            settings.currency === 'USD'
              ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
              : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50'
          ]">
            USD ($)
          </button>
        </div>
      </div>

      <!-- Date Format -->
      <div class="p-6">
        <h3 class="text-lg font-medium text-gray-900 mb-4">Định dạng ngày</h3>
        <div class="flex space-x-2">
          <button @click="updateSettings({ dateFormat: 'DD/MM/YYYY' })" :class="[
            'px-4 py-2 rounded-lg border-2 font-medium',
            settings.dateFormat === 'DD/MM/YYYY'
              ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
              : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50'
          ]">
            DD/MM/YYYY
          </button>
          <button @click="updateSettings({ dateFormat: 'YYYY-MM-DD' })" :class="[
            'px-4 py-2 rounded-lg border-2 font-medium',
            settings.dateFormat === 'YYYY-MM-DD'
              ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
              : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50'
          ]">
            YYYY-MM-DD
          </button>
        </div>
      </div>

      <!-- Number Format -->
      <div class="p-6">
        <h3 class="text-lg font-medium text-gray-900 mb-4">Định dạng số</h3>
        <div class="flex space-x-2">
          <button @click="updateSettings({ numberFormat: '1.000.000' })" :class="[
            'px-4 py-2 rounded-lg border-2 font-medium',
            settings.numberFormat === '1.000.000'
              ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
              : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50'
          ]">
            1.000.000
          </button>
          <button @click="updateSettings({ numberFormat: '1,000,000' })" :class="[
            'px-4 py-2 rounded-lg border-2 font-medium',
            settings.numberFormat === '1,000,000'
              ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
              : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50'
          ]">
            1,000,000
          </button>
        </div>
      </div>

      <!-- Default View -->
      <div class="p-6">
        <h3 class="text-lg font-medium text-gray-900 mb-4">Trang mặc định</h3>
        <div class="flex space-x-2">
          <button @click="updateSettings({ defaultView: 'dashboard' })" :class="[
            'px-4 py-2 rounded-lg border-2 font-medium',
            settings.defaultView === 'dashboard'
              ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
              : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50'
          ]">
            Dashboard
          </button>
          <button @click="updateSettings({ defaultView: 'transactions' })" :class="[
            'px-4 py-2 rounded-lg border-2 font-medium',
            settings.defaultView === 'transactions'
              ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
              : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50'
          ]">
            Transactions
          </button>
        </div>
      </div>

      <!-- Theme -->
      <div class="p-6">
        <h3 class="text-lg font-medium text-gray-900 mb-4">Giao diện</h3>
        <div class="flex space-x-2">
          <button @click="updateSettings({ theme: 'light' })" :class="[
            'px-4 py-2 rounded-lg border-2 font-medium flex items-center gap-2',
            settings.theme === 'light'
              ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
              : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50'
          ]">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24"
              stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
            Sáng
          </button>
          <button @click="updateSettings({ theme: 'dark' })" :class="[
            'px-4 py-2 rounded-lg border-2 font-medium flex items-center gap-2',
            settings.theme === 'dark'
              ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
              : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50'
          ]">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24"
              stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
            </svg>
            Tối
          </button>
          <button @click="updateSettings({ theme: 'system' })" :class="[
            'px-4 py-2 rounded-lg border-2 font-medium flex items-center gap-2',
            settings.theme === 'system'
              ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
              : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50'
          ]">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24"
              stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            Hệ thống
          </button>
        </div>
      </div>

      <!-- Reset Settings -->
      <div class="p-6">
        <h3 class="text-lg font-medium text-gray-900 mb-4">Khôi phục cài đặt</h3>
        <button @click="handleReset" :disabled="isSaving"
          class="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed">
          Reset về mặc định
        </button>
      </div>
    </div>

    <!-- Success Message -->
    <Transition enter-active-class="transition ease-out duration-300"
      enter-from-class="transform translate-y-2 opacity-0" enter-to-class="transform translate-y-0 opacity-100"
      leave-active-class="transition ease-in duration-200" leave-from-class="transform translate-y-0 opacity-100"
      leave-to-class="transform translate-y-2 opacity-0">
      <div v-if="saveSuccess"
        class="fixed bottom-4 right-4 bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-2">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd"
            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
            clip-rule="evenodd" />
        </svg>
        <span>Đã lưu cài đặt</span>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import type { Settings } from '~/stores/settings'

const settingsStore = useSettingsStore()
const user = useSupabaseUser()

const settings = computed(() => settingsStore.settings)
const loading = computed(() => settingsStore.loading)
const isSaving = ref(false)
const saveSuccess = ref(false)

onMounted(async () => {
  if (user.value) {
    await settingsStore.fetchSettings()
  }
})

const updateSettings = async (updates: Partial<Settings>) => {
  try {
    isSaving.value = true
    await settingsStore.updateSettings(updates)

    // Show success message
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
