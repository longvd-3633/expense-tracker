export default defineNuxtRouteMiddleware((to) => {
  const user = useSupabaseUser()

  // List of public routes that don't require authentication
  const publicRoutes = ['/login', '/register', '/forgot-password', '/reset-password', '/welcome', '/auth/callback']
  
  // Check if the route is public
  const isPublicRoute = publicRoutes.includes(to.path)

  // If user is not authenticated and trying to access protected route
  if (!user.value && !isPublicRoute) {
    // Preserve the intended destination for redirect after login
    return navigateTo({
      path: '/login',
      query: { redirect: to.fullPath }
    })
  }

  // If user is authenticated and trying to access auth pages (but not welcome), redirect to home
  if (user.value && isPublicRoute && to.path !== '/welcome') {
    return navigateTo('/')
  }
})
