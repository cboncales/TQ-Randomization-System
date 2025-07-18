<script setup>
import AppLayout from "@/components/layout/AppLayout.vue";
import QuestionForm from "@/components/dashboard/QuestionForm.vue";
import QuestionList from "@/components/dashboard/QuestionList.vue";
import { ref, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useAuthUserStore } from "@/stores/authUser";

const route = useRoute();
const router = useRouter();
const authStore = useAuthUserStore();

const testId = parseInt(route.params.testId);
const showQuestionForm = ref(false);
const editingQuestion = ref(null);
const isLoading = ref(true);
const isSavingQuestion = ref(false);
const errorMessage = ref("");

const test = ref({});
const questions = ref([]);

const openQuestionForm = () => {
  editingQuestion.value = null;
  showQuestionForm.value = true;
};

const editQuestion = (question) => {
  editingQuestion.value = { ...question };
  showQuestionForm.value = true;
};

const closeQuestionForm = () => {
  showQuestionForm.value = false;
  editingQuestion.value = null;
  isSavingQuestion.value = false;
};

const handleQuestionSaved = async (questionData) => {
  isSavingQuestion.value = true;

  try {
    if (editingQuestion.value) {
      // Update existing question
      const result = await authStore.updateQuestion(
        editingQuestion.value.id,
        questionData.question,
        questionData.options.filter((opt) => opt.text.trim())
      );

      if (result.error) {
        alert(`Error updating question: ${result.error}`);
      } else {
        // Reload questions to get fresh data
        await loadQuestions();
        closeQuestionForm();
      }
    } else {
      // Add new question
      const result = await authStore.createQuestion(
        testId,
        questionData.question,
        questionData.options.filter((opt) => opt.text.trim())
      );

      if (result.error) {
        alert(`Error creating question: ${result.error}`);
      } else {
        // Reload questions to get fresh data
        await loadQuestions();
        closeQuestionForm();
      }
    }
  } catch (error) {
    alert("An unexpected error occurred. Please try again.");
    console.error("Question save error:", error);
  } finally {
    isSavingQuestion.value = false;
  }
};

const handleQuestionDeleted = async (questionId) => {
  try {
    const result = await authStore.deleteQuestion(questionId);

    if (result.error) {
      alert(`Error deleting question: ${result.error}`);
    } else {
      questions.value = questions.value.filter((q) => q.id !== questionId);
    }
  } catch (error) {
    alert("An unexpected error occurred while deleting the question.");
    console.error("Delete question error:", error);
  }
};

const loadTest = async () => {
  try {
    const result = await authStore.getTest(testId);

    if (result.error) {
      errorMessage.value = result.error;
      return false;
    }

    // Transform test data for UI
    test.value = {
      ...result.data,
      subject: result.data.description?.split(" - ")[0] || "General",
      description: result.data.description?.includes(" - ")
        ? result.data.description.split(" - ").slice(1).join(" - ")
        : result.data.description || "",
    };

    return true;
  } catch (error) {
    errorMessage.value = "Failed to load test information";
    console.error("Load test error:", error);
    return false;
  }
};

const loadQuestions = async () => {
  try {
    const result = await authStore.getTestQuestions(testId);

    if (result.error) {
      errorMessage.value = result.error;
      return;
    }

    // Transform questions data for UI
    questions.value = result.data.map((question) => ({
      id: question.id,
      question: question.text,
      type: "multiple-choice",
      options: question.answer_choices.map((choice, index) => ({
        id: choice.id,
        text: choice.text,
        isCorrect: false, // Since database doesn't store correct answers, we'll handle this in UI
      })),
      paraphrases: [], // Not implemented in database yet
    }));
  } catch (error) {
    errorMessage.value = "Failed to load questions";
    console.error("Load questions error:", error);
  }
};

const goBackToDashboard = () => {
  router.push("/dashboard");
};

onMounted(async () => {
  isLoading.value = true;
  errorMessage.value = "";

  const testLoaded = await loadTest();
  if (testLoaded) {
    await loadQuestions();
  }

  isLoading.value = false;
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
              <div class="flex items-center">
                <button
                  @click="goBackToDashboard"
                  class="mr-4 text-gray-600 hover:text-gray-900"
                >
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
                      d="M15 19l-7-7 7-7"
                    />
                  </svg>
                </button>
                <div>
                  <h1 class="text-2xl font-bold text-gray-900">
                    {{ test.title }}
                  </h1>
                  <p class="mt-1 text-sm text-gray-600">
                    {{ test.subject }} • Manage Questions
                  </p>
                </div>
              </div>
              <button
                @click="openQuestionForm"
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
                Add Question
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Content -->
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
                @click="goBackToDashboard"
                class="mt-2 text-sm text-red-600 hover:text-red-500 underline"
              >
                Go back to dashboard
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
            <span class="text-gray-600">Loading test and questions...</span>
          </div>
        </div>

        <div v-if="!isLoading && !errorMessage">
          <!-- Test Info Card -->
          <div class="bg-white shadow rounded-lg p-6 mb-8">
            <h3 class="text-lg font-medium text-gray-900 mb-2">
              Test Information
            </h3>
            <p class="text-gray-600 mb-4">{{ test.description }}</p>
            <div class="flex items-center space-x-6 text-sm text-gray-500">
              <span class="flex items-center">
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
                {{ questions.length }} questions
              </span>
              <span class="flex items-center">
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
                    d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                  />
                </svg>
                Subject: {{ test.subject }}
              </span>
            </div>
          </div>

          <!-- Questions List -->
          <QuestionList
            :questions="questions"
            @edit-question="editQuestion"
            @delete-question="handleQuestionDeleted"
          />
        </div>
      </div>

      <!-- Question Form Modal -->
      <QuestionForm
        :is-open="showQuestionForm"
        :editing-question="editingQuestion"
        :is-loading="isSavingQuestion"
        @close="closeQuestionForm"
        @question-saved="handleQuestionSaved"
      />
    </div>
  </AppLayout>
</template>

<style scoped>
/* Additional styles if needed */
</style>
