<template>
  <div>
    <div class="mb-6 flex items-center justify-between">
      <div>
        <h1 class="text-3xl font-bold text-gray-900">Transactions</h1>
        <p class="mt-2 text-sm text-gray-600">Quản lý tất cả giao dịch của bạn</p>
      </div>
      <div class="flex space-x-3">
        <button
          @click="handleExport"
          class="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 text-sm font-medium"
        >
          Export CSV
        </button>
        <button
          @click="showAddForm = true"
          class="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm font-medium"
        >
          + Thêm giao dịch
        </button>
      </div>
    </div>

    <!-- Transaction Form Modal -->
    <div
      v-if="showAddForm"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      @click.self="showAddForm = false"
    >
      <div class="bg-white rounded-lg max-w-md w-full p-6">
        <h2 class="text-xl font-bold mb-4">Thêm giao dịch mới</h2>
        <form @submit.prevent="handleSubmit">
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Loại</label>
              <div class="flex space-x-2">
                <button
                  type="button"
                  @click="form.type = 'expense'"
                  :class="[
                    'flex-1 py-2 px-4 rounded-lg border-2 font-medium',
                    form.type === 'expense'
                      ? 'border-red-500 bg-red-50 text-red-700'
                      : 'border-gray-200 bg-white text-gray-700'
                  ]"
                >
                  Chi tiêu
                </button>
                <button
                  type="button"
                  @click="form.type = 'income'"
                  :class="[
                    'flex-1 py-2 px-4 rounded-lg border-2 font-medium',
                    form.type === 'income'
                      ? 'border-green-500 bg-green-50 text-green-700'
                      : 'border-gray-200 bg-white text-gray-700'
                  ]"
                >
                  Thu nhập
                </button>
              </div>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Số tiền *</label>
              <input
                v-model.number="form.amount"
                type="number"
                required
                min="0"
                step="1000"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="0"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Danh mục *</label>
              <select
                v-model="form.category"
                required
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                <option value="">Chọn danh mục</option>
                <option
                  v-for="cat in availableCategories"
                  :key="cat.id"
                  :value="cat.id"
                >
                  {{ cat.name }}
                </option>
              </select>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Ngày *</label>
              <input
                v-model="form.date"
                type="date"
                required
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Mô tả</label>
              <textarea
                v-model="form.description"
                rows="3"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="Nhập mô tả..."
              ></textarea>
            </div>
          </div>

          <div class="mt-6 flex space-x-3">
            <button
              type="button"
              @click="showAddForm = false"
              class="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Hủy
            </button>
            <button
              type="submit"
              class="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
            >
              Thêm
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Empty State -->
    <div v-if="sortedTransactions.length === 0" class="bg-white rounded-lg shadow p-12 text-center">
      <div class="text-gray-400 text-5xl mb-4">💸</div>
      <h3 class="text-lg font-medium text-gray-900 mb-2">Chưa có giao dịch nào</h3>
      <p class="text-gray-600">Bắt đầu theo dõi thu chi của bạn ngay hôm nay</p>
    </div>

    <!-- Transactions List -->
    <div v-else class="bg-white rounded-lg shadow divide-y divide-gray-200">
      <div
        v-for="transaction in sortedTransactions"
        :key="transaction.id"
        class="p-6 hover:bg-gray-50 flex items-center justify-between"
      >
        <div class="flex items-center space-x-4 flex-1">
          <div
            :class="[
              'w-12 h-12 rounded-full flex items-center justify-center text-xl',
              transaction.type === 'income' ? 'bg-green-100' : 'bg-red-100'
            ]"
          >
            {{ getCategoryById(transaction.category)?.icon || '💵' }}
          </div>
          <div class="flex-1">
            <p class="font-medium text-gray-900">{{ transaction.description || 'Không có mô tả' }}</p>
            <p class="text-sm text-gray-500">
              {{ getCategoryById(transaction.category)?.name }} • {{ formatDate(transaction.date) }}
            </p>
          </div>
        </div>
        <div class="flex items-center space-x-4">
          <div
            :class="[
              'text-lg font-semibold',
              transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
            ]"
          >
            {{ transaction.type === 'income' ? '+' : '-' }}{{ formatCurrency(transaction.amount) }}
          </div>
          <button
            @click="handleDelete(transaction.id)"
            class="p-2 text-red-600 hover:bg-red-50 rounded-lg"
          >
            🗑️
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { TransactionInput } from '~/types/transaction';

const transactionsStore = useTransactionsStore();
const categoriesStore = useCategoriesStore();
const { formatCurrency, formatDate } = useFormatters();
const { exportTransactions } = useCSVExport();

const showAddForm = ref(false);
const form = reactive<TransactionInput>({
  type: 'expense',
  amount: 0,
  category: '',
  date: new Date(),
  description: '',
});

const sortedTransactions = computed(() => transactionsStore.sortedTransactions);

const availableCategories = computed(() => {
  return form.type === 'income'
    ? categoriesStore.incomeCategories
    : categoriesStore.expenseCategories;
});

const getCategoryById = (id: string) => {
  return categoriesStore.getCategoryById(id);
};

const handleSubmit = () => {
  if (form.amount > 0 && form.category) {
    transactionsStore.addTransaction({
      ...form,
      date: new Date(form.date),
    });
    
    // Reset form
    form.amount = 0;
    form.category = '';
    form.description = '';
    form.date = new Date();
    
    showAddForm.value = false;
  }
};

const handleDelete = (id: string) => {
  if (confirm('Bạn có chắc muốn xóa giao dịch này?')) {
    transactionsStore.deleteTransaction(id);
  }
};

const handleExport = () => {
  exportTransactions(sortedTransactions.value);
};

// Set default date
onMounted(() => {
  form.date = new Date();
});
</script>
