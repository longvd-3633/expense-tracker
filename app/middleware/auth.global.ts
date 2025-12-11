export default defineNuxtRouteMiddleware(async (to) => {
  // Skip middleware on server side for static generation
  if (import.meta.server) return

  const supabase = useSupabaseClient()
  const settingsStore = useSettingsStore()

  // List of public routes that don't require authentication
  const publicRoutes = ['/login', '/register', '/forgot-password', '/reset-password', '/welcome', '/auth/callback', '/debug-auth']
  
  // Check if the route is public (normalize path by removing trailing slash)
  const normalizedPath = to.path.replace(/\/$/, '') || '/'
  const isPublicRoute = publicRoutes.some(route => normalizedPath === route || normalizedPath.startsWith('/auth/'))

  // Get session directly from Supabase client (more reliable than useSupabaseUser on initial load)
  const { data: { session } } = await supabase.auth.getSession()
  const user = session?.user

  // If user is not authenticated and trying to access protected route
  if (!user && !isPublicRoute) {
    
    // Prevent redirect loop - don't add redirect query if already going to login
    const redirectPath = to.fullPath
    if (redirectPath.includes('/login')) {
      return navigateTo('/login')
    }
    
    return navigateTo({
      path: '/login',
      query: { redirect: redirectPath }
    })
  }

  // If user is authenticated and trying to access auth pages (but not welcome/debug/callback), redirect to home
  if (user && isPublicRoute && normalizedPath !== '/welcome' && normalizedPath !== '/debug-auth' && !normalizedPath.startsWith('/auth/')) {
    // Load settings if not already loaded
    if (!settingsStore.settings) {
      await settingsStore.fetchSettings()
    }
    
    // Redirect to user's preferred default view
    const defaultPath = settingsStore.settings?.defaultView === 'dashboard' ? '/' : '/transactions'
    return navigateTo(defaultPath)
  }
})
