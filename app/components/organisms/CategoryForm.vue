<script setup lang="ts">
import type { Category } from '~/types/category'

interface Props {
  isOpen: boolean
  category?: Category | null
}

interface Emits {
  (e: 'update:isOpen', value: boolean): void
  (e: 'submit', data: { name: string; type: 'income' | 'expense'; color: string; icon?: string }): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const name = ref('')
const type = ref<'income' | 'expense'>('expense')
const color = ref('#3B82F6')
const icon = ref('')
const errors = ref<Record<string, string>>({})

watch(() => props.isOpen, (isOpen) => {
  if (isOpen) {
    if (props.category) {
      // Edit mode
      name.value = props.category.name
      // Only allow income or expense, not both
      type.value = props.category.type === 'both' ? 'expense' : props.category.type
      color.value = props.category.color
      icon.value = props.category.icon || ''
    } else {
      // Create mode
      resetForm()
    }
  }
})

const resetForm = () => {
  name.value = ''
  type.value = 'expense'
  color.value = '#3B82F6'
  icon.value = ''
  errors.value = {}
}

const validate = () => {
  errors.value = {}

  if (!name.value.trim()) {
    errors.value.name = 'Tên danh mục là bắt buộc'
  } else if (name.value.length > 50) {
    errors.value.name = 'Tên danh mục không được quá 50 ký tự'
  }

  if (!color.value.match(/^#[0-9A-F]{6}$/i)) {
    errors.value.color = 'Mã màu không hợp lệ'
  }

  return Object.keys(errors.value).length === 0
}

const handleSubmit = () => {
  if (!validate()) return

  emit('submit', {
    name: name.value.trim(),
    type: type.value,
    color: color.value,
    icon: icon.value || undefined,
  })

  close()
}

const close = () => {
  emit('update:isOpen', false)
  resetForm()
}
</script>

<template>
  <Teleport to="body">
    <Transition enter-active-class="transition ease-out duration-200" enter-from-class="opacity-0"
      enter-to-class="opacity-100" leave-active-class="transition ease-in duration-150" leave-from-class="opacity-100"
      leave-to-class="opacity-0">
      <div v-if="isOpen" class="fixed inset-0 z-50 flex items-center justify-center px-4 py-6 bg-black bg-opacity-50"
        @click.self="close">
        <Transition enter-active-class="transition ease-out duration-200" enter-from-class="opacity-0 scale-95"
          enter-to-class="opacity-100 scale-100" leave-active-class="transition ease-in duration-150"
          leave-from-class="opacity-100 scale-100" leave-to-class="opacity-0 scale-95">
          <div v-if="isOpen"
            class="relative bg-white dark:bg-zinc-900 rounded-xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <!-- Header -->
            <div
              class="sticky top-0 bg-white dark:bg-zinc-900 border-b border-slate-200 dark:border-zinc-800 px-6 py-4 flex items-center justify-between">
              <h3 class="text-xl font-semibold text-slate-900 dark:text-white">
                {{ category ? 'Chỉnh sửa danh mục' : 'Tạo danh mục mới' }}
              </h3>
              <button @click="close"
                class="text-slate-400 dark:text-zinc-500 hover:text-slate-600 dark:hover:text-zinc-300 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24"
                  stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <!-- Form -->
            <form @submit.prevent="handleSubmit" class="p-6 space-y-6">
              <!-- Name -->
              <div>
                <label class="block text-sm font-medium text-slate-700 dark:text-zinc-300 mb-2">
                  Tên danh mục <span class="text-red-500">*</span>
                </label>
                <input v-model="name" type="text"
                  class="w-full px-3 py-2 border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-slate-900 dark:text-white rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  :class="{ 'border-red-500 dark:border-red-700': errors.name }" placeholder="VD: Đi chợ, Lương..."
                  maxlength="50" />
                <p v-if="errors.name" class="mt-1 text-sm text-red-600 dark:text-red-400">{{ errors.name }}</p>
              </div>

              <!-- Type -->
              <div>
                <label class="block text-sm font-medium text-slate-700 dark:text-zinc-300 mb-2">
                  Loại <span class="text-red-500">*</span>
                </label>
                <div class="flex gap-3">
                  <button type="button" @click="type = 'income'" :class="[
                    'flex-1 px-4 py-3 rounded-lg border-2 font-medium transition-colors',
                    type === 'income'
                      ? 'border-green-500 bg-green-50 dark:bg-green-950/50 text-green-700 dark:text-green-400'
                      : 'border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 hover:bg-slate-50 dark:hover:bg-zinc-700'
                  ]">
                    Thu nhập
                  </button>
                  <button type="button" @click="type = 'expense'" :class="[
                    'flex-1 px-4 py-3 rounded-lg border-2 font-medium transition-colors',
                    type === 'expense'
                      ? 'border-red-500 bg-red-50 dark:bg-red-950/50 text-red-700 dark:text-red-400'
                      : 'border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 hover:bg-slate-50 dark:hover:bg-zinc-700'
                  ]">
                    Chi tiêu
                  </button>
                </div>
              </div>

              <!-- Color -->
              <div>
                <label class="block text-sm font-medium text-slate-700 dark:text-zinc-300 mb-2">
                  Màu sắc <span class="text-red-500">*</span>
                </label>
                <ColorPicker v-model="color" />
                <p v-if="errors.color" class="mt-1 text-sm text-red-600 dark:text-red-400">{{ errors.color }}</p>
              </div>

              <!-- Icon (optional) -->
              <div>
                <label class="block text-sm font-medium text-slate-700 dark:text-zinc-300 mb-2">
                  Icon (tùy chọn)
                </label>
                <input v-model="icon" type="text"
                  class="w-full px-3 py-2 border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-slate-900 dark:text-white rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="VD: 🛒, 💰, 🏠" />
              </div>

              <!-- Actions -->
              <div class="flex gap-3 pt-4">
                <button type="button" @click="close"
                  class="flex-1 px-4 py-2 border border-slate-300 dark:border-zinc-700 text-slate-700 dark:text-zinc-300 rounded-lg hover:bg-slate-50 dark:hover:bg-zinc-800 transition-colors">
                  Hủy
                </button>
                <button type="submit"
                  class="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
                  {{ category ? 'Cập nhật' : 'Tạo mới' }}
                </button>
              </div>
            </form>
          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>
