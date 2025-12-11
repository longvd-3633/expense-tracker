import { defineStore } from 'pinia'
import type { Database } from '~/types/database.types'

export interface UserSettings {
  userId: string
  currency: 'VND' | 'USD'
  dateFormat: 'DD/MM/YYYY' | 'YYYY-MM-DD'
  numberFormat: '1.000.000' | '1,000,000'
  defaultView: 'dashboard' | 'transactions'
  theme: 'light' | 'dark' | 'system'
  createdAt: Date
  updatedAt: Date
}

export type Settings = Omit<UserSettings, 'userId' | 'createdAt' | 'updatedAt'>

const DEFAULT_SETTINGS: Settings = {
  currency: 'VND',
  dateFormat: 'DD/MM/YYYY',
  numberFormat: '1.000.000',
  defaultView: 'dashboard',
  theme: 'system',
}

export const useSettingsStore = defineStore('settings', () => {
  const supabase = useSupabaseClient<any>()

  const settings = ref<Settings>({ ...DEFAULT_SETTINGS })
  const loading = ref(false)
  const error = ref<string | null>(null)

  // Helper to get current user ID
  const getUserId = async (): Promise<string | null> => {
    const { data: { user } } = await supabase.auth.getUser()
    return user?.id || null
  }

  const fetchSettings = async () => {
    const userId = await getUserId()
    if (!userId) {
      settings.value = { ...DEFAULT_SETTINGS }
      return
    }

    try {
      loading.value = true
      error.value = null

      const { data, error: fetchError } = await supabase
        .from('user_settings')
        .select('*')
        .eq('user_id', userId)
        .single()

      if (fetchError) {
        if (fetchError.code === 'PGRST116') {
          // No settings found, create default
          await createDefaultSettings(userId)
        } else {
          throw fetchError
        }
      } else if (data) {
        settings.value = {
          currency: data.currency as Settings['currency'],
          dateFormat: data.date_format as Settings['dateFormat'],
          numberFormat: data.number_format as Settings['numberFormat'],
          defaultView: data.default_view as Settings['defaultView'],
          theme: data.theme as Settings['theme'],
        }
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to fetch settings'
      // Use defaults on error
      settings.value = { ...DEFAULT_SETTINGS }
    } finally {
      loading.value = false
    }
  }

  const createDefaultSettings = async (userId?: string) => {
    const uid = userId || await getUserId()
    if (!uid) return

    try {
      const insertData: Database['public']['Tables']['user_settings']['Insert'] = {
        user_id: uid,
        currency: DEFAULT_SETTINGS.currency,
        date_format: DEFAULT_SETTINGS.dateFormat,
        number_format: DEFAULT_SETTINGS.numberFormat,
        default_view: DEFAULT_SETTINGS.defaultView,
        theme: DEFAULT_SETTINGS.theme,
      }

      const { error: insertError } = await supabase
        .from('user_settings')
        .insert(insertData)

      if (insertError) throw insertError
      
      settings.value = { ...DEFAULT_SETTINGS }
    } catch (err) {
      // Silently ignore
    }
  }

  const updateSettings = async (updates: Partial<Settings>) => {
    const userId = await getUserId()
    
    if (!userId) {
      // Update local state only if not logged in
      settings.value = { ...settings.value, ...updates }
      return
    }

    try {
      loading.value = true
      error.value = null

      // Build update object with snake_case keys for database
      const dbUpdates: Record<string, any> = {
        updated_at: new Date().toISOString(),
      }
      if (updates.currency !== undefined) dbUpdates.currency = updates.currency
      if (updates.dateFormat !== undefined) dbUpdates.date_format = updates.dateFormat
      if (updates.numberFormat !== undefined) dbUpdates.number_format = updates.numberFormat
      if (updates.defaultView !== undefined) dbUpdates.default_view = updates.defaultView
      if (updates.theme !== undefined) dbUpdates.theme = updates.theme

      // Use update instead of upsert for existing records
      const { error: updateError } = await supabase
        .from('user_settings')
        .update(dbUpdates)
        .eq('user_id', userId)
        .select()

      if (updateError) throw updateError

      // Update local state
      settings.value = { ...settings.value, ...updates }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to update settings'
      throw err
    } finally {
      loading.value = false
    }
  }

  const resetSettings = async () => {
    await updateSettings({ ...DEFAULT_SETTINGS })
  }

  return {
    settings: readonly(settings),
    loading: readonly(loading),
    error: readonly(error),
    fetchSettings,
    updateSettings,
    resetSettings,
  }
})
