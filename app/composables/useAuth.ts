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
    
    // First, sign up the user
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${config.public.siteUrl || window.location.origin}/auth/callback`,
      },
    })

    if (error) throw error

    // If session was created (auto-login), sign out immediately
    // User should only login after confirming email
    if (data.session) {
      await supabase.auth.signOut()
    }

    // Initialize user settings and categories after successful signup
    // This will be executed even without session
    if (data.user) {
      try {
        await supabase.rpc('initialize_new_user', { user_uuid: data.user.id })
      } catch (initError) {
        // Silently ignore initialization errors
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
