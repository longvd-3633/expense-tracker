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
          <button
            @click="updateSettings({ currency: 'VND' })"
            :class="[
              'px-4 py-2 rounded-lg border-2 font-medium',
              settings.currency === 'VND'
                ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50'
            ]"
          >
            VND (₫)
          </button>
          <button
            @click="updateSettings({ currency: 'USD' })"
            :class="[
              'px-4 py-2 rounded-lg border-2 font-medium',
              settings.currency === 'USD'
                ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50'
            ]"
          >
            USD ($)
          </button>
        </div>
      </div>

      <!-- Date Format -->
      <div class="p-6">
        <h3 class="text-lg font-medium text-gray-900 mb-4">Định dạng ngày</h3>
        <div class="flex space-x-2">
          <button
            @click="updateSettings({ dateFormat: 'DD/MM/YYYY' })"
            :class="[
              'px-4 py-2 rounded-lg border-2 font-medium',
              settings.dateFormat === 'DD/MM/YYYY'
                ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50'
            ]"
          >
            DD/MM/YYYY
          </button>
          <button
            @click="updateSettings({ dateFormat: 'YYYY-MM-DD' })"
            :class="[
              'px-4 py-2 rounded-lg border-2 font-medium',
              settings.dateFormat === 'YYYY-MM-DD'
                ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50'
            ]"
          >
            YYYY-MM-DD
          </button>
        </div>
      </div>

      <!-- Number Format -->
      <div class="p-6">
        <h3 class="text-lg font-medium text-gray-900 mb-4">Định dạng số</h3>
        <div class="flex space-x-2">
          <button
            @click="updateSettings({ numberFormat: '1.000.000' })"
            :class="[
              'px-4 py-2 rounded-lg border-2 font-medium',
              settings.numberFormat === '1.000.000'
                ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50'
            ]"
          >
            1.000.000
          </button>
          <button
            @click="updateSettings({ numberFormat: '1,000,000' })"
            :class="[
              'px-4 py-2 rounded-lg border-2 font-medium',
              settings.numberFormat === '1,000,000'
                ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50'
            ]"
          >
            1,000,000
          </button>
        </div>
      </div>

      <!-- Default View -->
      <div class="p-6">
        <h3 class="text-lg font-medium text-gray-900 mb-4">Trang mặc định</h3>
        <div class="flex space-x-2">
          <button
            @click="updateSettings({ defaultView: 'dashboard' })"
            :class="[
              'px-4 py-2 rounded-lg border-2 font-medium',
              settings.defaultView === 'dashboard'
                ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50'
            ]"
          >
            Dashboard
          </button>
          <button
            @click="updateSettings({ defaultView: 'transactions' })"
            :class="[
              'px-4 py-2 rounded-lg border-2 font-medium',
              settings.defaultView === 'transactions'
                ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50'
            ]"
          >
            Transactions
          </button>
        </div>
      </div>

      <!-- Reset Settings -->
      <div class="p-6">
        <h3 class="text-lg font-medium text-gray-900 mb-4">Khôi phục cài đặt</h3>
        <button
          @click="handleReset"
          class="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
        >
          Reset về mặc định
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Settings } from '~/stores/settings';

const settingsStore = useSettingsStore();

const settings = computed(() => settingsStore.settings);

const updateSettings = (updates: Partial<Settings>) => {
  settingsStore.updateSettings(updates);
};

const handleReset = () => {
  if (confirm('Bạn có chắc muốn khôi phục tất cả cài đặt về mặc định?')) {
    settingsStore.resetSettings();
  }
};
</script>
