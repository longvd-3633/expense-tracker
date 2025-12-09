/**
 * Suppress Vue readonly ref warnings in development
 * This is a common warning with useSupabaseUser() and doesn't affect functionality
 */
export default defineNuxtPlugin(() => {
  if (process.dev) {
    const originalWarn = console.warn
    console.warn = (...args: any[]) => {
      // Suppress specific readonly ref warnings
      const msg = args[0]
      if (
        typeof msg === 'string' &&
        msg.includes('Set operation on key "value" failed: target is readonly')
      ) {
        return
      }
      originalWarn(...args)
    }
  }
})
