<template>
  <div class="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-zinc-950 py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-md w-full">
      <div class="text-center">
        <div v-if="loading" class="space-y-4">
          <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p class="text-slate-600 dark:text-zinc-400">Đang xác thực...</p>
        </div>

        <div v-else-if="error" class="space-y-4">
          <div class="text-red-500">
            <svg class="h-16 w-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h1 class="text-2xl font-bold text-slate-900 dark:text-white">Xác thực thất bại</h1>
          <p class="text-slate-600 dark:text-zinc-400">{{ error }}</p>
          <div class="pt-4">
            <NuxtLink to="/login"
              class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary">
              Quay lại đăng nhập
            </NuxtLink>
          </div>
        </div>

        <div v-else-if="success" class="space-y-6">
          <div class="text-green-500">
            <svg class="h-20 w-20 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <h1 class="text-3xl font-bold text-slate-900 dark:text-white mb-2">
              {{ successTitle }}
            </h1>
            <p class="text-lg text-slate-600 dark:text-zinc-400">
              {{ successMessage }}
            </p>
          </div>
          <div class="flex items-center justify-center space-x-2 text-sm text-slate-500 dark:text-zinc-500">
            <div class="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
            <span>Đang chuyển hướng trong {{ countdown }} giây...</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: false,
})

const supabase = useSupabaseClient()
const router = useRouter()

const loading = ref(true)
const error = ref('')
const success = ref(false)
const successTitle = ref('')
const successMessage = ref('')
const countdown = ref(3)

// Redirect with countdown
const redirectWithCountdown = async (path: string) => {
  // Start countdown
  const interval = setInterval(() => {
    countdown.value--
    if (countdown.value <= 0) {
      clearInterval(interval)
    }
  }, 1000)
  
  // Wait for countdown
  await new Promise(resolve => setTimeout(resolve, 3000))
  
  // Navigate
  await router.push(path)
}

onMounted(async () => {
  try {
    // Wait a bit to ensure UI is rendered
    await new Promise(resolve => setTimeout(resolve, 100))
    
    // Check URL query params
    const urlParams = new URLSearchParams(window.location.search)
    const code = urlParams.get('code')
    const tokenHash = urlParams.get('token_hash')
    const type = urlParams.get('type')

    // Method 1: Handle auth code from URL (email confirmation)
    // Supabase now sends users here after email confirmation with a code parameter
    if (code) {
      // Check if we already have a session (Supabase may have auto-exchanged it)
      const { data: { session: existingSession } } = await supabase.auth.getSession()
      
      if (existingSession) {
        
        // Show success message
        loading.value = false
        success.value = true
        
        // Determine if this is a new user (created in last 2 minutes)
        const userCreatedAt = new Date(existingSession.user.created_at).getTime()
        const twoMinutesAgo = Date.now() - 120000
        const isNewUser = userCreatedAt > twoMinutesAgo
        
        if (type === 'recovery') {
          successTitle.value = 'Xác thực thành công!'
          successMessage.value = 'Bạn sẽ được chuyển đến trang đặt lại mật khẩu.'
          await redirectWithCountdown('/reset-password')
        } else if (isNewUser) {
          successTitle.value = 'Kích hoạt tài khoản thành công! 🎉'
          successMessage.value = 'Tài khoản của bạn đã được kích hoạt. Chào mừng bạn đến với Expense Tracker!'
          await redirectWithCountdown('/')
        } else {
          successTitle.value = 'Xác thực email thành công!'
          successMessage.value = 'Email của bạn đã được xác thực thành công.'
          await redirectWithCountdown('/')
        }
        return
      }
      
      // If no session yet, wait a bit for Supabase auth listener to process it
      let attempts = 0
      const maxAttempts = 15 // Wait up to 3 seconds
      
      while (attempts < maxAttempts) {
        await new Promise(resolve => setTimeout(resolve, 200))
        
        const { data: { session: newSession } } = await supabase.auth.getSession()
        
        if (newSession) {
          loading.value = false
          success.value = true
          
          const userCreatedAt = new Date(newSession.user.created_at).getTime()
          const twoMinutesAgo = Date.now() - 120000
          const isNewUser = userCreatedAt > twoMinutesAgo
          
          if (type === 'recovery') {
            successTitle.value = 'Xác thực thành công!'
            successMessage.value = 'Bạn sẽ được chuyển đến trang đặt lại mật khẩu.'
            await redirectWithCountdown('/reset-password')
          } else if (isNewUser) {
            successTitle.value = 'Kích hoạt tài khoản thành công! 🎉'
            successMessage.value = 'Tài khoản của bạn đã được kích hoạt. Chào mừng bạn đến với Expense Tracker!'
            await redirectWithCountdown('/')
          } else {
            successTitle.value = 'Xác thực email thành công!'
            successMessage.value = 'Email của bạn đã được xác thực thành công.'
            await redirectWithCountdown('/')
          }
          return
        }
        
        attempts++
      }
      
      // Still no session - this means the code couldn't be exchanged
      // This can happen if:
      // 1. Link was already used
      // 2. Link expired
      // 3. User opened link in different browser (PKCE verifier not found)
      throw new Error('Không thể xác thực từ link này. Vui lòng thử mở link trong cùng trình duyệt mà bạn đã đăng ký, hoặc link có thể đã hết hạn.')
    }

    // Method 2: OTP flow with token_hash (old flow)
    if (tokenHash) {
      // Verify the OTP token
      const { data, error: verifyError } = await supabase.auth.verifyOtp({
        token_hash: tokenHash,
        type: type === 'recovery' ? 'recovery' : 'email',
      })
      
      if (verifyError) {
        throw new Error('Không thể xác thực token. Link có thể đã hết hạn hoặc đã được sử dụng.')
      }
      
      if (data.session) {
        // Show success message
        loading.value = false
        success.value = true
        
        // Set message based on type
        if (type === 'recovery') {
          successTitle.value = 'Xác thực thành công!'
          successMessage.value = 'Bạn sẽ được chuyển đến trang đặt lại mật khẩu.'
          await redirectWithCountdown('/reset-password')
        } else if (type === 'signup') {
          successTitle.value = 'Kích hoạt tài khoản thành công! 🎉'
          successMessage.value = 'Tài khoản của bạn đã được kích hoạt. Chào mừng bạn đến với Expense Tracker!'
          await redirectWithCountdown('/')
        } else {
          successTitle.value = 'Xác thực email thành công!'
          successMessage.value = 'Email của bạn đã được xác thực thành công.'
          await redirectWithCountdown('/')
        }
        return
      }
      
      throw new Error('Không thể tạo session từ token')
    }
    
    // Method 3: Check for access_token in hash (OAuth or old flow)
    const hashParams = new URLSearchParams(window.location.hash.substring(1))
    const accessToken = hashParams.get('access_token')
    const refreshToken = hashParams.get('refresh_token')
    const hashType = hashParams.get('type')
    
    if (accessToken) {
      const { error: sessionError } = await supabase.auth.setSession({
        access_token: accessToken,
        refresh_token: refreshToken || '',
      })

      if (sessionError) throw sessionError
      
      // Show success message
      loading.value = false
      success.value = true
      
      const finalType = type || hashType
      if (finalType === 'recovery') {
        successTitle.value = 'Xác thực thành công!'
        successMessage.value = 'Bạn sẽ được chuyển đến trang đặt lại mật khẩu.'
        await redirectWithCountdown('/reset-password')
      } else {
        successTitle.value = 'Đăng nhập thành công!'
        successMessage.value = 'Bạn đã đăng nhập thành công vào hệ thống.'
        await redirectWithCountdown('/')
      }
      return
    }
    
    // No valid auth method found
    throw new Error('Không tìm thấy thông tin xác thực trong URL')
    
  } catch (e: any) {
    error.value = e.message || 'Có lỗi xảy ra trong quá trình xác thực'
    loading.value = false
  }
})
</script>
