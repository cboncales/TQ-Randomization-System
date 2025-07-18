<script setup>
import { ref } from "vue";

const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(["close", "test-created"]);

const title = ref("");
const subject = ref("");
const description = ref("");

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

const handleSubmit = () => {
  if (!title.value.trim() || !subject.value.trim()) {
    return;
  }

  const newTest = {
    title: title.value.trim(),
    subject: subject.value.trim(),
    description: description.value.trim() || "No description provided",
  };

  emit("test-created", newTest);
  resetForm();
};

const resetForm = () => {
  title.value = "";
  subject.value = "";
  description.value = "";
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
            class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
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
            class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
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
            class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
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
            class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
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
            class="bg-gray-300 text-gray-700 hover:bg-gray-400 px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200"
          >
            Cancel
          </button>
          <button
            type="submit"
            class="bg-blue-600 text-white hover:bg-blue-700 px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200 flex items-center"
            :disabled="!title.trim() || !subject.trim()"
            :class="{
              'opacity-50 cursor-not-allowed': !title.trim() || !subject.trim(),
            }"
          >
            <svg
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
            Create Test
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<style scoped>
/* Additional styles if needed */
</style>
