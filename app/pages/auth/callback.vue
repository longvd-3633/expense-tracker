<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50">
    <div class="text-center">
      <div v-if="loading" class="space-y-4">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
        <p class="text-gray-600">Đang xác thực...</p>
      </div>

      <div v-else-if="error" class="space-y-4">
        <div class="text-red-500">
          <svg class="h-12 w-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <p class="text-gray-900 font-medium">Xác thực thất bại</p>
        <p class="text-gray-600">{{ error }}</p>
        <NuxtLink to="/login" class="inline-block mt-4 text-primary hover:text-primary/80">
          Quay lại đăng nhập
        </NuxtLink>
      </div>

      <div v-else class="space-y-4">
        <div class="text-green-500">
          <svg class="h-12 w-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <p class="text-gray-900 font-medium">Xác thực thành công!</p>
        <p class="text-gray-600">Đang chuyển hướng...</p>
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

onMounted(async () => {
  try {
    // Get the URL hash parameters
    const hashParams = new URLSearchParams(window.location.hash.substring(1))
    const accessToken = hashParams.get('access_token')
    const refreshToken = hashParams.get('refresh_token')
    const type = hashParams.get('type')

    if (!accessToken) {
      throw new Error('Không tìm thấy token xác thực')
    }

    // Set the session with the tokens from URL
    const { error: sessionError } = await supabase.auth.setSession({
      access_token: accessToken,
      refresh_token: refreshToken || '',
    })

    if (sessionError) throw sessionError

    // Handle different callback types
    if (type === 'recovery') {
      // Password recovery - redirect to reset password page
      await router.push('/reset-password')
    } else {
      // Email confirmation or other types - redirect to dashboard
      await router.push('/')
    }
  } catch (e: any) {
    error.value = e.message || 'Có lỗi xảy ra trong quá trình xác thực'
    loading.value = false
  }
})
</script>
