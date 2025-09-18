<script setup>
import AppLayout from "@/components/layout/AppLayout.vue";
import QuestionForm from "@/components/dashboard/QuestionForm.vue";
import QuestionList from "@/components/dashboard/QuestionList.vue";
import { ref, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useTestStore } from "@/stores/testStore";

const route = useRoute();
const router = useRouter();
const testStore = useTestStore();

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

const editQuestion = async (question) => {
  try {
    console.log("Question object:", question);

    // Get the correct answer for this question
    const answersResult = await testStore.getCorrectAnswersForTest(testId);
    let correctAnswerChoiceId = null;

    if (answersResult.data) {
      const questionAnswer = answersResult.data.find(
        (answer) => answer.question_id === question.id
      );
      correctAnswerChoiceId = questionAnswer?.answer_choices_id;
    }

    console.log("Correct answer choice ID:", correctAnswerChoiceId);

    // Check if answer_choices exists, if not, we need to fetch the question with its choices
    let answerChoices = question.answer_choices;

    if (!answerChoices) {
      console.log(
        "No answer_choices in question object, fetching question data..."
      );
      // Get the full question data with answer choices
      const questionsResult = await testStore.getTestQuestions(testId);
      if (questionsResult.data) {
        const fullQuestion = questionsResult.data.find(
          (q) => q.id === question.id
        );
        console.log("Full question from database:", fullQuestion);
        answerChoices = fullQuestion?.answer_choices || [];
        console.log("Fetched answer choices:", answerChoices);

        // If we fetched the full question, use its text for the question field
        if (fullQuestion) {
          question.question = fullQuestion.text;
          console.log(
            "Updated question with text from database:",
            question.question
          );
        }
      }
    }

    // Transform answer_choices to options format with isCorrect flag
    const options = (answerChoices || []).map((choice) => ({
      id: choice.id,
      text: choice.text,
      isCorrect: choice.id === correctAnswerChoiceId,
    }));

    // Create the editing question object in the format expected by QuestionForm
    editingQuestion.value = {
      id: question.id,
      question: question.question || question.text, // Use question.question if available, fallback to question.text
      options: options,
      paraphrases: [], // Add paraphrases support later if needed
    };

    console.log("Editing question prepared:", editingQuestion.value);
    showQuestionForm.value = true;
  } catch (error) {
    console.error("Error preparing question for editing:", error);
    alert("Error loading question data for editing");
  }
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
      const result = await testStore.updateQuestion(
        editingQuestion.value.id,
        questionData.question,
        questionData.options.filter((opt) => opt.text.trim())
      );

      if (result.error) {
        alert(`Error updating question: ${result.error}`);
      } else {
        // Find the correct answer and store it
        const correctOption = questionData.options.find((opt) => opt.isCorrect);
        if (correctOption) {
          // Get the updated question's answer choices to find the correct choice ID
          const questionsResult = await testStore.getTestQuestions(testId);
          if (questionsResult.data) {
            const updatedQuestion = questionsResult.data.find(
              (q) => q.id === editingQuestion.value.id
            );
            if (updatedQuestion && updatedQuestion.answer_choices) {
              const correctChoice = updatedQuestion.answer_choices.find(
                (choice) => choice.text.trim() === correctOption.text.trim()
              );
              if (correctChoice) {
                await testStore.storeCorrectAnswer(
                  editingQuestion.value.id,
                  correctChoice.id
                );
              }
            }
          }
        }

        // Reload questions to get fresh data
        await loadQuestions();
        closeQuestionForm();
      }
    } else {
      // Add new question
      const result = await testStore.createQuestion(
        testId,
        questionData.question,
        questionData.options.filter((opt) => opt.text.trim())
      );

      if (result.error) {
        alert(`Error creating question: ${result.error}`);
      } else {
        // Find the correct answer and store it
        const correctOption = questionData.options.find((opt) => opt.isCorrect);
        console.log("Correct option found:", correctOption);

        if (correctOption && result.data) {
          console.log(
            "Attempting to store correct answer for question ID:",
            result.data.id
          );

          // Get the created question's answer choices to find the correct choice ID
          const questionsResult = await testStore.getTestQuestions(testId);
          console.log("Questions result:", questionsResult);

          if (questionsResult.data) {
            const createdQuestion = questionsResult.data.find(
              (q) => q.id === result.data.id
            );
            console.log("Created question found:", createdQuestion);

            if (createdQuestion && createdQuestion.answer_choices) {
              const correctChoice = createdQuestion.answer_choices.find(
                (choice) => choice.text.trim() === correctOption.text.trim()
              );
              console.log("Correct choice found:", correctChoice);

              if (correctChoice) {
                const answerResult = await testStore.storeCorrectAnswer(
                  result.data.id,
                  correctChoice.id
                );
                console.log("Store correct answer result:", answerResult);
              } else {
                console.warn(
                  "Could not find matching answer choice for correct option"
                );
              }
            } else {
              console.warn("Created question has no answer choices");
            }
          } else {
            console.warn("Could not retrieve created question data");
          }
        } else {
          console.warn("No correct option found or question creation failed");
        }

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
    const result = await testStore.deleteQuestion(questionId);

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
    const result = await testStore.getTest(testId);

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
    const result = await testStore.getTestQuestions(testId);

    if (result.error) {
      errorMessage.value = result.error;
      return;
    }

    // Get correct answers for all questions in this test
    const answersResult = await testStore.getCorrectAnswersForTest(testId);
    const correctAnswers = answersResult.data || [];

    console.log("Loaded correct answers:", correctAnswers);

    // Create a map of question_id to correct answer_choices_id
    const correctAnswerMap = {};
    correctAnswers.forEach((answer) => {
      correctAnswerMap[answer.question_id] = answer.answer_choices_id;
    });

    // Transform questions data for UI with correct answer flags
    questions.value = result.data.map((question) => ({
      id: question.id,
      question: question.text,
      type: "multiple-choice",
      options: question.answer_choices.map((choice) => ({
        id: choice.id,
        text: choice.text,
        isCorrect: correctAnswerMap[question.id] === choice.id,
      })),
      paraphrases: [], // Not implemented in database yet
    }));

    console.log("Questions with correct answers:", questions.value);
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
