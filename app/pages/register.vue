<template>
  <div class="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-zinc-950 py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-md w-full space-y-8">
      <!-- Header -->
      <div>
        <h2 class="mt-6 text-center text-3xl font-extrabold text-slate-900 dark:text-white">
          Tạo tài khoản
        </h2>
        <p class="mt-2 text-center text-sm text-slate-600 dark:text-zinc-400">
          Hoặc
          <NuxtLink to="/login" class="font-medium text-primary hover:text-primary/80">
            đăng nhập với tài khoản có sẵn
          </NuxtLink>
        </p>
      </div>

      <!-- Success Message -->
      <div v-if="success" class="rounded-md bg-green-50 dark:bg-green-950/50 p-4 space-y-2">
        <div class="flex items-start">
          <svg class="h-5 w-5 text-green-600 dark:text-green-400 mt-0.5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <p class="text-sm font-medium text-green-800 dark:text-green-200">
              Đăng ký thành công!
            </p>
            <p class="mt-1 text-sm text-green-700 dark:text-green-300">
              Vui lòng kiểm tra email <strong>{{ form.email }}</strong> để xác thực tài khoản.
            </p>
            <p class="mt-2 text-xs text-green-600 dark:text-green-400">
              💡 Lưu ý: Hãy mở link xác thực trong cùng trình duyệt này để hoàn tất đăng ký.
            </p>
          </div>
        </div>
      </div>

      <!-- Form -->
      <form v-if="!success" method="post" action="javascript:void(0);" class="mt-8 space-y-6" autocomplete="on"
        novalidate @submit.prevent="handleRegister">
        <div class="rounded-md shadow-sm space-y-4">
          <!-- Email -->
          <div>
            <label for="email" class="block text-sm font-medium text-slate-700 dark:text-zinc-300">Email</label>
            <input id="email" v-model="form.email" name="email" type="email" autocomplete="email" required
              class="mt-1 appearance-none block w-full px-3 py-2 border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 rounded-md shadow-sm placeholder-slate-400 dark:placeholder-zinc-500 text-slate-900 dark:text-white focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
              placeholder="email@example.com" />
          </div>

          <!-- Password -->
          <div>
            <label for="password" class="block text-sm font-medium text-slate-700 dark:text-zinc-300">Mật khẩu</label>
            <input id="password" v-model="form.password" name="password" type="password" autocomplete="new-password"
              required minlength="8"
              class="mt-1 appearance-none block w-full px-3 py-2 border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 rounded-md shadow-sm placeholder-slate-400 dark:placeholder-zinc-500 text-slate-900 dark:text-white focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
              placeholder="Ít nhất 8 ký tự" />
            <p class="mt-1 text-xs text-slate-500 dark:text-zinc-400">
              Mật khẩu phải có ít nhất 8 ký tự, bao gồm chữ hoa, chữ thường và số
            </p>
          </div>

          <!-- Confirm Password -->
          <div>
            <label for="confirmPassword" class="block text-sm font-medium text-slate-700 dark:text-zinc-300">Xác nhận
              mật khẩu</label>
            <input id="confirmPassword" v-model="form.confirmPassword" name="confirmPassword" type="password"
              autocomplete="new-password" required
              class="mt-1 appearance-none block w-full px-3 py-2 border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 rounded-md shadow-sm placeholder-slate-400 dark:placeholder-zinc-500 text-slate-900 dark:text-white focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
              placeholder="Nhập lại mật khẩu" />
          </div>
        </div>

        <!-- Error Message -->
        <div v-if="error" class="rounded-md bg-red-50 dark:bg-red-950/50 p-4">
          <p class="text-sm text-red-800 dark:text-red-200">{{ error }}</p>
        </div>

        <!-- Submit Button -->
        <div>
          <button type="submit" :disabled="loading"
            class="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-zinc-950 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed">
            {{ loading ? 'Đang tạo tài khoản...' : 'Đăng ký' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: false,
})

const { register } = useAuth()

const form = ref({
  email: '',
  password: '',
  confirmPassword: '',
})

const loading = ref(false)
const error = ref('')
const success = ref(false)

const validatePassword = (password: string): boolean => {
  const hasUpperCase = /[A-Z]/.test(password)
  const hasLowerCase = /[a-z]/.test(password)
  const hasNumber = /\d/.test(password)
  const isLongEnough = password.length >= 8

  return hasUpperCase && hasLowerCase && hasNumber && isLongEnough
}

const handleRegister = async () => {
  console.log('Register form submitted:', { email: form.value.email, hasPassword: !!form.value.password })

  // Clear previous errors
  error.value = ''

  // Validate password format
  if (!validatePassword(form.value.password)) {
    console.log('Password validation failed')
    error.value = 'Mật khẩu phải có ít nhất 8 ký tự, bao gồm chữ hoa, chữ thường và số.'
    return
  }

  // Check password match
  if (form.value.password !== form.value.confirmPassword) {
    console.log('Password mismatch')
    error.value = 'Mật khẩu xác nhận không khớp.'
    return
  }

  try {
    loading.value = true
    await register(form.value.email, form.value.password)
    success.value = true
  } catch (e: any) {
    console.error('Registration error:', e)
    if (e.message?.includes('already registered') || e.message?.includes('already been registered')) {
      error.value = 'Email đã được sử dụng. Vui lòng đăng nhập hoặc sử dụng email khác.'
    } else if (e.message?.includes('Invalid email')) {
      error.value = 'Email không hợp lệ.'
    } else {
      error.value = e.message || 'Có lỗi xảy ra khi đăng ký. Vui lòng thử lại.'
    }
  } finally {
    loading.value = false
  }
}
</script>
