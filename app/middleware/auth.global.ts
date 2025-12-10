export default defineNuxtRouteMiddleware(async (to) => {
  // Skip middleware on server side for static generation
  if (import.meta.server) return

  const user = useSupabaseUser()
  const settingsStore = useSettingsStore()

  // List of public routes that don't require authentication
  const publicRoutes = ['/login', '/register', '/forgot-password', '/reset-password', '/welcome', '/auth/callback', '/debug-auth']
  
  // Check if the route is public (normalize path by removing trailing slash)
  const normalizedPath = to.path.replace(/\/$/, '') || '/'
  const isPublicRoute = publicRoutes.some(route => normalizedPath === route || normalizedPath.startsWith('/auth/'))

  // Don't log user object directly to avoid readonly warnings
  console.log('[Auth Middleware]', {
    path: to.path,
    normalizedPath,
    isPublic: isPublicRoute,
    hasUser: !!user.value,
    userEmail: user.value?.email || 'none'
  })

  // If user is not authenticated and trying to access protected route
  if (!user.value && !isPublicRoute) {
    console.log('[Auth Middleware] Redirecting to login - no user')
    
    // Prevent redirect loop - don't add redirect query if already going to login
    // Also don't preserve redirect if it's already a login path
    const redirectPath = to.fullPath
    if (redirectPath.includes('/login')) {
      return navigateTo('/login')
    }
    
    return navigateTo({
      path: '/login',
      query: { redirect: redirectPath }
    })
  }

  // If user is authenticated and trying to access auth pages (but not welcome), redirect to home
  if (user.value && isPublicRoute && normalizedPath !== '/welcome' && normalizedPath !== '/debug-auth') {
    console.log('[Auth Middleware] User authenticated, redirecting away from auth page')
    
    // Load settings if not already loaded
    if (!settingsStore.settings) {
      await settingsStore.fetchSettings()
    }
    
    // Redirect to user's preferred default view
    const defaultPath = settingsStore.settings?.defaultView === 'dashboard' ? '/' : '/transactions'
    return navigateTo(defaultPath)
  }
})
