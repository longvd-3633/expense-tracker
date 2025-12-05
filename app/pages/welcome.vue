<template>
  <div class="min-h-screen bg-gray-50">
    <header class="bg-white shadow">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div class="flex items-center justify-between">
          <h1 class="text-3xl font-bold text-primary">Expense Tracker</h1>
          <nav class="flex gap-4">
            <NuxtLink to="/login" class="text-primary hover:text-blue-700 font-medium px-4 py-2">
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
        <h2 class="text-4xl font-bold text-gray-900 mb-4">Track Your Finances with Ease</h2>
        <p class="text-xl text-gray-600 mb-8">Manage income, expenses, and visualize your financial health</p>
      </div>

      <div class="grid md:grid-cols-3 gap-8 mb-12">
        <div class="bg-white rounded-lg shadow-lg p-6">
          <div class="text-4xl mb-4">💰</div>
          <h3 class="text-xl font-semibold mb-2">Transaction Management</h3>
          <p class="text-gray-600">Easily add, edit, and delete income and expense transactions</p>
        </div>

        <div class="bg-white rounded-lg shadow-lg p-6">
          <div class="text-4xl mb-4">📊</div>
          <h3 class="text-xl font-semibold mb-2">Visual Dashboard</h3>
          <p class="text-gray-600">View summaries and charts to understand your spending patterns</p>
        </div>

        <div class="bg-white rounded-lg shadow-lg p-6">
          <div class="text-4xl mb-4">🔒</div>
          <h3 class="text-xl font-semibold mb-2">Secure & Private</h3>
          <p class="text-gray-600">Your data is encrypted and protected with Supabase authentication</p>
        </div>
      </div>

      <div class="bg-white rounded-lg shadow-lg p-8">
        <h3 class="text-2xl font-bold mb-6 text-center">Getting Started</h3>
        <div class="space-y-4 max-w-2xl mx-auto">
          <div class="flex items-start">
            <span class="flex-shrink-0 w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center mr-3 font-bold">1</span>
            <div>
              <strong class="block mb-1">Create an account</strong>
              <p class="text-gray-600">Register with your email and password</p>
            </div>
          </div>
          <div class="flex items-start">
            <span class="flex-shrink-0 w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center mr-3 font-bold">2</span>
            <div>
              <strong class="block mb-1">Setup Supabase</strong>
              <p class="text-gray-600">Follow the README.md instructions to configure your database</p>
            </div>
          </div>
          <div class="flex items-start">
            <span class="flex-shrink-0 w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center mr-3 font-bold">3</span>
            <div>
              <strong class="block mb-1">Start tracking</strong>
              <p class="text-gray-600">Add your transactions and view your financial dashboard</p>
            </div>
          </div>
        </div>
        
        <div class="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p class="text-sm text-yellow-800">
            <strong>⚠️ Note:</strong> Supabase setup is required for full functionality. 
            Check the <code class="bg-yellow-100 px-2 py-1 rounded">README.md</code> for detailed instructions.
          </p>
        </div>

        <div class="mt-6 text-center">
          <NuxtLink to="/register" class="inline-block bg-primary text-white px-8 py-3 rounded-lg hover:bg-blue-700 font-medium text-lg">
            Get Started →
          </NuxtLink>
        </div>
      </div>
    </main>

    <footer class="bg-white border-t mt-12">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 text-center text-gray-600">
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
