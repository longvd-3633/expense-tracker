<script setup lang="ts">
const settingsStore = useSettingsStore()
const user = useSupabaseUser()

const applyTheme = (theme: 'light' | 'dark' | 'system') => {
  if (!process.client) return

  const root = document.documentElement

  if (theme === 'system') {
    // Use system preference
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    root.classList.toggle('dark', prefersDark)
  } else {
    root.classList.toggle('dark', theme === 'dark')
  }
}

// Load settings when user is logged in
watch(user, async (newUser) => {
  if (newUser) {
    await settingsStore.fetchSettings()
    // Apply theme after settings are loaded
    applyTheme(settingsStore.settings.theme)
  }
}, { immediate: true })

// Apply theme whenever it changes
watch(() => settingsStore.settings.theme, (theme) => {
  applyTheme(theme)
})

// Listen for system theme changes when in system mode
onMounted(() => {
  const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
  const handleChange = () => {
    if (settingsStore.settings.theme === 'system') {
      applyTheme('system')
    }
  }

  mediaQuery.addEventListener('change', handleChange)

  onUnmounted(() => {
    mediaQuery.removeEventListener('change', handleChange)
  })
})
</script>

<template>
  <div>
    <NuxtRouteAnnouncer />
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </div>
</template>
