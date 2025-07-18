<script setup>
import { ref } from "vue";
import { useAuthUserStore } from "@/stores/authUser";

const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(["close", "test-created"]);

const authStore = useAuthUserStore();

const title = ref("");
const subject = ref("");
const description = ref("");
const isLoading = ref(false);
const errorMessage = ref("");

const predefinedSubjects = [
  "Mathematics",
  "Science",
  "English",
  "History",
  "Geography",
  "Physics",
  "Chemistry",
  "Biology",
  "Computer Science",
  "Art",
  "Music",
  "Physical Education",
  "Other",
];

const handleSubmit = async () => {
  if (!title.value.trim() || !subject.value.trim()) {
    errorMessage.value = "Please fill in both title and subject";
    return;
  }

  isLoading.value = true;
  errorMessage.value = "";

  try {
    // Combine subject and description since database doesn't have separate subject field
    const fullDescription =
      subject.value.trim() +
      (description.value.trim() ? ` - ${description.value.trim()}` : "");

    const result = await authStore.createTest(title.value, fullDescription);

    if (result.error) {
      errorMessage.value = result.error;
    } else {
      emit("test-created", {
        ...result.data,
        subject: subject.value.trim(), // Keep subject for UI display
        questionCount: 0,
        status: "draft",
      });
      resetForm();
    }
  } catch (error) {
    errorMessage.value = "An unexpected error occurred. Please try again.";
    console.error("Create test error:", error);
  } finally {
    isLoading.value = false;
  }
};

const resetForm = () => {
  title.value = "";
  subject.value = "";
  description.value = "";
  errorMessage.value = "";
};

const closeModal = () => {
  resetForm();
  emit("close");
};
</script>

<template>
  <!-- Modal backdrop -->
  <div
    v-if="isOpen"
    class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50"
    @click="closeModal"
  >
    <!-- Modal content -->
    <div
      class="relative top-20 mx-auto p-5 border w-full max-w-md shadow-lg rounded-md bg-white"
      @click.stop
    >
      <!-- Close button -->
      <div class="flex justify-between items-center mb-4">
        <h3 class="text-lg font-medium text-gray-900">Create New Test</h3>
        <button @click="closeModal" class="text-gray-400 hover:text-gray-600">
          <svg
            class="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>

      <!-- Error Message -->
      <div
        v-if="errorMessage"
        class="bg-red-50 border border-red-200 rounded-md p-4 mb-4"
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

      <!-- Modal body -->
      <form @submit.prevent="handleSubmit" class="space-y-4">
        <!-- Test Title -->
        <div>
          <label
            for="test-title"
            class="block text-sm font-medium text-gray-700"
          >
            Test Title *
          </label>
          <input
            id="test-title"
            v-model="title"
            type="text"
            required
            :disabled="isLoading"
            class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm disabled:bg-gray-100 disabled:cursor-not-allowed"
            placeholder="Enter test title"
          />
        </div>

        <!-- Subject -->
        <div>
          <label
            for="test-subject"
            class="block text-sm font-medium text-gray-700"
          >
            Subject *
          </label>
          <select
            id="test-subject"
            v-model="subject"
            required
            :disabled="isLoading"
            class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm disabled:bg-gray-100 disabled:cursor-not-allowed"
          >
            <option value="">Select a subject</option>
            <option
              v-for="subj in predefinedSubjects"
              :key="subj"
              :value="subj"
            >
              {{ subj }}
            </option>
          </select>
        </div>

        <!-- Custom Subject Input (if Other is selected) -->
        <div v-if="subject === 'Other'">
          <label
            for="custom-subject"
            class="block text-sm font-medium text-gray-700"
          >
            Custom Subject *
          </label>
          <input
            id="custom-subject"
            v-model="subject"
            type="text"
            required
            :disabled="isLoading"
            class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm disabled:bg-gray-100 disabled:cursor-not-allowed"
            placeholder="Enter custom subject"
          />
        </div>

        <!-- Description -->
        <div>
          <label
            for="test-description"
            class="block text-sm font-medium text-gray-700"
          >
            Description
          </label>
          <textarea
            id="test-description"
            v-model="description"
            rows="3"
            :disabled="isLoading"
            class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm disabled:bg-gray-100 disabled:cursor-not-allowed"
            placeholder="Enter test description (optional)"
          />
          <p class="mt-1 text-xs text-gray-500">
            Provide a brief description of what this test covers
          </p>
        </div>

        <!-- Form Actions -->
        <div class="flex justify-end space-x-3 pt-4">
          <button
            type="button"
            @click="closeModal"
            :disabled="isLoading"
            class="bg-gray-300 text-gray-700 hover:bg-gray-400 px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
          <button
            type="submit"
            class="bg-blue-600 text-white hover:bg-blue-700 px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200 flex items-center"
            :disabled="!title.trim() || !subject.trim() || isLoading"
            :class="{
              'opacity-50 cursor-not-allowed':
                !title.trim() || !subject.trim() || isLoading,
            }"
          >
            <span v-if="isLoading" class="w-4 h-4 mr-2 animate-spin">
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24">
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
            </span>
            <svg
              v-else
              class="w-4 h-4 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M12 6v6m0 0v6m0-6h6m-6 0H6"
              />
            </svg>
            {{ isLoading ? "Creating..." : "Create Test" }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<style scoped>
/* Additional styles if needed */
</style>
