import { defineStore } from 'pinia'
import type { Transaction, TransactionInput } from '~/types/transaction'

export const useTransactionsStore = defineStore('transactions', () => {
  const supabase = useSupabaseClient()
  const user = useSupabaseUser()

  // State
  const transactions = ref<Transaction[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  // Getters
  const sortedTransactions = computed(() => 
    [...transactions.value].sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    )
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

  const getTransactionsByDateRange = (start: Date, end: Date) => {
    return transactions.value.filter(t => {
      const date = new Date(t.date)
      return date >= start && date <= end
    })
  }

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

      transactions.value = (data || []).map(t => ({
        id: t.id,
        userId: t.user_id,
        date: t.date,
        type: t.type,
        amount: t.amount,
        categoryId: t.category_id,
        description: t.description,
        tags: t.tags,
        createdAt: t.created_at,
        updatedAt: t.updated_at,
      }))
    } catch (e: any) {
      error.value = e.message
      console.error('Error fetching transactions:', e)
    } finally {
      loading.value = false
    }
  }

  const addTransaction = async (input: TransactionInput) => {
    if (!user.value) return

    loading.value = true
    error.value = null

    try {
      const { data, error: insertError } = await supabase
        .from('transactions')
        .insert({
          user_id: user.value.id,
          date: input.date,
          type: input.type,
          amount: input.amount,
          category_id: input.categoryId,
          description: input.description || null,
          tags: input.tags || null,
        })
        .select()
        .single()

      if (insertError) throw insertError

      const newTransaction: Transaction = {
        id: data.id,
        userId: data.user_id,
        date: data.date,
        type: data.type,
        amount: data.amount,
        categoryId: data.category_id,
        description: data.description,
        tags: data.tags,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
      }

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
      if (updates.date) updateData.date = updates.date
      if (updates.type) updateData.type = updates.type
      if (updates.amount !== undefined) updateData.amount = updates.amount
      if (updates.categoryId) updateData.category_id = updates.categoryId
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
        transactions.value[index] = {
          id: data.id,
          userId: data.user_id,
          date: data.date,
          type: data.type,
          amount: data.amount,
          categoryId: data.category_id,
          description: data.description,
          tags: data.tags,
          createdAt: data.created_at,
          updatedAt: data.updated_at,
        }
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

  return {
    // State
    transactions,
    loading,
    error,
    // Getters
    sortedTransactions,
    totalIncome,
    totalExpense,
    balance,
    getTransactionsByDateRange,
    getTotalIncome,
    getTotalExpense,
    // Actions
    fetchTransactions,
    addTransaction,
    updateTransaction,
    deleteTransaction,
  }
})
