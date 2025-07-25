<script setup>
import AppLayout from "@/components/layout/AppLayout.vue";
import TestList from "@/components/dashboard/TestList.vue";
import CreateTestModal from "@/components/dashboard/CreateTestModal.vue";
import { ref, onMounted } from "vue";
import { useTestStore } from "@/stores/testStore";

const testStore = useTestStore();

const showCreateModal = ref(false);
const tests = ref([]);
const isLoading = ref(true);
const errorMessage = ref("");

const openCreateModal = () => {
  showCreateModal.value = true;
};

const closeCreateModal = () => {
  showCreateModal.value = false;
};

const handleTestCreated = (newTest) => {
  tests.value.unshift({
    ...newTest,
    questionCount: 0, // TODO: Get actual question count
    status: "draft",
  });
  closeCreateModal();
};

const handleTestDeleted = async (testId) => {
  try {
    const result = await testStore.deleteTest(testId);

    if (result.error) {
      alert(`Error deleting test: ${result.error}`);
    } else {
      tests.value = tests.value.filter((test) => test.id !== testId);
    }
  } catch (error) {
    alert("An unexpected error occurred while deleting the test.");
    console.error("Delete test error:", error);
  }
};

const loadTests = async () => {
  try {
    isLoading.value = true;
    errorMessage.value = "";

    const result = await testStore.getUserTests();

    if (result.error) {
      errorMessage.value = result.error;
    } else {
      // Transform the database data to match UI expectations
      tests.value = result.data.map((test) => ({
        ...test,
        subject: test.description?.split(" - ")[0] || "General", // Extract subject from description
        description: test.description?.includes(" - ")
          ? test.description.split(" - ").slice(1).join(" - ")
          : test.description || "",
        questionCount: 0, // TODO: Get actual question count from questions table
        status: "draft", // TODO: Add status field to database or determine from data
        createdAt: new Date(test.created_at).toLocaleDateString(),
      }));
    }
  } catch (error) {
    errorMessage.value = "Failed to load tests. Please try again.";
    console.error("Load tests error:", error);
  } finally {
    isLoading.value = false;
  }
};

onMounted(() => {
  loadTests();
});
</script>

<template>
  <AppLayout>
    <div class="min-h-screen bg-gray-50">
      <!-- Dashboard Header -->
      <div class="bg-white shadow">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="py-6">
            <div class="flex items-center justify-between">
              <div>
                <h1 class="text-2xl font-bold text-gray-900">
                  Test Management Dashboard
                </h1>
                <p class="mt-1 text-sm text-gray-600">
                  Create and manage your randomization tests
                </p>
              </div>
              <button
                @click="openCreateModal"
                class="bg-blue-600 text-white hover:bg-blue-700 px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200 flex items-center"
              >
                <svg
                  class="w-5 h-5 mr-2"
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
                Create New Test
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Dashboard Stats -->
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div class="bg-white overflow-hidden shadow rounded-lg">
            <div class="p-5">
              <div class="flex items-center">
                <div class="flex-shrink-0">
                  <svg
                    class="h-6 w-6 text-blue-600"
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
                </div>
                <div class="ml-5 w-0 flex-1">
                  <dl>
                    <dt class="text-sm font-medium text-gray-500 truncate">
                      Total Tests
                    </dt>
                    <dd class="text-lg font-medium text-gray-900">
                      {{ tests.length }}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div class="bg-white overflow-hidden shadow rounded-lg">
            <div class="p-5">
              <div class="flex items-center">
                <div class="flex-shrink-0">
                  <svg
                    class="h-6 w-6 text-green-600"
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
                <div class="ml-5 w-0 flex-1">
                  <dl>
                    <dt class="text-sm font-medium text-gray-500 truncate">
                      Active Tests
                    </dt>
                    <dd class="text-lg font-medium text-gray-900">
                      {{ tests.filter((t) => t.status === "active").length }}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div class="bg-white overflow-hidden shadow rounded-lg">
            <div class="p-5">
              <div class="flex items-center">
                <div class="flex-shrink-0">
                  <svg
                    class="h-6 w-6 text-yellow-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                    />
                  </svg>
                </div>
                <div class="ml-5 w-0 flex-1">
                  <dl>
                    <dt class="text-sm font-medium text-gray-500 truncate">
                      Draft Tests
                    </dt>
                    <dd class="text-lg font-medium text-gray-900">
                      {{ tests.filter((t) => t.status === "draft").length }}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div class="bg-white overflow-hidden shadow rounded-lg">
            <div class="p-5">
              <div class="flex items-center">
                <div class="flex-shrink-0">
                  <svg
                    class="h-6 w-6 text-purple-600"
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
                </div>
                <div class="ml-5 w-0 flex-1">
                  <dl>
                    <dt class="text-sm font-medium text-gray-500 truncate">
                      Total Questions
                    </dt>
                    <dd class="text-lg font-medium text-gray-900">
                      {{
                        tests.reduce((sum, test) => sum + test.questionCount, 0)
                      }}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
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
              <button
                @click="loadTests"
                class="mt-2 text-sm text-red-600 hover:text-red-500 underline"
              >
                Try again
              </button>
            </div>
          </div>
        </div>

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
            <span class="text-gray-600">Loading your tests...</span>
          </div>
        </div>

        <!-- Test List -->
        <TestList
          v-if="!isLoading"
          :tests="tests"
          @test-deleted="handleTestDeleted"
        />
      </div>

      <!-- Create Test Modal -->
      <CreateTestModal
        :is-open="showCreateModal"
        @close="closeCreateModal"
        @test-created="handleTestCreated"
      />
    </div>
  </AppLayout>
</template>

<style scoped>
/* Additional styles if needed */
</style>
