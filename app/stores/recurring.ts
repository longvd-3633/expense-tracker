import { defineStore } from 'pinia'
import { startOfDay, format } from 'date-fns'
import type { RealtimeChannel } from '@supabase/supabase-js'
import type {
  RecurringTransaction,
  RecurringTransactionInput,
  GeneratedTransaction,
} from '~/types/transaction'
import { calculateNextOccurrence } from '~/utils/recurrence'

export const useRecurringStore = defineStore('recurring', () => {
  const supabase = useSupabaseClient<any>()
  const user = useSupabaseUser()

  // State
  const recurringTransactions = ref<RecurringTransaction[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)
  const subscription = ref<RealtimeChannel | null>(null)

  // ============================================================================
  // MAPPING HELPERS
  // ============================================================================

  /**
   * Map database record to RecurringTransaction type
   */
  const mapRecordToRecurring = (record: any): RecurringTransaction => ({
    id: record.id,
    userId: record.user_id,
    name: record.name,
    type: record.type,
    amount: parseFloat(record.amount),
    categoryId: record.category_id,
    description: record.description ?? '',
    frequency: record.frequency,
    interval: record.interval,
    startDate: new Date(record.start_date),
    endDate: record.end_date ? new Date(record.end_date) : null,
    weekdays: record.weekdays ?? undefined,
    monthlyType: record.monthly_type ?? undefined,
    monthlyDay: record.monthly_day ?? undefined,
    monthlyWeekday: record.monthly_weekday ?? undefined,
    monthlyWeekPosition: record.monthly_week_position ?? undefined,
    isActive: record.is_active,
    autoCreate: record.auto_create,
    lastGeneratedDate: record.last_generated_date ? new Date(record.last_generated_date) : null,
    nextOccurrenceDate: new Date(record.next_occurrence_date),
    occurrencesGenerated: record.occurrences_generated,
    maxOccurrences: record.max_occurrences ?? null,
    createdAt: new Date(record.created_at),
    updatedAt: new Date(record.updated_at),
    deletedAt: record.deleted_at ? new Date(record.deleted_at) : null,
  })

  /**
   * Map RecurringTransactionInput to database record
   */
  const mapInputToRecord = (input: RecurringTransactionInput, userId: string) => {
    // Calculate initial next_occurrence_date
    const nextOccurrence = startOfDay(input.startDate)

    // Ensure categoryId is a valid UUID or null (not empty string or "undefined")
    const categoryId = input.categoryId && input.categoryId !== 'undefined' ? input.categoryId : null

    return {
      user_id: userId,
      name: input.name,
      type: input.type,
      amount: input.amount,
      category_id: categoryId,
      description: input.description,
      frequency: input.frequency,
      interval: input.interval,
      start_date: format(input.startDate, 'yyyy-MM-dd'),
      end_date: input.endDate ? format(input.endDate, 'yyyy-MM-dd') : null,
      weekdays: input.weekdays ?? null,
      monthly_type: input.monthlyType ?? null,
      monthly_day: input.monthlyDay ?? null,
      monthly_weekday: input.monthlyWeekday ?? null,
      monthly_week_position: input.monthlyWeekPosition ?? null,
      auto_create: input.autoCreate ?? true,
      max_occurrences: input.maxOccurrences ?? null,
      next_occurrence_date: format(nextOccurrence, 'yyyy-MM-dd'),
      occurrences_generated: 0,
    }
  }

  // ============================================================================
  // GETTERS
  // ============================================================================

  /**
   * Get active recurring transactions (sorted by next occurrence)
   */
  const activeRecurring = computed(() =>
    recurringTransactions.value
      .filter(r => r.isActive && !r.deletedAt)
      .sort((a, b) => a.nextOccurrenceDate.getTime() - b.nextOccurrenceDate.getTime())
  )

  /**
   * Get recurring transaction by ID
   */
  const getRecurringById = (id: string): RecurringTransaction | undefined => {
    return recurringTransactions.value.find(r => r.id === id)
  }

  /**
   * Get recurring transactions by type
   */
  const getRecurringByType = (type: 'income' | 'expense'): RecurringTransaction[] => {
    return activeRecurring.value.filter(r => r.type === type)
  }

  /**
   * Count active recurring templates
   */
  const activeCount = computed(() => activeRecurring.value.length)

  // ============================================================================
  // ACTIONS
  // ============================================================================

  /**
   * Fetch all recurring transactions for current user
   */
  const fetchRecurringTransactions = async () => {
    if (!user.value?.id) {
      console.warn('[RecurringStore] No user ID, skipping fetch')
      return
    }

    loading.value = true
    error.value = null

    try {
      const { data, error: fetchError } = await supabase
        .from('recurring_transactions')
        .select('*')
        .eq('user_id', user.value.id)
        .is('deleted_at', null)
        .not('category_id', 'is', null) // Only fetch templates with valid category
        .order('next_occurrence_date', { ascending: true })

      if (fetchError) throw fetchError

      recurringTransactions.value = (data || []).map(mapRecordToRecurring)
      console.log(`[RecurringStore] Fetched ${recurringTransactions.value.length} recurring transactions`)
    } catch (e: any) {
      console.error('[RecurringStore] Fetch error:', e)
      error.value = e.message
    } finally {
      loading.value = false
    }
  }

  /**
   * Create new recurring transaction
   */
  const createRecurringTransaction = async (
    input: RecurringTransactionInput
  ): Promise<RecurringTransaction | null> => {
    if (!user.value?.id) {
      error.value = 'User not authenticated'
      return null
    }

    loading.value = true
    error.value = null

    try {
      const record = mapInputToRecord(input, user.value.id)

      const { data, error: insertError } = await supabase
        .from('recurring_transactions')
        .insert(record)
        .select()
        .single()

      if (insertError) throw insertError

      const newRecurring = mapRecordToRecurring(data)
      recurringTransactions.value.push(newRecurring)
      
      console.log('[RecurringStore] Created recurring transaction:', newRecurring.id)
      return newRecurring
    } catch (e: any) {
      console.error('[RecurringStore] Create error:', e)
      error.value = e.message
      return null
    } finally {
      loading.value = false
    }
  }

  /**
   * Update existing recurring transaction
   */
  const updateRecurringTransaction = async (
    id: string,
    updates: Partial<RecurringTransactionInput>
  ): Promise<boolean> => {
    if (!user.value) {
      error.value = 'User not authenticated'
      return false
    }

    loading.value = true
    error.value = null

    try {
      const existing = getRecurringById(id)
      if (!existing) {
        throw new Error('Recurring transaction not found')
      }

      // Build update record
      const updateRecord: any = {}
      
      if (updates.name !== undefined) updateRecord.name = updates.name
      if (updates.type !== undefined) updateRecord.type = updates.type
      if (updates.amount !== undefined) updateRecord.amount = updates.amount
      if (updates.categoryId !== undefined) {
        updateRecord.category_id = updates.categoryId && updates.categoryId !== 'undefined' ? updates.categoryId : null
      }
      if (updates.description !== undefined) updateRecord.description = updates.description
      if (updates.frequency !== undefined) updateRecord.frequency = updates.frequency
      if (updates.interval !== undefined) updateRecord.interval = updates.interval
      if (updates.startDate !== undefined) updateRecord.start_date = format(updates.startDate, 'yyyy-MM-dd')
      if (updates.endDate !== undefined) updateRecord.end_date = updates.endDate ? format(updates.endDate, 'yyyy-MM-dd') : null
      if (updates.weekdays !== undefined) updateRecord.weekdays = updates.weekdays
      if (updates.monthlyType !== undefined) updateRecord.monthly_type = updates.monthlyType
      if (updates.monthlyDay !== undefined) updateRecord.monthly_day = updates.monthlyDay
      if (updates.monthlyWeekday !== undefined) updateRecord.monthly_weekday = updates.monthlyWeekday
      if (updates.monthlyWeekPosition !== undefined) updateRecord.monthly_week_position = updates.monthlyWeekPosition
      if (updates.autoCreate !== undefined) updateRecord.auto_create = updates.autoCreate
      if (updates.maxOccurrences !== undefined) updateRecord.max_occurrences = updates.maxOccurrences

      // If recurrence rule changed, recalculate next_occurrence_date
      if (
        updates.frequency !== undefined ||
        updates.interval !== undefined ||
        updates.startDate !== undefined ||
        updates.weekdays !== undefined ||
        updates.monthlyType !== undefined ||
        updates.monthlyDay !== undefined ||
        updates.monthlyWeekday !== undefined ||
        updates.monthlyWeekPosition !== undefined
      ) {
        const newFrequency = updates.frequency ?? existing.frequency
        const newInterval = updates.interval ?? existing.interval
        const newStartDate = updates.startDate ?? existing.startDate
        
        const nextOccurrence = calculateNextOccurrence(
          newFrequency,
          newInterval,
          newStartDate,
          {
            weekdays: updates.weekdays ?? existing.weekdays,
            monthlyType: updates.monthlyType ?? existing.monthlyType,
            monthlyDay: updates.monthlyDay ?? existing.monthlyDay,
            monthlyWeekday: updates.monthlyWeekday ?? existing.monthlyWeekday,
            monthlyWeekPosition: updates.monthlyWeekPosition ?? existing.monthlyWeekPosition,
          }
        )
        
        updateRecord.next_occurrence_date = format(nextOccurrence, 'yyyy-MM-dd')
      }

      const { data, error: updateError } = await supabase
        .from('recurring_transactions')
        .update(updateRecord)
        .eq('id', id)
        .eq('user_id', user.value.id)
        .select()
        .single()

      if (updateError) throw updateError

      // Update local state
      const index = recurringTransactions.value.findIndex(r => r.id === id)
      if (index !== -1) {
        recurringTransactions.value[index] = mapRecordToRecurring(data)
      }

      console.log('[RecurringStore] Updated recurring transaction:', id)
      return true
    } catch (e: any) {
      console.error('[RecurringStore] Update error:', e)
      error.value = e.message
      return false
    } finally {
      loading.value = false
    }
  }

  /**
   * Soft delete recurring transaction (set is_active = false)
   */
  const deleteRecurringTransaction = async (id: string): Promise<boolean> => {
    if (!user.value?.id) {
      error.value = 'User not authenticated'
      return false
    }

    loading.value = true
    error.value = null

    try {
      const { error: deleteError } = await supabase
        .from('recurring_transactions')
        .update({ is_active: false, deleted_at: new Date().toISOString() })
        .eq('id', id)
        .eq('user_id', user.value.id)

      if (deleteError) throw deleteError

      // Remove from local state
      recurringTransactions.value = recurringTransactions.value.filter(r => r.id !== id)
      
      console.log('[RecurringStore] Deleted recurring transaction:', id)
      return true
    } catch (e: any) {
      console.error('[RecurringStore] Delete error:', e)
      error.value = e.message
      return false
    } finally {
      loading.value = false
    }
  }

  /**
   * Skip the next occurrence of a recurring transaction
   */
  const skipNextOccurrence = async (id: string): Promise<boolean> => {
    if (!user.value?.id) {
      error.value = 'User not authenticated'
      return false
    }

    loading.value = true
    error.value = null

    try {
      const existing = getRecurringById(id)
      if (!existing) {
        throw new Error('Recurring transaction not found')
      }

      // Calculate next occurrence after current one
      const nextOccurrence = calculateNextOccurrence(
        existing.frequency,
        existing.interval,
        existing.nextOccurrenceDate,
        {
          weekdays: existing.weekdays,
          monthlyType: existing.monthlyType,
          monthlyDay: existing.monthlyDay,
          monthlyWeekday: existing.monthlyWeekday,
          monthlyWeekPosition: existing.monthlyWeekPosition,
        }
      )

      const { data, error: updateError } = await supabase
        .from('recurring_transactions')
        .update({
          next_occurrence_date: format(nextOccurrence, 'yyyy-MM-dd'),
          occurrences_generated: existing.occurrencesGenerated + 1,
        })
        .eq('id', id)
        .eq('user_id', user.value.id)
        .select()
        .single()

      if (updateError) throw updateError

      // Update local state
      const index = recurringTransactions.value.findIndex(r => r.id === id)
      if (index !== -1) {
        recurringTransactions.value[index] = mapRecordToRecurring(data)
      }

      console.log('[RecurringStore] Skipped next occurrence for:', id)
      return true
    } catch (e: any) {
      console.error('[RecurringStore] Skip error:', e)
      error.value = e.message
      return false
    } finally {
      loading.value = false
    }
  }

  // ============================================================================
  // REALTIME SUBSCRIPTION
  // ============================================================================

  /**
   * Subscribe to realtime changes for recurring_transactions
   */
  const subscribeToChanges = () => {
    if (!user.value || subscription.value) return

    console.log('[RecurringStore] Subscribing to realtime changes')

    subscription.value = supabase
      .channel('recurring_transactions_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'recurring_transactions',
          filter: `user_id=eq.${user.value.id}`,
        },
        (payload: any) => {
          console.log('[RecurringStore] Realtime event:', payload.eventType)

          if (payload.eventType === 'INSERT') {
            const newRecurring = mapRecordToRecurring(payload.new)
            const exists = recurringTransactions.value.some(r => r.id === newRecurring.id)
            if (!exists) {
              recurringTransactions.value.push(newRecurring)
            }
          } else if (payload.eventType === 'UPDATE') {
            const updated = mapRecordToRecurring(payload.new)
            const index = recurringTransactions.value.findIndex(r => r.id === updated.id)
            if (index !== -1) {
              recurringTransactions.value[index] = updated
            }
          } else if (payload.eventType === 'DELETE') {
            recurringTransactions.value = recurringTransactions.value.filter(
              r => r.id !== payload.old.id
            )
          }
        }
      )
      .subscribe()
  }

  /**
   * Unsubscribe from realtime changes
   */
  const unsubscribe = async () => {
    if (subscription.value) {
      await subscription.value.unsubscribe()
      subscription.value = null
      console.log('[RecurringStore] Unsubscribed from realtime changes')
    }
  }

  // ============================================================================
  // LIFECYCLE
  // ============================================================================

  /**
   * Initialize store (fetch data + subscribe to changes)
   */
  const initialize = async () => {
    await fetchRecurringTransactions()
    subscribeToChanges()
  }

  /**
   * Cleanup store
   */
  const cleanup = async () => {
    await unsubscribe()
    recurringTransactions.value = []
    loading.value = false
    error.value = null
  }

  return {
    // State
    recurringTransactions,
    loading,
    error,

    // Getters
    activeRecurring,
    getRecurringById,
    getRecurringByType,
    activeCount,

    // Actions
    fetchRecurringTransactions,
    createRecurringTransaction,
    updateRecurringTransaction,
    deleteRecurringTransaction,
    skipNextOccurrence,
    subscribeToChanges,
    unsubscribe,
    initialize,
    cleanup,
  }
})
