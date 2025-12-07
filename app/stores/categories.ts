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

  const getCategoryById = (id: string) => {
    return categories.value.find(c => c.id === id)
  }

  // Actions
  const fetchCategories = async () => {
    if (!user.value) return

    loading.value = true
    error.value = null

    try {
      const { data, error: fetchError } = await supabase
        .from('categories')
        .select('*')
        .or(`user_id.eq.${user.value.id},is_default.eq.true`)
        .order('name')

      if (fetchError) throw fetchError

      categories.value = (data || []).map(c => ({
        id: c.id,
        userId: c.user_id,
        name: c.name,
        type: c.type as 'income' | 'expense',
        color: c.color,
        icon: c.icon,
        isDefault: c.is_default,
      }))
    } catch (e: any) {
      error.value = e.message
      console.error('Error fetching categories:', e)
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
  }
})
