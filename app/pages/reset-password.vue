<template>
  <div class="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-zinc-950 py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-md w-full space-y-8">
      <!-- Header -->
      <div>
        <h2 class="mt-6 text-center text-3xl font-extrabold text-slate-900 dark:text-white">
          Đặt lại mật khẩu
        </h2>
        <p class="mt-2 text-center text-sm text-slate-600 dark:text-zinc-400">
          Nhập mật khẩu mới của bạn
        </p>
      </div>

      <!-- Success Message -->
      <div v-if="success" class="rounded-md bg-green-50 dark:bg-green-950/50 p-4">
        <div class="flex">
          <div class="flex-shrink-0">
            <svg class="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clip-rule="evenodd" />
            </svg>
          </div>
          <div class="ml-3">
            <p class="text-sm text-green-800 dark:text-green-200">
              Mật khẩu đã được đặt lại thành công!
            </p>
          </div>
        </div>
        <div class="mt-4">
          <NuxtLink to="/login"
            class="text-sm font-medium text-green-800 dark:text-green-300 hover:text-green-700 dark:hover:text-green-200">
            Đăng nhập ngay →
          </NuxtLink>
        </div>
      </div>

      <!-- Loading Session -->
      <div v-if="!sessionReady && !error" class="text-center">
        <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        <p class="mt-2 text-sm text-slate-600 dark:text-zinc-400">Đang xác thực...</p>
      </div>

      <!-- Form -->
      <form v-if="!success && sessionReady" class="mt-8 space-y-6" @submit.prevent="handleReset">
        <div class="space-y-4">
          <!-- New Password -->
          <div>
            <label for="password" class="block text-sm font-medium text-slate-700 dark:text-zinc-300">
              Mật khẩu mới
            </label>
            <input id="password" v-model="form.password" name="password" type="password" required minlength="8"
              class="mt-1 appearance-none block w-full px-3 py-2 border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 rounded-md shadow-sm placeholder-slate-400 dark:placeholder-zinc-500 text-slate-900 dark:text-white focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
              placeholder="Ít nhất 8 ký tự" />
            <p class="mt-1 text-xs text-slate-500 dark:text-zinc-400">
              Mật khẩu phải có ít nhất 8 ký tự, bao gồm chữ hoa, chữ thường và số
            </p>
          </div>

          <!-- Confirm Password -->
          <div>
            <label for="confirmPassword" class="block text-sm font-medium text-slate-700 dark:text-zinc-300">
              Xác nhận mật khẩu
            </label>
            <input id="confirmPassword" v-model="form.confirmPassword" name="confirmPassword" type="password" required
              class="mt-1 appearance-none block w-full px-3 py-2 border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 rounded-md shadow-sm placeholder-slate-400 dark:placeholder-zinc-500 text-slate-900 dark:text-white focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
              placeholder="Nhập lại mật khẩu" />
          </div>
        </div>

        <!-- Error Message -->
        <div v-if="error" class="rounded-md bg-red-50 dark:bg-red-950/50 p-4">
          <div class="flex items-start">
            <div class="flex-shrink-0">
              <svg class="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clip-rule="evenodd" />
              </svg>
            </div>
            <div class="ml-3 flex-1">
              <p class="text-sm text-red-800 dark:text-red-200">{{ error }}</p>
              <div class="mt-4 space-x-2">
                <NuxtLink to="/forgot-password"
                  class="text-sm font-medium text-red-800 dark:text-red-300 hover:text-red-700 dark:hover:text-red-200 underline">
                  Gửi lại email
                </NuxtLink>
                <NuxtLink to="/debug-auth"
                  class="text-sm font-medium text-red-800 dark:text-red-300 hover:text-red-700 dark:hover:text-red-200 underline">
                  Xem thông tin debug
                </NuxtLink>
              </div>
            </div>
          </div>
        </div>

        <!-- Submit Button -->
        <div>
          <button type="submit" :disabled="loading"
            class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-zinc-950 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed">
            {{ loading ? 'Đang cập nhật...' : 'Đặt lại mật khẩu' }}
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

const { updatePassword } = useAuth()
const supabase = useSupabaseClient()
const router = useRouter()

const form = ref({
  password: '',
  confirmPassword: '',
})

const loading = ref(false)
const error = ref('')
const success = ref(false)
const sessionReady = ref(false)

// Check for auth session from URL hash or verify token
onMounted(async () => {
  try {
    console.log('Reset password page - checking auth...')
    console.log('URL:', window.location.href)

    // Method 1: Check if we have access_token in hash (from callback redirect)
    const hashParams = new URLSearchParams(window.location.hash.substring(1))
    const accessToken = hashParams.get('access_token')
    const refreshToken = hashParams.get('refresh_token')

    if (accessToken) {
      console.log('Found access token in URL, setting session...')
      const { error: sessionError } = await supabase.auth.setSession({
        access_token: accessToken,
        refresh_token: refreshToken || '',
      })

      if (sessionError) {
        throw sessionError
      }

      sessionReady.value = true
      console.log('Session set successfully')
      return
    }

    // Method 2: Check if session already exists (came from callback)
    const { data: { session } } = await supabase.auth.getSession()

    if (session) {
      console.log('Session already exists:', session.user.email)
      sessionReady.value = true
      return
    }

    // Method 3: Check if we have token_hash in URL (direct from email)
    const urlParams = new URLSearchParams(window.location.search)
    const tokenHash = urlParams.get('token_hash')

    if (tokenHash) {
      console.log('Found token_hash, attempting to verify...')
      // Supabase will auto-exchange token_hash to session
      await new Promise(resolve => setTimeout(resolve, 1500))

      const { data: { session: verifiedSession } } = await supabase.auth.getSession()
      if (verifiedSession) {
        console.log('Token verified, session created')
        sessionReady.value = true
        return
      }
    }

    // No valid auth found
    error.value = 'Auth session missing! Link có thể đã hết hạn.'
    console.error('No valid authentication found')

  } catch (e: any) {
    console.error('Reset password error:', e)
    error.value = e.message || 'Không thể xác thực phiên làm việc'
  }
})

const validatePassword = (password: string): boolean => {
  const hasUpperCase = /[A-Z]/.test(password)
  const hasLowerCase = /[a-z]/.test(password)
  const hasNumber = /\d/.test(password)
  const isLongEnough = password.length >= 8

  return hasUpperCase && hasLowerCase && hasNumber && isLongEnough
}

const handleReset = async () => {
  try {
    loading.value = true
    error.value = ''

    // Validate password
    if (!validatePassword(form.value.password)) {
      error.value = 'Mật khẩu phải có ít nhất 8 ký tự, bao gồm chữ hoa, chữ thường và số.'
      return
    }

    // Check password match
    if (form.value.password !== form.value.confirmPassword) {
      error.value = 'Mật khẩu xác nhận không khớp.'
      return
    }

    await updatePassword(form.value.password)
    success.value = true

    // Redirect to login after 2 seconds
    setTimeout(() => {
      router.push('/login')
    }, 2000)
  } catch (e: any) {
    error.value = e.message || 'Có lỗi xảy ra. Vui lòng thử lại.'
  } finally {
    loading.value = false
  }
}
</script>
