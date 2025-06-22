<script setup>
import AppLayout from '@/components/layout/AppLayout.vue'
</script>

<template>
  <AppLayout>
    <div class="min-h-screen flex items-center justify-center bg-gray-100">
      <div class="text-center">
        <div class="mb-8">
          <h1 class="text-9xl font-bold text-gray-300">403</h1>
        </div>
        <h2 class="text-2xl md:text-3xl font-semibold text-gray-800 mb-4">
          Access Forbidden
        </h2>
        <p class="text-gray-600 mb-8 max-w-md mx-auto">
          You don't have permission to access this resource. Please contact your administrator if you believe this is an error.
        </p>
        <router-link 
          to="/" 
          class="bg-blue-600 text-white hover:bg-blue-700 font-semibold py-3 px-8 rounded-lg transition-colors duration-200 inline-block"
        >
          Go Back Home
        </router-link>
      </div>
    </div>
  </AppLayout>
</template>

<style scoped>
/* Custom styles if needed */
</style> 