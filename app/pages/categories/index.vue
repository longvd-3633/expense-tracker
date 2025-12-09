<script setup lang="ts">
import type { Category } from '~/types/category'

const categoriesStore = useCategoriesStore()
const user = useSupabaseUser()

const isFormOpen = ref(false)
const editingCategory = ref<Category | null>(null)
const deleteTarget = ref<Category | null>(null)
const isDeleting = ref(false)

const defaultCategories = computed(() =>
  categoriesStore.categories.filter(c => c.isDefault)
)

const customCategories = computed(() =>
  categoriesStore.categories.filter(c => !c.isDefault)
)

onMounted(async () => {
  if (user.value) {
    await categoriesStore.fetchCategories()
  }
})

const handleAdd = () => {
  editingCategory.value = null
  isFormOpen.value = true
}

const handleEdit = (category: Category) => {
  editingCategory.value = category
  isFormOpen.value = true
}

const handleSubmit = async (data: { name: string; type: 'income' | 'expense'; color: string; icon?: string }) => {
  try {
    if (editingCategory.value) {
      await categoriesStore.updateCategory(editingCategory.value.id, data)
    } else {
      await categoriesStore.createCategory(data.name, data.type, data.color, data.icon)
    }
  } catch (error) {
    console.error('Error saving category:', error)
    alert(error instanceof Error ? error.message : 'Có lỗi xảy ra')
  }
}

const requestDelete = (category: Category) => {
  deleteTarget.value = category
}

const confirmDelete = async () => {
  if (!deleteTarget.value) return

  try {
    isDeleting.value = true
    await categoriesStore.deleteCategory(deleteTarget.value.id)
    deleteTarget.value = null
  } catch (error) {
    console.error('Error deleting category:', error)
    alert(error instanceof Error ? error.message : 'Có lỗi xảy ra')
  } finally {
    isDeleting.value = false
  }
}

const cancelDelete = () => {
  deleteTarget.value = null
}
</script>

<template>
  <div>
    <!-- Header -->
    <div class="flex items-center justify-between mb-8">
      <div>
        <h1 class="text-3xl font-bold text-gray-900 mb-2">Danh mục</h1>
        <p class="text-gray-600">Quản lý danh mục thu chi của bạn</p>
      </div>

      <Button variant="primary" size="lg" @click="handleAdd">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24"
          stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
        </svg>
        Thêm danh mục
      </Button>
    </div>

    <!-- Default Categories -->
    <div class="mb-8">
      <h2 class="text-xl font-semibold text-gray-900 mb-4">Danh mục mặc định</h2>
      <div class="bg-white rounded-lg shadow divide-y divide-gray-200">
        <div v-for="category in defaultCategories" :key="category.id" class="p-4 flex items-center justify-between">
          <div class="flex items-center gap-4">
            <div class="w-10 h-10 rounded-lg flex items-center justify-center text-xl"
              :style="{ backgroundColor: category.color }">
              {{ category.icon || '📁' }}
            </div>
            <div>
              <h3 class="font-medium text-gray-900">{{ category.name }}</h3>
              <p class="text-sm text-gray-500">
                {{ category.type === 'income' ? 'Thu nhập' : 'Chi tiêu' }}
              </p>
            </div>
          </div>
          <div class="flex items-center gap-2">
            <span class="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-sm">
              Mặc định
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- Custom Categories -->
    <div>
      <h2 class="text-xl font-semibold text-gray-900 mb-4">Danh mục tùy chỉnh</h2>

      <div v-if="customCategories.length === 0" class="bg-white rounded-lg shadow p-8 text-center">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-16 w-16 mx-auto text-gray-400 mb-4" fill="none"
          viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
            d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
        <p class="text-gray-600 mb-4">Chưa có danh mục tùy chỉnh nào</p>
        <Button variant="primary" @click="handleAdd">
          Tạo danh mục đầu tiên
        </Button>
      </div>

      <div v-else class="bg-white rounded-lg shadow divide-y divide-gray-200">
        <div v-for="category in customCategories" :key="category.id"
          class="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
          <div class="flex items-center gap-4">
            <div class="w-10 h-10 rounded-lg flex items-center justify-center text-xl"
              :style="{ backgroundColor: category.color }">
              {{ category.icon || '📁' }}
            </div>
            <div>
              <h3 class="font-medium text-gray-900">{{ category.name }}</h3>
              <p class="text-sm text-gray-500">
                {{ category.type === 'income' ? 'Thu nhập' : 'Chi tiêu' }}
              </p>
            </div>
          </div>
          <div class="flex items-center gap-2">
            <button @click="handleEdit(category)"
              class="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors" title="Chỉnh sửa">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24"
                stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </button>
            <button @click="requestDelete(category)"
              class="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Xóa">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24"
                stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Category Form Modal -->
    <CategoryForm v-model:is-open="isFormOpen" :category="editingCategory" @submit="handleSubmit" />

    <!-- Delete Confirmation Modal -->
    <Teleport to="body">
      <Transition enter-active-class="transition ease-out duration-200" enter-from-class="opacity-0"
        enter-to-class="opacity-100" leave-active-class="transition ease-in duration-150" leave-from-class="opacity-100"
        leave-to-class="opacity-0">
        <div v-if="deleteTarget"
          class="fixed inset-0 z-50 flex items-center justify-center px-4 py-6 bg-black bg-opacity-50"
          @click.self="cancelDelete">
          <div class="relative bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
            <div class="flex items-start justify-between mb-4">
              <div>
                <h3 class="text-xl font-semibold text-gray-900">Xóa danh mục?</h3>
                <p class="text-sm text-gray-500 mt-1">Bạn không thể hoàn tác hành động này.</p>
              </div>
              <button @click="cancelDelete" class="text-gray-400 hover:text-gray-600">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24"
                  stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div class="mb-6 p-4 bg-gray-50 rounded-lg">
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-lg flex items-center justify-center text-xl"
                  :style="{ backgroundColor: deleteTarget.color }">
                  {{ deleteTarget.icon || '📁' }}
                </div>
                <div>
                  <p class="font-medium text-gray-900">{{ deleteTarget.name }}</p>
                  <p class="text-sm text-gray-500">
                    {{ deleteTarget.type === 'income' ? 'Thu nhập' : 'Chi tiêu' }}
                  </p>
                </div>
              </div>
            </div>

            <div class="flex gap-3">
              <button @click="cancelDelete" :disabled="isDeleting"
                class="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50">
                Hủy
              </button>
              <button @click="confirmDelete" :disabled="isDeleting"
                class="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50">
                {{ isDeleting ? 'Đang xóa...' : 'Xóa' }}
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>
