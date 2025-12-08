export const useAuth = () => {
  const supabase = useSupabaseClient<any>()
  const user = useSupabaseUser()

  // Login with email and password
  const login = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) throw error

    return data
  }

  // Register new user
  const register = async (email: string, password: string) => {
    const config = useRuntimeConfig()
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${config.public.siteUrl || window.location.origin}/auth/callback`,
      },
    })

    if (error) throw error

    // Initialize user settings and categories after successful signup
    if (data.user) {
      try {
        await supabase.rpc('initialize_new_user', { user_uuid: data.user.id })
      } catch (initError) {
        // Log error but don't fail registration
        console.warn('Failed to initialize user settings:', initError)
      }
    }

    return data
  }

  // Logout
  const logout = async () => {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
    
    // Clear local state and redirect to login
    await navigateTo('/login')
  }

  // Send password reset email
  const resetPassword = async (email: string) => {
    const config = useRuntimeConfig()
    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${config.public.siteUrl || window.location.origin}/auth/callback`,
    })

    if (error) throw error
    return data
  }

  // Update password
  const updatePassword = async (newPassword: string) => {
    const { data, error } = await supabase.auth.updateUser({
      password: newPassword,
    })

    if (error) throw error
    return data
  }

  return {
    user,
    login,
    register,
    logout,
    resetPassword,
    updatePassword,
  }
}
