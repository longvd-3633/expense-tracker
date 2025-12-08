export default defineNuxtRouteMiddleware((to) => {
  const user = useSupabaseUser()

  // List of public routes that don't require authentication
  const publicRoutes = ['/login', '/register', '/forgot-password', '/reset-password', '/welcome', '/auth/callback', '/debug-auth']
  
  // Check if the route is public
  const isPublicRoute = publicRoutes.includes(to.path)

  console.log('[Auth Middleware]', {
    path: to.path,
    isPublic: isPublicRoute,
    hasUser: !!user.value,
    userEmail: user.value?.email
  })

  // If user is not authenticated and trying to access protected route
  if (!user.value && !isPublicRoute) {
    console.log('[Auth Middleware] Redirecting to login - no user')
    // Preserve the intended destination for redirect after login
    return navigateTo({
      path: '/login',
      query: { redirect: to.fullPath }
    })
  }

  // If user is authenticated and trying to access auth pages (but not welcome), redirect to home
  if (user.value && isPublicRoute && to.path !== '/welcome' && to.path !== '/debug-auth') {
    console.log('[Auth Middleware] User authenticated, redirecting away from auth page')
    return navigateTo('/')
  }
})
