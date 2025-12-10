<template>
  <div class="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-zinc-950 py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-md w-full space-y-8">
      <!-- Header -->
      <div>
        <h2 class="mt-6 text-center text-3xl font-extrabold text-slate-900 dark:text-white">
          Quên mật khẩu
        </h2>
        <p class="mt-2 text-center text-sm text-slate-600 dark:text-zinc-400">
          Nhập email của bạn để nhận link đặt lại mật khẩu
        </p>
      </div>

      <!-- Success Message -->
      <div v-if="success" class="rounded-md bg-green-50 dark:bg-green-950/50 p-4">
        <p class="text-sm text-green-800 dark:text-green-200">
          Email đặt lại mật khẩu đã được gửi. Vui lòng kiểm tra hộp thư của bạn.
        </p>
        <div class="mt-4">
          <NuxtLink to="/login" class="text-sm font-medium text-primary hover:text-primary/80">
            Quay lại đăng nhập
          </NuxtLink>
        </div>
      </div>

      <!-- Form -->
      <form v-if="!success" class="mt-8 space-y-6" @submit.prevent="handleResetPassword">
        <div>
          <label for="email" class="block text-sm font-medium text-slate-700 dark:text-zinc-300">Email</label>
          <input id="email" v-model="email" name="email" type="email" required
            class="mt-1 appearance-none block w-full px-3 py-2 border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 rounded-md shadow-sm placeholder-slate-400 dark:placeholder-zinc-500 text-slate-900 dark:text-white focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
            placeholder="email@example.com" />
        </div>

        <!-- Error Message -->
        <div v-if="error" class="rounded-md bg-red-50 dark:bg-red-950/50 p-4">
          <p class="text-sm text-red-800 dark:text-red-200">{{ error }}</p>
        </div>

        <!-- Submit Button -->
        <div class="space-y-4">
          <button type="submit" :disabled="loading"
            class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-zinc-950 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed">
            {{ loading ? 'Đang gửi...' : 'Gửi email đặt lại mật khẩu' }}
          </button>

          <div class="text-center">
            <NuxtLink to="/login"
              class="text-sm font-medium text-slate-600 dark:text-zinc-400 hover:text-slate-800 dark:hover:text-zinc-200">
              Quay lại đăng nhập
            </NuxtLink>
          </div>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: false,
})

const { resetPassword } = useAuth()

const email = ref('')
const loading = ref(false)
const error = ref('')
const success = ref(false)

const handleResetPassword = async () => {
  try {
    loading.value = true
    error.value = ''

    await resetPassword(email.value)
    success.value = true
  } catch (e: any) {
    error.value = e.message || 'Có lỗi xảy ra. Vui lòng thử lại.'
  } finally {
    loading.value = false
  }
}
</script>
