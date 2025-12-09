<script setup lang="ts">
const supabase = useSupabaseClient()
const user = useSupabaseUser()
const router = useRouter()

const isMenuOpen = ref(false)

const handleLogout = async () => {
  await supabase.auth.signOut()
  router.push('/login')
}

const toggleMenu = () => {
  isMenuOpen.value = !isMenuOpen.value
}
</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Header -->
    <header class="bg-white shadow-sm sticky top-0 z-40">
      <nav class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between h-16">
          <!-- Logo and Desktop Nav -->
          <div class="flex">
            <div class="flex-shrink-0 flex items-center">
              <NuxtLink to="/" class="text-xl font-bold text-blue-600">
                💰 Expense Tracker
              </NuxtLink>
            </div>
            <div class="hidden sm:ml-6 sm:flex sm:space-x-8">
              <NuxtLink to="/"
                class="inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors"
                active-class="border-blue-500 text-gray-900" exact-active-class="border-blue-500 text-gray-900"
                inactive-class="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24"
                  stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                Dashboard
              </NuxtLink>
              <NuxtLink to="/transactions"
                class="inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors"
                active-class="border-blue-500 text-gray-900"
                inactive-class="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24"
                  stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                Giao dịch
              </NuxtLink>
              <NuxtLink to="/categories"
                class="inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors"
                active-class="border-blue-500 text-gray-900"
                inactive-class="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24"
                  stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                </svg>
                Danh mục
              </NuxtLink>
              <NuxtLink to="/settings"
                class="inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors"
                active-class="border-blue-500 text-gray-900"
                inactive-class="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24"
                  stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Cài đặt
              </NuxtLink>
            </div>
          </div>

          <!-- User Menu and Mobile Menu Button -->
          <div class="flex items-center">
            <!-- User Info (Desktop) -->
            <div class="hidden sm:flex items-center space-x-3">
              <span class="text-sm text-gray-700">
                {{ user?.email }}
              </span>
              <button class="px-3 py-1.5 text-sm font-medium text-gray-700 hover:text-red-600 transition-colors"
                @click="handleLogout">
                Đăng xuất
              </button>
            </div>

            <!-- Mobile Menu Button -->
            <button
              class="sm:hidden inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
              @click="toggleMenu">
              <svg v-if="!isMenuOpen" xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24"
                stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
              <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24"
                stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <!-- Mobile Menu -->
        <Transition enter-active-class="transition duration-200 ease-out" enter-from-class="opacity-0 -translate-y-1"
          enter-to-class="opacity-100 translate-y-0" leave-active-class="transition duration-150 ease-in"
          leave-from-class="opacity-100 translate-y-0" leave-to-class="opacity-0 -translate-y-1">
          <div v-if="isMenuOpen" class="sm:hidden pb-3 pt-2">
            <div class="space-y-1">
              <NuxtLink to="/" class="block pl-3 pr-4 py-2 border-l-4 text-base font-medium"
                active-class="border-blue-500 bg-blue-50 text-blue-700"
                exact-active-class="border-blue-500 bg-blue-50 text-blue-700"
                inactive-class="border-transparent text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800"
                @click="toggleMenu">
                Dashboard
              </NuxtLink>
              <NuxtLink to="/transactions" class="block pl-3 pr-4 py-2 border-l-4 text-base font-medium"
                active-class="border-blue-500 bg-blue-50 text-blue-700"
                inactive-class="border-transparent text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800"
                @click="toggleMenu">
                Giao dịch
              </NuxtLink>
              <NuxtLink to="/categories" class="block pl-3 pr-4 py-2 border-l-4 text-base font-medium"
                active-class="border-blue-500 bg-blue-50 text-blue-700"
                inactive-class="border-transparent text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800"
                @click="toggleMenu">
                Danh mục
              </NuxtLink>
              <NuxtLink to="/settings" class="block pl-3 pr-4 py-2 border-l-4 text-base font-medium"
                active-class="border-blue-500 bg-blue-50 text-blue-700"
                inactive-class="border-transparent text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800"
                @click="toggleMenu">
                Cài đặt
              </NuxtLink>
            </div>
            <div class="pt-4 pb-3 border-t border-gray-200">
              <div class="px-4">
                <div class="text-base font-medium text-gray-800">
                  {{ user?.email }}
                </div>
              </div>
              <div class="mt-3 px-2">
                <button
                  class="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-gray-600 hover:bg-gray-50 hover:text-red-600"
                  @click="handleLogout">
                  Đăng xuất
                </button>
              </div>
            </div>
          </div>
        </Transition>
      </nav>
    </header>

    <!-- Main Content -->
    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <slot />
    </main>
  </div>
</template>
