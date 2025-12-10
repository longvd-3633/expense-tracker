export default defineNuxtPlugin(() => {
  const colorMode = useColorMode()
  const settingsStore = useSettingsStore()

  // Watch settings and sync to color mode
  watch(
    () => settingsStore.settings.theme,
    (theme) => {
      if (theme === 'system') {
        colorMode.preference = 'system'
      } else {
        colorMode.preference = theme
      }
    },
    { immediate: true }
  )
})
