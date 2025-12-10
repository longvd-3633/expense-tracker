<script setup lang="ts">
const supabase = useSupabaseClient()
const user = useSupabaseUser()
const router = useRouter()
const route = useRoute()

const isMenuOpen = ref(false)

const handleLogout = async () => {
  await supabase.auth.signOut()
  router.push('/login')
}

const toggleMenu = () => {
  isMenuOpen.value = !isMenuOpen.value
}

// Close menu when route changes
watch(
  () => route.path,
  () => {
    isMenuOpen.value = false
  }
)

// Helper to check if route is active
const isActiveRoute = (item: { to: string; exact?: boolean; matchPath?: string }) => {
  const pathToMatch = item.matchPath || item.to
  return pathToMatch === route.path || (!item.exact && route.path.startsWith(pathToMatch) && pathToMatch !== '/')
}

const navItems = [
  { to: '/?explicit=true', label: 'Dashboard', exact: true, matchPath: '/' },
  { to: '/transactions', label: 'Giao dịch' },
  { to: '/categories', label: 'Danh mục' },
  { to: '/recurring', label: 'Định kỳ' },
  { to: '/settings', label: 'Cài đặt' },
]
</script>

<template>
  <div class="min-h-screen bg-slate-50 dark:bg-zinc-950">
    <!-- Header -->
    <header
      class="sticky top-0 z-40 border-b border-slate-200 bg-white/80 backdrop-blur-lg dark:border-zinc-800 dark:bg-zinc-900/80">
      <nav class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div class="flex h-16 items-center justify-between">
          <!-- Logo -->
          <div class="flex items-center gap-8">
            <NuxtLink to="/" class="flex items-center gap-2.5">
              <div
                class="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 shadow-md shadow-blue-500/20">
                <svg class="h-5 w-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round"
                    d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <span class="text-lg font-bold text-slate-900 dark:text-white">Expense Tracker</span>
            </NuxtLink>

            <!-- Desktop Navigation -->
            <div class="hidden items-center gap-1 md:flex">
              <NuxtLink v-for="item in navItems" :key="item.to" :to="item.to"
                class="group relative rounded-lg px-3 py-2 text-sm font-medium transition-all" :class="isActiveRoute(item)
                  ? 'text-blue-600 dark:text-blue-400'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-zinc-400 dark:hover:text-white dark:hover:bg-zinc-800'
                  ">
                {{ item.label }}
                <span v-if="isActiveRoute(item)"
                  class="absolute inset-x-3 -bottom-[17px] h-0.5 rounded-full bg-blue-600 dark:bg-blue-400" />
              </NuxtLink>
            </div>
          </div>

          <!-- Right Section -->
          <div class="flex items-center gap-3">
            <!-- User Menu (Desktop) -->
            <div class="hidden items-center gap-3 md:flex">
              <div class="flex items-center gap-2 rounded-full bg-slate-100 py-1.5 pl-1.5 pr-4 dark:bg-zinc-800">
                <div
                  class="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 text-xs font-semibold text-white">
                  {{ user?.email?.charAt(0).toUpperCase() }}
                </div>
                <span class="text-sm font-medium text-slate-700 dark:text-zinc-300">
                  {{ user?.email?.split('@')[0] }}
                </span>
              </div>
              <button
                class="rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition-all hover:bg-red-50 hover:text-red-600 dark:text-zinc-400 dark:hover:bg-red-950 dark:hover:text-red-400"
                @click="handleLogout">
                Đăng xuất
              </button>
            </div>

            <!-- Mobile Menu Button -->
            <button
              class="flex h-10 w-10 items-center justify-center rounded-lg text-slate-600 transition-all hover:bg-slate-100 dark:text-zinc-400 dark:hover:bg-zinc-800 md:hidden"
              @click="toggleMenu">
              <svg v-if="!isMenuOpen" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"
                stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
              <svg v-else class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <!-- Mobile Menu -->
        <Transition enter-active-class="transition duration-200 ease-out" enter-from-class="opacity-0 -translate-y-2"
          enter-to-class="opacity-100 translate-y-0" leave-active-class="transition duration-150 ease-in"
          leave-from-class="opacity-100 translate-y-0" leave-to-class="opacity-0 -translate-y-2">
          <div v-if="isMenuOpen" class="border-t border-slate-200 py-4 dark:border-zinc-800 md:hidden">
            <div class="space-y-1">
              <NuxtLink v-for="item in navItems" :key="item.to" :to="item.to"
                class="block rounded-lg px-3 py-2.5 text-base font-medium transition-all" :class="isActiveRoute(item)
                  ? 'bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-400'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-white'
                  ">
                {{ item.label }}
              </NuxtLink>
            </div>

            <div class="mt-4 border-t border-slate-200 pt-4 dark:border-zinc-800">
              <div class="mb-3 flex items-center gap-3 px-3">
                <div
                  class="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 text-sm font-semibold text-white">
                  {{ user?.email?.charAt(0).toUpperCase() }}
                </div>
                <div>
                  <p class="text-sm font-medium text-slate-900 dark:text-white">{{ user?.email?.split('@')[0] }}</p>
                  <p class="text-xs text-slate-500 dark:text-zinc-500">{{ user?.email }}</p>
                </div>
              </div>
              <button
                class="w-full rounded-lg px-3 py-2.5 text-left text-base font-medium text-red-600 transition-all hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950"
                @click="handleLogout">
                Đăng xuất
              </button>
            </div>
          </div>
        </Transition>
      </nav>
    </header>

    <!-- Main Content -->
    <main class="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <slot />
    </main>
  </div>
</template>
