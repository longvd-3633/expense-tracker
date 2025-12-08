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

      const { data, error: fetchError } = await supabase
        .from('categories')
        .select('*')
        .eq('is_default', true)  // Only fetch default categories for now (US6 not implemented yet)
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

      // Remove duplicates by name and type (in case migration ran multiple times)
      const seenKey = new Map<string, typeof mapped[0]>()
      mapped.forEach(c => {
        const key = `${c.name.toLowerCase()}-${c.type}`
        if (!seenKey.has(key)) {
          seenKey.set(key, c)
        }
      })
      
      categories.value = Array.from(seenKey.values())
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
