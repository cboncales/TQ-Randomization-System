<script setup>
import { ref, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useTestStore } from "@/stores/testStore";
import AppLayout from "@/components/layout/AppLayout.vue";

const route = useRoute();
const router = useRouter();
const testStore = useTestStore();

const testId = route.params.testId;
const isLoading = ref(true);
const isSaving = ref(false);
const errorMessage = ref("");
const successMessage = ref("");

// Form data
const form = ref({
  title: "",
  subject: "",
  description: "",
});

// Original data for comparison
const originalForm = ref({
  title: "",
  subject: "",
  description: "",
});

// Load test data
const loadTest = async () => {
  try {
    isLoading.value = true;
    errorMessage.value = "";

    const result = await testStore.getTest(testId);

    if (result.error) {
      errorMessage.value = result.error;
    } else {
      const test = result.data;

      // Parse subject and description from the combined description field
      const subject = test.description?.split(" - ")[0] || "General";
      const description = test.description?.includes(" - ")
        ? test.description.split(" - ").slice(1).join(" - ")
        : test.description || "";

      form.value = {
        title: test.title,
        subject: subject,
        description: description,
      };

      // Store original values for comparison
      originalForm.value = { ...form.value };
    }
  } catch (error) {
    console.error("Error loading test:", error);
    errorMessage.value = "Failed to load test details. Please try again.";
  } finally {
    isLoading.value = false;
  }
};

// Check if form has changes
const hasChanges = () => {
  return (
    form.value.title !== originalForm.value.title ||
    form.value.subject !== originalForm.value.subject ||
    form.value.description !== originalForm.value.description
  );
};

// Handle form submission
const handleSubmit = async () => {
  if (!hasChanges()) {
    router.push("/dashboard");
    return;
  }

  try {
    isSaving.value = true;
    errorMessage.value = "";
    successMessage.value = "";

    // Validate form
    if (!form.value.title.trim()) {
      errorMessage.value = "Test title is required.";
      return;
    }

    // Combine subject and description like in CreateTestModal
    const combinedDescription =
      form.value.subject.trim() && form.value.description.trim()
        ? `${form.value.subject.trim()} - ${form.value.description.trim()}`
        : form.value.subject.trim() || form.value.description.trim() || null;

    const updates = {
      title: form.value.title.trim(),
      description: combinedDescription,
    };

    const result = await testStore.updateTest(testId, updates);

    if (result.error) {
      errorMessage.value = result.error;
    } else {
      successMessage.value = "Test updated successfully!";

      // Update original form values
      originalForm.value = { ...form.value };

      // Redirect to dashboard after a short delay
      setTimeout(() => {
        router.push("/dashboard");
      }, 1500);
    }
  } catch (error) {
    console.error("Error updating test:", error);
    errorMessage.value = "Failed to update test. Please try again.";
  } finally {
    isSaving.value = false;
  }
};

// Handle cancel
const handleCancel = () => {
  if (hasChanges()) {
    if (confirm("You have unsaved changes. Are you sure you want to leave?")) {
      router.push("/dashboard");
    }
  } else {
    router.push("/dashboard");
  }
};

onMounted(() => {
  loadTest();
});
</script>

<template>
  <AppLayout>
    <div class="min-h-screen bg-gray-50">
      <!-- Header -->
      <div class="bg-white shadow">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="py-6">
            <div class="flex items-center justify-between">
              <div>
                <h1 class="text-2xl font-bold text-gray-900">Edit Test</h1>
                <p class="mt-1 text-sm text-gray-600">
                  Update test details and information
                </p>
              </div>
              <button
                @click="handleCancel"
                class="bg-gray-600 text-white hover:bg-gray-700 px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200"
              >
                Back to Dashboard
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Content -->
      <div class="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <!-- Loading State -->
        <div v-if="isLoading" class="flex items-center justify-center py-12">
          <div class="flex items-center space-x-2">
            <svg
              class="animate-spin h-5 w-5 text-blue-600"
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
            <span class="text-gray-600">Loading test details...</span>
          </div>
        </div>

        <!-- Error Message -->
        <div
          v-if="errorMessage"
          class="bg-red-50 border border-red-200 rounded-lg p-6 mb-8"
        >
          <div class="flex">
            <div class="flex-shrink-0">
              <svg
                class="h-5 w-5 text-red-400"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fill-rule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clip-rule="evenodd"
                />
              </svg>
            </div>
            <div class="ml-3">
              <p class="text-sm text-red-800">{{ errorMessage }}</p>
            </div>
          </div>
        </div>

        <!-- Success Message -->
        <div
          v-if="successMessage"
          class="bg-green-50 border border-green-200 rounded-lg p-6 mb-8"
        >
          <div class="flex">
            <div class="flex-shrink-0">
              <svg
                class="h-5 w-5 text-green-400"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fill-rule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clip-rule="evenodd"
                />
              </svg>
            </div>
            <div class="ml-3">
              <p class="text-sm text-green-800">{{ successMessage }}</p>
            </div>
          </div>
        </div>

        <!-- Edit Form -->
        <div v-if="!isLoading" class="bg-white shadow rounded-lg">
          <form @submit.prevent="handleSubmit" class="space-y-6 p-6">
            <!-- Test Title -->
            <div>
              <label
                for="title"
                class="block text-sm font-medium text-gray-700"
              >
                Test Title *
              </label>
              <input
                id="title"
                v-model="form.title"
                type="text"
                required
                :disabled="isSaving"
                class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                placeholder="Enter test title"
              />
            </div>

            <!-- Subject -->
            <div>
              <label
                for="subject"
                class="block text-sm font-medium text-gray-700"
              >
                Subject
              </label>
              <input
                id="subject"
                v-model="form.subject"
                type="text"
                :disabled="isSaving"
                class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                placeholder="e.g., Mathematics, Science, History"
              />
            </div>

            <!-- Description -->
            <div>
              <label
                for="description"
                class="block text-sm font-medium text-gray-700"
              >
                Description
              </label>
              <textarea
                id="description"
                v-model="form.description"
                rows="4"
                :disabled="isSaving"
                class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                placeholder="Describe what this test covers"
              ></textarea>
            </div>

            <!-- Form Actions -->
            <div
              class="flex items-center justify-end space-x-4 pt-6 border-t border-gray-200"
            >
              <button
                type="button"
                @click="handleCancel"
                :disabled="isSaving"
                class="bg-gray-300 text-gray-700 hover:bg-gray-400 px-6 py-2 rounded-md text-sm font-medium transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
              <button
                type="submit"
                :disabled="isSaving || !hasChanges()"
                class="bg-blue-600 text-white hover:bg-blue-700 px-6 py-2 rounded-md text-sm font-medium transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              >
                <svg
                  v-if="isSaving"
                  class="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
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
                {{
                  isSaving
                    ? "Saving..."
                    : hasChanges()
                    ? "Save Changes"
                    : "No Changes"
                }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </AppLayout>
</template>

<style scoped>
/* Additional styles if needed */
</style>
