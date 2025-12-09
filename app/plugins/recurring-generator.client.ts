/**
 * Recurring Transactions Auto-Generation Plugin
 * 
 * Runs on app initialization to generate any missed recurring transactions
 * Only runs on client-side after user authentication
 */

export default defineNuxtPlugin({
  name: 'recurring-generator',
  parallel: true,
  async setup() {
    const user = useSupabaseUser()
    const recurringStore = useRecurringStore()
    const transactionsStore = useTransactionsStore()
    const supabase = useSupabaseClient()

    let hasRun = false

    // Wait for user to be authenticated
    watch(
      () => user.value?.id,
      async (userId) => {
        if (userId && !hasRun) {
          hasRun = true
          console.log('[RecurringGenerator Plugin] User authenticated, checking for pending transactions')
          
          try {
            // Ensure stores are initialized
            await recurringStore.fetchRecurringTransactions()
            
            // Small delay to ensure transactions store is ready
            await new Promise(resolve => setTimeout(resolve, 500))
            
            // Import generator dynamically to avoid SSR issues
            const { generatePendingTransactions } = await import('~/utils/recurring-generator')
            
            // Generate pending transactions
            const result = await generatePendingTransactions(
              recurringStore.recurringTransactions,
              transactionsStore,
              supabase,
              userId
            )
            
            if (result.success > 0) {
              console.log(`[RecurringGenerator Plugin] Generated ${result.success} transactions`)
              
              // Refresh transactions to show newly generated ones
              await transactionsStore.fetchTransactions()
            }
            
            if (result.failed > 0) {
              console.warn(`[RecurringGenerator Plugin] Failed to generate ${result.failed} transactions`)
            }
            
            if (result.skipped > 0) {
              console.log(`[RecurringGenerator Plugin] Skipped ${result.skipped} already generated transactions`)
            }
          } catch (error: any) {
            console.error('[RecurringGenerator Plugin] Error during generation:', error)
          }
        }
      },
      { immediate: true }
    )
  },
})
