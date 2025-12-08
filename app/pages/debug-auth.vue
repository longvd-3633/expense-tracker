<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50 p-4">
    <div class="max-w-2xl w-full bg-white rounded-lg shadow-lg p-6">
      <h1 class="text-2xl font-bold mb-4">🔍 Auth Debug Helper</h1>
      
      <!-- Current URL -->
      <div class="mb-4 p-4 bg-blue-50 rounded">
        <h2 class="font-semibold mb-2">Current URL:</h2>
        <code class="text-sm break-all">{{ currentUrl }}</code>
      </div>

      <!-- Session Status -->
      <div class="mb-4 p-4 rounded" :class="session ? 'bg-green-50' : 'bg-red-50'">
        <h2 class="font-semibold mb-2">Session Status:</h2>
        <p v-if="session" class="text-sm">
          ✅ Logged in as: <strong>{{ session.user.email }}</strong>
        </p>
        <p v-else class="text-sm">❌ No active session</p>
      </div>

      <!-- URL Parameters -->
      <div class="mb-4 p-4 bg-gray-50 rounded">
        <h2 class="font-semibold mb-2">URL Parameters:</h2>
        <div v-if="urlParams.length" class="space-y-1">
          <div v-for="param in urlParams" :key="param.key" class="text-sm">
            <span class="font-mono">{{ param.key }}</span>: 
            <span class="text-gray-600">{{ param.value }}</span>
          </div>
        </div>
        <p v-else class="text-sm text-gray-500">No parameters</p>
      </div>

      <!-- Hash Parameters -->
      <div class="mb-4 p-4 bg-gray-50 rounded">
        <h2 class="font-semibold mb-2">Hash Parameters:</h2>
        <div v-if="hashParams.length" class="space-y-1">
          <div v-for="param in hashParams" :key="param.key" class="text-sm">
            <span class="font-mono">{{ param.key }}</span>: 
            <span class="text-gray-600">{{ param.value.substring(0, 50) }}{{ param.value.length > 50 ? '...' : '' }}</span>
          </div>
        </div>
        <p v-else class="text-sm text-gray-500">No hash parameters</p>
      </div>

      <!-- Actions -->
      <div class="flex gap-2">
        <NuxtLink to="/" class="px-4 py-2 bg-primary text-white rounded hover:bg-primary/90">
          Go to Home
        </NuxtLink>
        <NuxtLink to="/login" class="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300">
          Go to Login
        </NuxtLink>
        <button @click="refresh" class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
          Refresh
        </button>
      </div>

      <!-- Instructions -->
      <div class="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded">
        <h3 class="font-semibold mb-2">💡 How to use:</h3>
        <ol class="text-sm space-y-1 list-decimal list-inside">
          <li>Request password reset from <NuxtLink to="/forgot-password" class="text-primary hover:underline">/forgot-password</NuxtLink></li>
          <li>Click the link from email</li>
          <li>Check the URL parameters above</li>
          <li>Verify session status</li>
          <li>Compare with expected flow in SUPABASE_SETUP.md</li>
        </ol>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: false,
})

const supabase = useSupabaseClient()

const currentUrl = ref('')
const session = ref<any>(null)
const urlParams = ref<Array<{ key: string; value: string }>>([])
const hashParams = ref<Array<{ key: string; value: string }>>([])

const loadDebugInfo = async () => {
  // Current URL
  currentUrl.value = window.location.href

  // Session
  const { data: { session: currentSession } } = await supabase.auth.getSession()
  session.value = currentSession

  // URL params
  const params = new URLSearchParams(window.location.search)
  urlParams.value = Array.from(params.entries()).map(([key, value]) => ({ key, value }))

  // Hash params
  const hash = new URLSearchParams(window.location.hash.substring(1))
  hashParams.value = Array.from(hash.entries()).map(([key, value]) => ({ key, value }))
}

const refresh = () => {
  window.location.reload()
}

onMounted(() => {
  loadDebugInfo()
})
</script>
