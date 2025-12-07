import { defineStore } from 'pinia'
import {
  startOfDay,
  endOfDay,
  eachDayOfInterval,
  startOfHour,
  endOfHour,
  eachHourOfInterval,
  addHours,
  addDays,
  format,
} from 'date-fns'
import type { RealtimeChannel } from '@supabase/supabase-js'
import type { Transaction, TransactionInput } from '~/types/transaction'

type ChartGranularity = 'hour' | 'day'

interface TimeBucket {
  key: string
  start: Date
  end: Date
  label: string
  total: number
}

interface CategoryBreakdownEntry {
  categoryId: string | null | 'others'
  total: number
  isOthers?: boolean
  members?: Array<{ categoryId: string | null; total: number }>
}

export const useTransactionsStore = defineStore('transactions', () => {
  const supabase = useSupabaseClient<any>()
  const user = useSupabaseUser()

  // State
  const transactions = ref<Transaction[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)
  const subscription = ref<RealtimeChannel | null>(null)
  const realtimeDisconnected = ref(false)

  const mapRecordToTransaction = (record: any): Transaction => ({
    id: record.id,
    userId: record.user_id,
    date: new Date(record.date),
    type: record.type,
    amount: record.amount,
    category: record.category_id,
    description: record.description ?? '',
    tags: record.tags ?? [],
    createdAt: new Date(record.created_at),
    updatedAt: new Date(record.updated_at),
  })

  const hourBucketMs = 1000 * 60 * 60
  const dayBucketMs = 1000 * 60 * 60 * 24

  const createTimeBuckets = (start: Date, end: Date, granularity: ChartGranularity): TimeBucket[] => {
    const isHourly = granularity === 'hour'
    const normalizedStart = isHourly ? startOfHour(start) : startOfDay(start)
    const normalizedEnd = isHourly ? endOfHour(end) : endOfDay(end)
    const buckets = (isHourly ? eachHourOfInterval : eachDayOfInterval)({
      start: normalizedStart,
      end: normalizedEnd,
    })

    return buckets.map(point => {
      const bucketEnd = (isHourly ? addHours : addDays)(point, 1)
      return {
        key: `${point.toISOString()}-${bucketEnd.toISOString()}`,
        start: point,
        end: bucketEnd,
        label: format(point, isHourly ? 'HH:mm' : 'dd MMM'),
        total: 0,
      }
    })
  }

  const aggregateTransactionsByBucket = (
    type: 'income' | 'expense',
    start: Date,
    end: Date,
    granularity: ChartGranularity
  ): TimeBucket[] => {
    const buckets = createTimeBuckets(start, end, granularity)
    if (buckets.length === 0) {
      return []
    }

    const relevantTransactions = getTransactionsByDateRange(start, end).filter(t => t.type === type)
    const bucketMs = granularity === 'hour' ? hourBucketMs : dayBucketMs
    const bucketStartTime = buckets[0]!.start.getTime()

    for (const transaction of relevantTransactions) {
      const index = Math.floor((transaction.date.getTime() - bucketStartTime) / bucketMs)
      if (index >= 0 && index < buckets.length) {
        buckets[index]!.total += transaction.amount
      }
    }

    return buckets
  }

  const aggregateExpenseByCategory = (start: Date, end: Date): CategoryBreakdownEntry[] => {
    const expenses = getTransactionsByDateRange(start, end).filter(t => t.type === 'expense')
    const totalsMap = new Map<string | null, number>()

    for (const transaction of expenses) {
      const key = transaction.category ?? null
      totalsMap.set(key, (totalsMap.get(key) ?? 0) + transaction.amount)
    }

    const sorted = Array.from(totalsMap.entries())
      .map(([categoryId, total]) => ({ categoryId, total }))
      .sort((a, b) => b.total - a.total)

    const maxSlices = 15
    if (sorted.length <= maxSlices) {
      return sorted
    }

    const head = sorted.slice(0, maxSlices - 1)
    const tail = sorted.slice(maxSlices - 1)
    const othersTotal = tail.reduce((sum, entry) => sum + entry.total, 0)

    return [
      ...head,
      {
        categoryId: 'others',
        total: othersTotal,
        isOthers: true,
        members: tail,
      },
    ]
  }

  // Getters
  const sortedTransactions = computed(() =>
    [...transactions.value].sort((a, b) => b.date.getTime() - a.date.getTime())
  )

  const totalIncome = computed(() => 
    transactions.value
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0)
  )

  const totalExpense = computed(() => 
    transactions.value
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0)
  )

  const balance = computed(() => totalIncome.value - totalExpense.value)

  const getTransactionsByDateRange = (start: Date, end: Date) =>
    transactions.value.filter(t => t.date >= start && t.date <= end)

  const getTotalIncome = (start: Date, end: Date) => {
    return getTransactionsByDateRange(start, end)
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0)
  }

  const getTotalExpense = (start: Date, end: Date) => {
    return getTransactionsByDateRange(start, end)
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0)
  }

  const getDailyTotals = (start: Date, end: Date) => {
    const days = eachDayOfInterval({ start: startOfDay(start), end: endOfDay(end) })
    return days.map(day => {
      const dayTransactions = transactions.value.filter(t => {
        return startOfDay(t.date).getTime() === startOfDay(day).getTime()
      })
      return {
        date: day,
        income: dayTransactions
          .filter(t => t.type === 'income')
          .reduce((sum, t) => sum + t.amount, 0),
        expense: dayTransactions
          .filter(t => t.type === 'expense')
          .reduce((sum, t) => sum + t.amount, 0),
      }
    })
  }

  const getIncomeByDate = (start: Date, end: Date, granularity: ChartGranularity) => {
    return aggregateTransactionsByBucket('income', start, end, granularity)
  }

  const getExpenseByDate = (start: Date, end: Date, granularity: ChartGranularity) => {
    return aggregateTransactionsByBucket('expense', start, end, granularity)
  }

  const getExpenseByCategory = (start: Date, end: Date) => {
    return aggregateExpenseByCategory(start, end)
  }

  // Actions
  const fetchTransactions = async () => {
    if (!user.value) return

    loading.value = true
    error.value = null

    try {
      const { data, error: fetchError } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', user.value.id)
        .order('date', { ascending: false })

      if (fetchError) throw fetchError

      transactions.value = (data || []).map(mapRecordToTransaction)
      ensureSubscription()
    } catch (e: any) {
      error.value = e.message
      console.error('Error fetching transactions:', e)
    } finally {
      loading.value = false
    }
  }

  const ensureSubscription = () => {
    if (subscription.value || !user.value) return

    const channel = supabase
      .channel('transactions-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'transactions', filter: `user_id=eq.${user.value.id}` },
        payload => {
          switch (payload.eventType) {
            case 'INSERT': {
              const exists = transactions.value.some(t => t.id === payload.new.id)
              if (!exists) {
                transactions.value.unshift(mapRecordToTransaction(payload.new))
              }
              break
            }
            case 'UPDATE': {
              const index = transactions.value.findIndex(t => t.id === payload.new.id)
              if (index !== -1) {
                transactions.value[index] = mapRecordToTransaction(payload.new)
              }
              break
            }
            case 'DELETE':
              transactions.value = transactions.value.filter(t => t.id !== payload.old.id)
              break
          }
        }
      )
      .subscribe(status => {
        if (status === 'SUBSCRIBED') {
          realtimeDisconnected.value = false
        } else if (['TIMED_OUT', 'CHANNEL_ERROR', 'CLOSED'].includes(status)) {
          realtimeDisconnected.value = true
          subscription.value = null
        }
      })

    subscription.value = channel
  }

  const disposeSubscription = () => {
    if (subscription.value) {
      supabase.removeChannel(subscription.value as RealtimeChannel)
      subscription.value = null
    }
    realtimeDisconnected.value = false
  }

  watch(
    () => user.value?.id,
    id => {
      if (id) {
        ensureSubscription()
      } else {
        disposeSubscription()
      }
    },
    { immediate: true }
  )

  const addTransaction = async (input: TransactionInput) => {
    if (!user.value) return

    loading.value = true
    error.value = null

    try {
      const { data, error: insertError } = await supabase
        .from('transactions')
        .insert({
          user_id: user.value.id,
          date: input.date.toISOString(),
          type: input.type,
          amount: input.amount,
          category_id: input.category,
          description: input.description || null,
          tags: input.tags && input.tags.length ? input.tags : null,
        })
        .select()
        .single()

      if (insertError) throw insertError

      const newTransaction = mapRecordToTransaction(data)

      transactions.value.unshift(newTransaction)
      return newTransaction
    } catch (e: any) {
      error.value = e.message
      console.error('Error adding transaction:', e)
      throw e
    } finally {
      loading.value = false
    }
  }

  const updateTransaction = async (id: string, updates: Partial<TransactionInput>) => {
    if (!user.value) return

    loading.value = true
    error.value = null

    try {
      const updateData: any = {}
      if (updates.date) updateData.date = updates.date.toISOString()
      if (updates.type) updateData.type = updates.type
      if (updates.amount !== undefined) updateData.amount = updates.amount
      if (updates.category) updateData.category_id = updates.category
      if (updates.description !== undefined) updateData.description = updates.description
      if (updates.tags !== undefined) updateData.tags = updates.tags

      const { data, error: updateError } = await supabase
        .from('transactions')
        .update(updateData)
        .eq('id', id)
        .eq('user_id', user.value.id)
        .select()
        .single()

      if (updateError) throw updateError

      const index = transactions.value.findIndex(t => t.id === id)
      if (index !== -1) {
        transactions.value[index] = mapRecordToTransaction(data)
      }

      return data
    } catch (e: any) {
      error.value = e.message
      console.error('Error updating transaction:', e)
      throw e
    } finally {
      loading.value = false
    }
  }

  const deleteTransaction = async (id: string) => {
    if (!user.value) return

    loading.value = true
    error.value = null

    try {
      const { error: deleteError } = await supabase
        .from('transactions')
        .delete()
        .eq('id', id)
        .eq('user_id', user.value.id)

      if (deleteError) throw deleteError

      transactions.value = transactions.value.filter(t => t.id !== id)
    } catch (e: any) {
      error.value = e.message
      console.error('Error deleting transaction:', e)
      throw e
    } finally {
      loading.value = false
    }
  }

  const restoreTransaction = async (transaction: Transaction) => {
    if (!user.value) return

    loading.value = true
    error.value = null

    try {
      const payload = {
        id: transaction.id,
        user_id: user.value.id,
        date: transaction.date.toISOString(),
        type: transaction.type,
        amount: transaction.amount,
        category_id: transaction.category,
        description: transaction.description || null,
        tags: transaction.tags && transaction.tags.length ? transaction.tags : null,
      }

      const { data, error: restoreError } = await supabase
        .from('transactions')
        .insert(payload)
        .select()
        .single()

      if (restoreError) throw restoreError

      const restoredTransaction = mapRecordToTransaction(data)
      transactions.value.unshift(restoredTransaction)
      return restoredTransaction
    } catch (e: any) {
      error.value = e.message
      console.error('Error restoring transaction:', e)
      throw e
    } finally {
      loading.value = false
    }
  }

  return {
    // State
    transactions,
    loading,
    error,
    subscription,
    realtimeDisconnected,
    // Getters
    sortedTransactions,
    totalIncome,
    totalExpense,
    balance,
    getTransactionsByDateRange,
    getTotalIncome,
    getTotalExpense,
    getDailyTotals,
    getIncomeByDate,
    getExpenseByDate,
    getExpenseByCategory,
    // Actions
    fetchTransactions,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    restoreTransaction,
    ensureSubscription,
    disposeSubscription,
  }
})
