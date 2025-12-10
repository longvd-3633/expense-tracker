<template>
  <div class="min-h-screen bg-slate-50 dark:bg-zinc-950">
    <header class="bg-white dark:bg-zinc-900 shadow dark:shadow-zinc-800/50">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div class="flex items-center justify-between">
          <h1 class="text-3xl font-bold text-primary">Expense Tracker</h1>
          <nav class="flex gap-4">
            <NuxtLink to="/login"
              class="text-primary hover:text-blue-700 dark:hover:text-blue-400 font-medium px-4 py-2">
              Login
            </NuxtLink>
            <NuxtLink to="/register" class="bg-primary text-white px-4 py-2 rounded-lg hover:bg-blue-700">
              Register
            </NuxtLink>
          </nav>
        </div>
      </div>
    </header>

    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div class="text-center mb-12">
        <h2 class="text-4xl font-bold text-slate-900 dark:text-white mb-4">Track Your Finances with Ease</h2>
        <p class="text-xl text-slate-600 dark:text-zinc-400 mb-8">Manage income, expenses, and visualize your financial
          health</p>
      </div>

      <div class="grid md:grid-cols-3 gap-8 mb-12">
        <div class="bg-white dark:bg-zinc-900 rounded-lg shadow-lg dark:shadow-zinc-800/50 p-6">
          <div class="text-4xl mb-4">💰</div>
          <h3 class="text-xl font-semibold text-slate-900 dark:text-white mb-2">Transaction Management</h3>
          <p class="text-slate-600 dark:text-zinc-400">Easily add, edit, and delete income and expense transactions</p>
        </div>

        <div class="bg-white dark:bg-zinc-900 rounded-lg shadow-lg dark:shadow-zinc-800/50 p-6">
          <div class="text-4xl mb-4">📊</div>
          <h3 class="text-xl font-semibold text-slate-900 dark:text-white mb-2">Visual Dashboard</h3>
          <p class="text-slate-600 dark:text-zinc-400">View summaries and charts to understand your spending patterns
          </p>
        </div>

        <div class="bg-white dark:bg-zinc-900 rounded-lg shadow-lg dark:shadow-zinc-800/50 p-6">
          <div class="text-4xl mb-4">🔒</div>
          <h3 class="text-xl font-semibold text-slate-900 dark:text-white mb-2">Secure & Private</h3>
          <p class="text-slate-600 dark:text-zinc-400">Your data is encrypted and protected with Supabase authentication
          </p>
        </div>
      </div>

      <div class="bg-white dark:bg-zinc-900 rounded-lg shadow-lg dark:shadow-zinc-800/50 p-8">
        <h3 class="text-2xl font-bold text-slate-900 dark:text-white mb-6 text-center">Getting Started</h3>
        <div class="space-y-4 max-w-2xl mx-auto">
          <div class="flex items-start">
            <span
              class="flex-shrink-0 w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center mr-3 font-bold">1</span>
            <div>
              <strong class="block mb-1 text-slate-900 dark:text-white">Create an account</strong>
              <p class="text-slate-600 dark:text-zinc-400">Register with your email and password</p>
            </div>
          </div>
          <div class="flex items-start">
            <span
              class="flex-shrink-0 w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center mr-3 font-bold">2</span>
            <div>
              <strong class="block mb-1 text-slate-900 dark:text-white">Setup Supabase</strong>
              <p class="text-slate-600 dark:text-zinc-400">Follow the README.md instructions to configure your database
              </p>
            </div>
          </div>
          <div class="flex items-start">
            <span
              class="flex-shrink-0 w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center mr-3 font-bold">3</span>
            <div>
              <strong class="block mb-1 text-slate-900 dark:text-white">Start tracking</strong>
              <p class="text-slate-600 dark:text-zinc-400">Add your transactions and view your financial dashboard</p>
            </div>
          </div>
        </div>

        <div
          class="mt-8 p-4 bg-yellow-50 dark:bg-yellow-950/50 border border-yellow-200 dark:border-yellow-800 rounded-lg">
          <p class="text-sm text-yellow-800 dark:text-yellow-200">
            <strong>⚠️ Note:</strong> Supabase setup is required for full functionality.
            Check the <code class="bg-yellow-100 dark:bg-yellow-900/50 px-2 py-1 rounded">README.md</code> for detailed
            instructions.
          </p>
        </div>

        <div class="mt-6 text-center">
          <NuxtLink to="/register"
            class="inline-block bg-primary text-white px-8 py-3 rounded-lg hover:bg-blue-700 font-medium text-lg">
            Get Started →
          </NuxtLink>
        </div>
      </div>
    </main>

    <footer class="bg-white dark:bg-zinc-900 border-t dark:border-zinc-800 mt-12">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 text-center text-slate-600 dark:text-zinc-400">
        <p>Built with ❤️ using Nuxt 3, TypeScript, TailwindCSS, and Supabase</p>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: false,
})
</script>
