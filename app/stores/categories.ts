import { defineStore } from 'pinia'
import type { Category } from '~/types/category'

export const useCategoriesStore = defineStore('categories', () => {
  const supabase = useSupabaseClient<any>()
  const user = useSupabaseUser()

  // State
  const categories = ref<Category[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  // Getters
  const incomeCategories = computed(() => 
    categories.value.filter(c => c.type === 'income')
  )

  const expenseCategories = computed(() => 
    categories.value.filter(c => c.type === 'expense')
  )

  const getCategoryById = (id?: string | null) => {
    if (!id) return undefined
    return categories.value.find(c => c.id === id)
  }

  // Actions
  const fetchCategories = async () => {
    loading.value = true
    error.value = null

    try {
      // Get current session to ensure we have the user
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session?.user?.id) {
        console.warn('Cannot fetch categories: user not authenticated')
        loading.value = false
        return
      }

      // Fetch both default categories and user's custom categories
      const { data, error: fetchError } = await supabase
        .from('categories')
        .select('*')
        .or(`is_default.eq.true,user_id.eq.${session.user.id}`)
        .order('name')

      if (fetchError) throw fetchError

      // Map categories and remove duplicates by ID (in case of duplicate inserts)
      const mapped = (data || []).map(c => ({
        id: c.id,
        userId: c.user_id,
        name: c.name,
        type: c.type as 'income' | 'expense',
        color: c.color,
        icon: c.icon,
        isDefault: c.is_default,
      }))

      // Remove duplicates by name and type, prioritizing default categories
      const seenKey = new Map<string, typeof mapped[0]>()
      mapped.forEach(c => {
        const key = `${c.name.toLowerCase()}-${c.type}`
        const existing = seenKey.get(key)
        
        // If no existing, add it
        if (!existing) {
          seenKey.set(key, c)
        } 
        // If existing is not default but current is default, replace with default
        else if (!existing.isDefault && c.isDefault) {
          seenKey.set(key, c)
        }
        // Otherwise keep existing
      })
      
      categories.value = Array.from(seenKey.values())
    } catch (e: any) {
      error.value = e.message
      console.error('Error fetching categories:', e)
    } finally {
      loading.value = false
    }
  }

  const createCategory = async (
    name: string,
    type: 'income' | 'expense',
    color: string,
    icon?: string
  ) => {
    if (!user.value) throw new Error('User not authenticated')

    try {
      loading.value = true
      error.value = null

      const { data, error: insertError } = await supabase
        .from('categories')
        .insert({
          user_id: user.value.id,
          name,
          type,
          color,
          icon,
          is_default: false,
        })
        .select()
        .single()

      if (insertError) throw insertError

      const newCategory: Category = {
        id: data.id,
        userId: data.user_id,
        name: data.name,
        type: data.type as 'income' | 'expense',
        color: data.color,
        icon: data.icon,
        isDefault: false,
      }

      categories.value.push(newCategory)
      return newCategory
    } catch (e: any) {
      error.value = e.message
      console.error('Error creating category:', e)
      throw e
    } finally {
      loading.value = false
    }
  }

  const updateCategory = async (
    id: string,
    updates: {
      name?: string
      type?: 'income' | 'expense'
      color?: string
      icon?: string
    }
  ) => {
    if (!user.value) throw new Error('User not authenticated')

    try {
      loading.value = true
      error.value = null

      const category = categories.value.find(c => c.id === id)
      if (!category) throw new Error('Category not found')
      if (category.isDefault) throw new Error('Cannot edit default categories')

      const { data, error: updateError } = await supabase
        .from('categories')
        .update(updates)
        .eq('id', id)
        .eq('user_id', user.value.id)
        .select()
        .single()

      if (updateError) throw updateError

      // Update local state
      const index = categories.value.findIndex(c => c.id === id)
      if (index !== -1) {
        categories.value[index] = {
          ...categories.value[index],
          ...updates,
        }
      }

      return data
    } catch (e: any) {
      error.value = e.message
      console.error('Error updating category:', e)
      throw e
    } finally {
      loading.value = false
    }
  }

  const deleteCategory = async (id: string) => {
    if (!user.value) throw new Error('User not authenticated')

    try {
      loading.value = true
      error.value = null

      const category = categories.value.find(c => c.id === id)
      if (!category) throw new Error('Category not found')
      if (category.isDefault) throw new Error('Cannot delete default categories')

      // Check if category is in use
      const transactionsStore = useTransactionsStore()
      const isInUse = transactionsStore.transactions.some(t => t.category === id)
      
      if (isInUse) {
        throw new Error('Cannot delete category that is in use by transactions')
      }

      const { error: deleteError } = await supabase
        .from('categories')
        .delete()
        .eq('id', id)
        .eq('user_id', user.value.id)

      if (deleteError) throw deleteError

      // Update local state
      categories.value = categories.value.filter(c => c.id !== id)
    } catch (e: any) {
      error.value = e.message
      console.error('Error deleting category:', e)
      throw e
    } finally {
      loading.value = false
    }
  }

  return {
    // State
    categories,
    loading,
    error,
    // Getters
    incomeCategories,
    expenseCategories,
    getCategoryById,
    // Actions
    fetchCategories,
    createCategory,
    updateCategory,
    deleteCategory,
  }
})
