<template>
  <div class="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-zinc-950 py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-md w-full space-y-8">
      <!-- Header -->
      <div>
        <h2 class="mt-6 text-center text-3xl font-extrabold text-slate-900 dark:text-white">
          Đăng nhập
        </h2>
        <p class="mt-2 text-center text-sm text-slate-600 dark:text-zinc-400">
          Hoặc
          <NuxtLink to="/register" class="font-medium text-primary hover:text-primary/80">
            tạo tài khoản mới
          </NuxtLink>
        </p>
      </div>

      <!-- Form -->
      <form method="post" action="javascript:void(0);" class="mt-8 space-y-6" autocomplete="on" novalidate
        @submit.prevent="handleLogin">
        <div class="rounded-md shadow-sm -space-y-px">
          <!-- Email -->
          <div>
            <label for="email" class="sr-only">Email</label>
            <input id="email" v-model="form.email" name="email" type="email" autocomplete="email" required
              class="appearance-none rounded-none relative block w-full px-3 py-2 border border-slate-300 dark:border-zinc-700 placeholder-slate-500 dark:placeholder-zinc-500 text-slate-900 dark:text-white bg-white dark:bg-zinc-800 rounded-t-md focus:outline-none focus:ring-primary focus:border-primary focus:z-10 sm:text-sm"
              placeholder="Email" />
          </div>

          <!-- Password -->
          <div>
            <label for="password" class="sr-only">Mật khẩu</label>
            <input id="password" v-model="form.password" name="password" type="password" autocomplete="current-password"
              required
              class="appearance-none rounded-none relative block w-full px-3 py-2 border border-slate-300 dark:border-zinc-700 placeholder-slate-500 dark:placeholder-zinc-500 text-slate-900 dark:text-white bg-white dark:bg-zinc-800 rounded-b-md focus:outline-none focus:ring-primary focus:border-primary focus:z-10 sm:text-sm"
              placeholder="Mật khẩu" />
          </div>
        </div>

        <!-- Error Message -->
        <div v-if="error" class="rounded-md bg-red-50 dark:bg-red-950/50 p-4">
          <p class="text-sm text-red-800 dark:text-red-200">{{ error }}</p>
        </div>

        <!-- Forgot Password Link -->
        <div class="flex items-center justify-end">
          <div class="text-sm">
            <NuxtLink to="/forgot-password" class="font-medium text-primary hover:text-primary/80">
              Quên mật khẩu?
            </NuxtLink>
          </div>
        </div>

        <!-- Submit Button -->
        <div>
          <button type="submit" :disabled="loading"
            class="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-zinc-950 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed">
            {{ loading ? 'Đang đăng nhập...' : 'Đăng nhập' }}
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

const { login } = useAuth()
const route = useRoute()

const form = ref({
  email: '',
  password: '',
})

const loading = ref(false)
const error = ref('')

const handleLogin = async () => {
  console.log('Login form submitted:', { email: form.value.email, hasPassword: !!form.value.password })

  // Clear previous errors
  error.value = ''

  // Basic validation
  if (!form.value.email || !form.value.password) {
    console.log('Validation failed: missing email or password')
    error.value = 'Vui lòng nhập email và mật khẩu.'
    return
  }

  try {
    loading.value = true

    const result = await login(form.value.email, form.value.password)
    console.log('Login successful:', result.user?.email)

    // Get redirect path before navigation
    const redirect = route.query.redirect as string || '/'
    console.log('Redirecting to:', redirect)

    // Use window.location for full page reload to ensure auth state is fresh
    // This prevents middleware issues with stale user state
    window.location.href = redirect
  } catch (e: any) {
    console.error('Login error:', e)
    if (e.message?.includes('Invalid login credentials')) {
      error.value = 'Email hoặc mật khẩu không đúng.'
    } else if (e.message?.includes('Email not confirmed')) {
      error.value = 'Vui lòng xác thực email trước khi đăng nhập.'
    } else {
      error.value = e.message || 'Đăng nhập thất bại. Vui lòng thử lại.'
    }
    loading.value = false
  }
}
</script>
