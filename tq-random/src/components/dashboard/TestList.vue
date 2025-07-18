<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";

const props = defineProps({
  tests: {
    type: Array,
    required: true,
  },
});

const emit = defineEmits(["test-deleted"]);

const router = useRouter();
const showDeleteConfirm = ref(null);

const editTest = (testId) => {
  router.push(`/dashboard/test/${testId}/edit`);
};

const manageQuestions = (testId) => {
  router.push(`/dashboard/test/${testId}/questions`);
};

const confirmDelete = (testId) => {
  showDeleteConfirm.value = testId;
};

const deleteTest = (testId) => {
  emit("test-deleted", testId);
  showDeleteConfirm.value = null;
};

const cancelDelete = () => {
  showDeleteConfirm.value = null;
};

const getStatusColor = (status) => {
  return status === "active"
    ? "bg-green-100 text-green-800"
    : "bg-yellow-100 text-yellow-800";
};
</script>

<template>
  <div class="bg-white shadow overflow-hidden sm:rounded-md">
    <div class="px-4 py-5 sm:px-6">
      <h3 class="text-lg leading-6 font-medium text-gray-900">Your Tests</h3>
      <p class="mt-1 max-w-2xl text-sm text-gray-500">
        Manage your test collection and questions
      </p>
    </div>

    <ul class="divide-y divide-gray-200">
      <li v-for="test in tests" :key="test.id" class="px-4 py-4 sm:px-6">
        <div class="flex items-center justify-between">
          <div class="flex-1 min-w-0">
            <div class="flex items-center justify-between">
              <div>
                <h4 class="text-lg font-medium text-gray-900 truncate">
                  {{ test.title }}
                </h4>
                <p class="text-sm text-gray-600">{{ test.subject }}</p>
              </div>
              <div class="flex items-center space-x-2">
                <span
                  :class="[
                    'px-2 inline-flex text-xs leading-5 font-semibold rounded-full',
                    getStatusColor(test.status),
                  ]"
                >
                  {{ test.status }}
                </span>
              </div>
            </div>

            <p class="mt-2 text-sm text-gray-500">
              {{ test.description }}
            </p>

            <div class="mt-2 flex items-center text-sm text-gray-500 space-x-4">
              <span class="flex items-center">
                <svg
                  class="flex-shrink-0 mr-1.5 h-4 w-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                {{ test.questionCount }} questions
              </span>
              <span class="flex items-center">
                <svg
                  class="flex-shrink-0 mr-1.5 h-4 w-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M8 7V3a4 4 0 118 0v4m-4 7h6m-6 0V9a4 4 0 118 0v5"
                  />
                </svg>
                Created {{ test.createdAt }}
              </span>
            </div>
          </div>

          <div class="flex items-center space-x-2">
            <!-- Manage Questions Button -->
            <button
              @click="manageQuestions(test.id)"
              class="bg-purple-600 text-white hover:bg-purple-700 px-3 py-1 rounded-md text-sm font-medium transition-colors duration-200 flex items-center"
            >
              <svg
                class="w-4 h-4 mr-1"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              Questions
            </button>

            <!-- Edit Button -->
            <button
              @click="editTest(test.id)"
              class="bg-blue-600 text-white hover:bg-blue-700 px-3 py-1 rounded-md text-sm font-medium transition-colors duration-200"
            >
              Edit
            </button>

            <!-- Delete Button -->
            <button
              @click="confirmDelete(test.id)"
              class="bg-red-600 text-white hover:bg-red-700 px-3 py-1 rounded-md text-sm font-medium transition-colors duration-200"
            >
              Delete
            </button>
          </div>
        </div>
      </li>

      <li v-if="tests.length === 0" class="px-4 py-8 sm:px-6 text-center">
        <div class="text-gray-500">
          <svg
            class="mx-auto h-12 w-12 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          <h3 class="mt-2 text-sm font-medium text-gray-900">No tests</h3>
          <p class="mt-1 text-sm text-gray-500">
            Get started by creating a new test.
          </p>
        </div>
      </li>
    </ul>
  </div>

  <!-- Delete Confirmation Modal -->
  <div
    v-if="showDeleteConfirm"
    class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50"
    @click="cancelDelete"
  >
    <div
      class="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white"
      @click.stop
    >
      <div class="mt-3 text-center">
        <div
          class="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100"
        >
          <svg
            class="h-6 w-6 text-red-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.084 16.5c-.77.833.192 2.5 1.732 2.5z"
            />
          </svg>
        </div>
        <h3 class="text-lg font-medium text-gray-900 mt-2">Delete Test</h3>
        <p class="mt-2 text-sm text-gray-500">
          Are you sure you want to delete this test? This action cannot be
          undone.
        </p>
        <div class="mt-4 flex justify-center space-x-3">
          <button
            @click="deleteTest(showDeleteConfirm)"
            class="bg-red-600 text-white hover:bg-red-700 px-4 py-2 rounded-md text-sm font-medium"
          >
            Delete
          </button>
          <button
            @click="cancelDelete"
            class="bg-gray-300 text-gray-700 hover:bg-gray-400 px-4 py-2 rounded-md text-sm font-medium"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Additional styles if needed */
</style>
