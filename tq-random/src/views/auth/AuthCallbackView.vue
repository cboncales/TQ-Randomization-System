<script setup>
import { onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import { useAuthUserStore } from "@/stores/authUser";
import AppLayout from "@/components/layout/AppLayout.vue";

const router = useRouter();
const authStore = useAuthUserStore();

const isLoading = ref(true);
const errorMessage = ref("");
const successMessage = ref("");

onMounted(async () => {
  try {
    // Check if user is already authenticated after OAuth callback
    const isAuthenticated = await authStore.isAuthenticated();

    if (isAuthenticated) {
      // Get user information to populate store
      await authStore.getUserInformation();

      successMessage.value =
        "Successfully signed in with Google! Redirecting to dashboard...";

      // Redirect to dashboard after a short delay
      setTimeout(() => {
        router.push("/dashboard");
      }, 2000);
    } else {
      errorMessage.value = "Authentication failed. Please try again.";

      // Redirect to login page after a delay
      setTimeout(() => {
        router.push("/login");
      }, 3000);
    }
  } catch (error) {
    console.error("OAuth callback error:", error);
    errorMessage.value = "An unexpected error occurred during authentication.";

    // Redirect to login page after a delay
    setTimeout(() => {
      router.push("/login");
    }, 3000);
  } finally {
    isLoading.value = false;
  }
});
</script>

<template>
  <AppLayout>
    <div
      class="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8"
    >
      <div class="sm:mx-auto sm:w-full sm:max-w-md">
        <div class="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <div class="text-center">
            <!-- Loading State -->
            <div v-if="isLoading" class="space-y-4">
              <div class="flex justify-center">
                <svg
                  class="animate-spin h-8 w-8 text-blue-600"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    class="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    stroke-width="4"
                  ></circle>
                  <path
                    class="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
              </div>
              <h2 class="text-lg font-medium text-gray-900">
                Completing sign in...
              </h2>
              <p class="text-sm text-gray-600">
                Please wait while we process your authentication.
              </p>
            </div>

            <!-- Success State -->
            <div v-else-if="successMessage" class="space-y-4">
              <div class="flex justify-center">
                <svg
                  class="h-8 w-8 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h2 class="text-lg font-medium text-green-900">
                Authentication Successful!
              </h2>
              <p class="text-sm text-green-600">{{ successMessage }}</p>
            </div>

            <!-- Error State -->
            <div v-else-if="errorMessage" class="space-y-4">
              <div class="flex justify-center">
                <svg
                  class="h-8 w-8 text-red-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4.5c-.77-.833-2.694-.833-3.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z"
                  />
                </svg>
              </div>
              <h2 class="text-lg font-medium text-red-900">
                Authentication Failed
              </h2>
              <p class="text-sm text-red-600">{{ errorMessage }}</p>
              <div class="mt-4">
                <button
                  @click="router.push('/login')"
                  class="bg-blue-600 text-white hover:bg-blue-700 px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200"
                >
                  Return to Login
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </AppLayout>
</template>


