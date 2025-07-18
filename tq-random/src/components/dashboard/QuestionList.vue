<script setup>
import { ref } from "vue";

const props = defineProps({
  questions: {
    type: Array,
    required: true,
  },
});

const emit = defineEmits(["edit-question", "delete-question"]);

const showDeleteConfirm = ref(null);

const editQuestion = (question) => {
  emit("edit-question", question);
};

const confirmDelete = (questionId) => {
  showDeleteConfirm.value = questionId;
};

const deleteQuestion = (questionId) => {
  emit("delete-question", questionId);
  showDeleteConfirm.value = null;
};

const cancelDelete = () => {
  showDeleteConfirm.value = null;
};

const getCorrectAnswers = (options) => {
  return options.filter((option) => option.isCorrect);
};
</script>

<template>
  <div class="bg-white shadow overflow-hidden sm:rounded-md">
    <div class="px-4 py-5 sm:px-6">
      <h3 class="text-lg leading-6 font-medium text-gray-900">Questions</h3>
      <p class="mt-1 max-w-2xl text-sm text-gray-500">
        Manage questions for this test
      </p>
    </div>

    <ul class="divide-y divide-gray-200">
      <li
        v-for="(question, index) in questions"
        :key="question.id"
        class="px-4 py-6 sm:px-6"
      >
        <div class="flex items-start justify-between">
          <div class="flex-1 min-w-0">
            <!-- Question Number and Text -->
            <div class="flex items-start">
              <span
                class="flex-shrink-0 inline-flex items-center justify-center h-8 w-8 rounded-full bg-blue-100 text-blue-800 text-sm font-medium mr-3"
              >
                {{ index + 1 }}
              </span>
              <div class="flex-1">
                <h4 class="text-lg font-medium text-gray-900 mb-3">
                  {{ question.question }}
                </h4>

                <!-- Question Type Badge -->
                <span
                  class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 mb-3"
                >
                  {{ question.type }}
                </span>

                <!-- Multiple Choice Options -->
                <div v-if="question.type === 'multiple-choice'" class="mb-4">
                  <h5 class="text-sm font-medium text-gray-700 mb-2">
                    Answer Options:
                  </h5>
                  <div class="space-y-2">
                    <div
                      v-for="option in question.options"
                      :key="option.id"
                      class="flex items-center p-2 rounded border"
                      :class="
                        option.isCorrect
                          ? 'bg-green-50 border-green-200'
                          : 'bg-gray-50 border-gray-200'
                      "
                    >
                      <span
                        class="flex-shrink-0 h-4 w-4 rounded-full mr-3 flex items-center justify-center"
                        :class="
                          option.isCorrect ? 'bg-green-500' : 'bg-gray-300'
                        "
                      >
                        <svg
                          v-if="option.isCorrect"
                          class="h-3 w-3 text-white"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fill-rule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clip-rule="evenodd"
                          />
                        </svg>
                      </span>
                      <span
                        class="text-sm"
                        :class="
                          option.isCorrect
                            ? 'text-green-800 font-medium'
                            : 'text-gray-700'
                        "
                      >
                        {{ option.text }}
                      </span>
                    </div>
                  </div>

                  <!-- Correct Answer Summary -->
                  <div class="mt-3 text-sm text-gray-600">
                    <strong>Correct answer(s):</strong>
                    <span class="text-green-600 font-medium">
                      {{
                        getCorrectAnswers(question.options)
                          .map((opt) => opt.text)
                          .join(", ")
                      }}
                    </span>
                  </div>
                </div>

                <!-- Paraphrases -->
                <div
                  v-if="question.paraphrases && question.paraphrases.length > 0"
                  class="mb-4"
                >
                  <h5 class="text-sm font-medium text-gray-700 mb-2">
                    Question Variants:
                  </h5>
                  <div class="space-y-1">
                    <div
                      v-for="(paraphrase, pIndex) in question.paraphrases"
                      :key="pIndex"
                      class="text-sm text-gray-600 bg-blue-50 p-2 rounded border-l-4 border-blue-200"
                    >
                      • {{ paraphrase }}
                    </div>
                  </div>
                </div>

                <!-- No paraphrases message -->
                <div v-else class="text-sm text-gray-500 italic">
                  No question variants added
                </div>
              </div>
            </div>
          </div>

          <!-- Action Buttons -->
          <div class="flex items-center space-x-2 ml-4">
            <button
              @click="editQuestion(question)"
              class="bg-blue-600 text-white hover:bg-blue-700 px-3 py-1 rounded-md text-sm font-medium transition-colors duration-200"
            >
              Edit
            </button>
            <button
              @click="confirmDelete(question.id)"
              class="bg-red-600 text-white hover:bg-red-700 px-3 py-1 rounded-md text-sm font-medium transition-colors duration-200"
            >
              Delete
            </button>
          </div>
        </div>
      </li>

      <!-- Empty State -->
      <li v-if="questions.length === 0" class="px-4 py-8 sm:px-6 text-center">
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
              d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <h3 class="mt-2 text-sm font-medium text-gray-900">No questions</h3>
          <p class="mt-1 text-sm text-gray-500">
            Get started by adding your first question.
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
        <h3 class="text-lg font-medium text-gray-900 mt-2">Delete Question</h3>
        <p class="mt-2 text-sm text-gray-500">
          Are you sure you want to delete this question? This action cannot be
          undone.
        </p>
        <div class="mt-4 flex justify-center space-x-3">
          <button
            @click="deleteQuestion(showDeleteConfirm)"
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
