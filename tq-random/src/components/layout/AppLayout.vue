<script setup>
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import { useAuthUserStore } from "@/stores/authUser";

const router = useRouter();
const authStore = useAuthUserStore();
const isMenuOpen = ref(false);
const isAuthenticated = ref(false);
const userData = ref(null);

const toggleMenu = () => {
  isMenuOpen.value = !isMenuOpen.value;
};

const navigateTo = (routeName) => {
  router.push({ name: routeName });
  isMenuOpen.value = false;
};

const handleLogout = async () => {
  const result = await authStore.logout();

  if (result.success) {
    isAuthenticated.value = false;
    userData.value = null;
    router.push("/");
  }
  isMenuOpen.value = false;
};

// Check authentication status on mount and watch for changes
onMounted(async () => {
  await checkAuthStatus();
});

// Function to check auth status
const checkAuthStatus = async () => {
  isAuthenticated.value = await authStore.isAuthenticated();
  if (isAuthenticated.value) {
    await authStore.getUserInformation();
    userData.value = authStore.userData;
  } else {
    userData.value = null;
  }
};

// Update auth status when route changes (for real-time updates)
router.afterEach(async () => {
  await checkAuthStatus();
});
</script>

<template>
  <div class="min-h-screen flex flex-col bg-gray-50">
    <!-- Navbar -->
    <nav class="bg-white shadow-lg">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center h-16">
          <!-- Logo/Brand -->
          <div class="flex-shrink-0 flex items-center">
            <h1 class="text-xl font-bold text-gray-800">TQ Random</h1>
          </div>

          <!-- Desktop Navigation -->
          <div class="hidden md:block">
            <div class="ml-10 flex items-baseline space-x-4">
              <button
                @click="navigateTo('home')"
                class="text-gray-800 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200"
              >
                Home
              </button>

              <!-- Authenticated Navigation -->
              <template v-if="isAuthenticated">
                <button
                  @click="navigateTo('dashboard')"
                  class="text-gray-800 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200"
                >
                  Dashboard
                </button>

                <!-- User Profile Dropdown -->
                <div class="relative">
                  <span class="text-gray-800 px-3 py-2 text-sm font-medium">
                    Welcome, {{ userData?.first_name || "User" }}
                  </span>
                </div>

                <button
                  @click="handleLogout"
                  class="bg-red-600 text-white hover:bg-red-700 px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200"
                >
                  Logout
                </button>
              </template>

              <!-- Unauthenticated Navigation -->
              <template v-else>
                <button
                  @click="navigateTo('login')"
                  class="text-gray-800 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200"
                >
                  Login
                </button>
                <button
                  @click="navigateTo('register')"
                  class="bg-blue-600 text-white hover:bg-blue-700 px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200"
                >
                  Get Started
                </button>
              </template>
            </div>
          </div>

          <!-- Mobile menu button -->
          <div class="md:hidden">
            <button
              @click="toggleMenu"
              class="text-gray-800 hover:text-gray-600 focus:outline-none focus:text-gray-600"
            >
              <svg
                class="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  v-if="!isMenuOpen"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M4 6h16M4 12h16M4 18h16"
                />
                <path
                  v-else
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>

        <!-- Mobile Navigation Menu -->
        <div v-show="isMenuOpen" class="md:hidden">
          <div
            class="px-2 pt-2 pb-3 space-y-1 sm:px-3 border-t border-gray-200"
          >
            <button
              @click="navigateTo('home')"
              class="text-gray-800 hover:text-blue-600 block px-3 py-2 rounded-md text-base font-medium w-full text-left transition-colors duration-200"
            >
              Home
            </button>

            <!-- Authenticated Mobile Navigation -->
            <template v-if="isAuthenticated">
              <button
                @click="navigateTo('dashboard')"
                class="text-gray-800 hover:text-blue-600 block px-3 py-2 rounded-md text-base font-medium w-full text-left transition-colors duration-200"
              >
                Dashboard
              </button>

              <div class="px-3 py-2 text-base font-medium text-gray-800">
                Welcome, {{ userData?.first_name || "User" }}
              </div>

              <button
                @click="handleLogout"
                class="bg-red-600 text-white hover:bg-red-700 block px-3 py-2 rounded-md text-base font-medium w-full text-left transition-colors duration-200"
              >
                Logout
              </button>
            </template>

            <!-- Unauthenticated Mobile Navigation -->
            <template v-else>
              <button
                @click="navigateTo('login')"
                class="text-gray-800 hover:text-blue-600 block px-3 py-2 rounded-md text-base font-medium w-full text-left transition-colors duration-200"
              >
                Login
              </button>
              <button
                @click="navigateTo('register')"
                class="bg-blue-600 text-white hover:bg-blue-700 block px-3 py-2 rounded-md text-base font-medium w-full text-left transition-colors duration-200"
              >
                Get Started
              </button>
            </template>
          </div>
        </div>
      </div>
    </nav>

    <!-- Main Content -->
    <main class="flex-1">
      <slot />
    </main>

    <!-- Footer -->
    <footer class="bg-gray-800 text-white">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div class="grid grid-cols-1 md:grid-cols-4 gap-8">
          <!-- Company Info -->
          <div class="md:col-span-2">
            <h3 class="text-lg font-semibold mb-4">TQ Random</h3>
            <p class="text-gray-300 mb-4">
              Your trusted randomization system for efficient and fair
              processes.
            </p>
            <div class="flex space-x-4">
              <a
                href="#"
                class="text-gray-300 hover:text-white transition-colors duration-200"
              >
                <svg class="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                  <path
                    d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"
                  />
                </svg>
              </a>
              <a
                href="#"
                class="text-gray-300 hover:text-white transition-colors duration-200"
              >
                <svg class="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                  <path
                    d="M22.46 6c-.77.35-1.6.58-2.46.69.88-.53 1.56-1.37 1.88-2.38-.83.5-1.75.85-2.72 1.05C18.37 4.5 17.26 4 16 4c-2.35 0-4.27 1.92-4.27 4.29 0 .34.04.67.11.98C8.28 9.09 5.11 7.38 3 4.79c-.37.63-.58 1.37-.58 2.15 0 1.49.75 2.81 1.91 3.56-.71 0-1.37-.2-1.95-.5v.03c0 2.08 1.48 3.82 3.44 4.21a4.22 4.22 0 0 1-1.93.07 4.28 4.28 0 0 0 4 2.98 8.521 8.521 0 0 1-5.33 1.84c-.34 0-.68-.02-1.02-.06C3.44 20.29 5.7 21 8.12 21 16 21 20.33 14.46 20.33 8.79c0-.19 0-.37-.01-.56.84-.6 1.56-1.36 2.14-2.23z"
                  />
                </svg>
              </a>
              <a
                href="#"
                class="text-gray-300 hover:text-white transition-colors duration-200"
              >
                <svg class="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                  <path
                    d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"
                  />
                </svg>
              </a>
            </div>
          </div>

          <!-- Quick Links -->
          <div>
            <h4 class="text-lg font-semibold mb-4">Quick Links</h4>
            <ul class="space-y-2">
              <li>
                <a
                  href="#"
                  class="text-gray-300 hover:text-white transition-colors duration-200"
                  >Home</a
                >
              </li>
              <li>
                <a
                  href="#"
                  class="text-gray-300 hover:text-white transition-colors duration-200"
                  >About</a
                >
              </li>
              <li>
                <a
                  href="#"
                  class="text-gray-300 hover:text-white transition-colors duration-200"
                  >Services</a
                >
              </li>
              <li>
                <a
                  href="#"
                  class="text-gray-300 hover:text-white transition-colors duration-200"
                  >Contact</a
                >
              </li>
            </ul>
          </div>

          <!-- Support -->
          <div>
            <h4 class="text-lg font-semibold mb-4">Support</h4>
            <ul class="space-y-2">
              <li>
                <a
                  href="#"
                  class="text-gray-300 hover:text-white transition-colors duration-200"
                  >Help Center</a
                >
              </li>
              <li>
                <a
                  href="#"
                  class="text-gray-300 hover:text-white transition-colors duration-200"
                  >Privacy Policy</a
                >
              </li>
              <li>
                <a
                  href="#"
                  class="text-gray-300 hover:text-white transition-colors duration-200"
                  >Terms of Service</a
                >
              </li>
              <li>
                <a
                  href="#"
                  class="text-gray-300 hover:text-white transition-colors duration-200"
                  >FAQ</a
                >
              </li>
            </ul>
          </div>
        </div>

        <!-- Copyright -->
        <div class="border-t border-gray-700 mt-8 pt-8 text-center">
          <p class="text-gray-300">
            &copy; {{ new Date().getFullYear() }} TQ Random. All rights
            reserved.
          </p>
        </div>
      </div>
    </footer>
  </div>
</template>

<style scoped>
/* Additional custom styles if needed */
</style>
