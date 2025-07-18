<script setup>
import { ref, watch } from "vue";

const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false,
  },
  editingQuestion: {
    type: Object,
    default: null,
  },
});

const emit = defineEmits(["close", "question-saved"]);

// Form data
const questionText = ref("");
const questionType = ref("multiple-choice");
const options = ref([
  { id: 1, text: "", isCorrect: false },
  { id: 2, text: "", isCorrect: false },
  { id: 3, text: "", isCorrect: false },
  { id: 4, text: "", isCorrect: false },
]);
const paraphrases = ref([]);
const newParaphrase = ref("");

// Watch for editing question changes
watch(
  () => props.editingQuestion,
  (newQuestion) => {
    if (newQuestion) {
      questionText.value = newQuestion.question;
      questionType.value = newQuestion.type;
      options.value = [...newQuestion.options];
      paraphrases.value = [...(newQuestion.paraphrases || [])];
    } else {
      resetForm();
    }
  },
  { immediate: true }
);

const addOption = () => {
  const newId = Math.max(...options.value.map((o) => o.id)) + 1;
  options.value.push({
    id: newId,
    text: "",
    isCorrect: false,
  });
};

const removeOption = (optionId) => {
  if (options.value.length > 2) {
    options.value = options.value.filter((option) => option.id !== optionId);
  }
};

const toggleCorrectAnswer = (optionId) => {
  const option = options.value.find((o) => o.id === optionId);
  if (option) {
    option.isCorrect = !option.isCorrect;
  }
};

const addParaphrase = () => {
  if (newParaphrase.value.trim()) {
    paraphrases.value.push(newParaphrase.value.trim());
    newParaphrase.value = "";
  }
};

const removeParaphrase = (index) => {
  paraphrases.value.splice(index, 1);
};

const handleSubmit = () => {
  // Validation
  if (!questionText.value.trim()) {
    alert("Please enter a question");
    return;
  }

  if (questionType.value === "multiple-choice") {
    const filledOptions = options.value.filter((opt) => opt.text.trim());
    if (filledOptions.length < 2) {
      alert("Please provide at least 2 answer options");
      return;
    }

    const correctAnswers = filledOptions.filter((opt) => opt.isCorrect);
    if (correctAnswers.length === 0) {
      alert("Please mark at least one correct answer");
      return;
    }
  }

  // Prepare question data
  const questionData = {
    question: questionText.value.trim(),
    type: questionType.value,
    options:
      questionType.value === "multiple-choice"
        ? options.value.filter((opt) => opt.text.trim())
        : [],
    paraphrases: [...paraphrases.value],
  };

  emit("question-saved", questionData);
};

const resetForm = () => {
  questionText.value = "";
  questionType.value = "multiple-choice";
  options.value = [
    { id: 1, text: "", isCorrect: false },
    { id: 2, text: "", isCorrect: false },
    { id: 3, text: "", isCorrect: false },
    { id: 4, text: "", isCorrect: false },
  ];
  paraphrases.value = [];
  newParaphrase.value = "";
};

const closeModal = () => {
  emit("close");
};

const hasCorrectAnswer = () => {
  return options.value.some((opt) => opt.isCorrect && opt.text.trim());
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
      class="relative top-10 mx-auto p-5 border w-full max-w-2xl shadow-lg rounded-md bg-white max-h-screen overflow-y-auto"
      @click.stop
    >
      <!-- Header -->
      <div class="flex justify-between items-center mb-6">
        <h3 class="text-lg font-medium text-gray-900">
          {{ editingQuestion ? "Edit Question" : "Add New Question" }}
        </h3>
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

      <!-- Form -->
      <form @submit.prevent="handleSubmit" class="space-y-6">
        <!-- Question Text -->
        <div>
          <label
            for="question-text"
            class="block text-sm font-medium text-gray-700 mb-2"
          >
            Question Text *
          </label>
          <textarea
            id="question-text"
            v-model="questionText"
            rows="3"
            required
            class="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            placeholder="Enter your question here..."
          />
        </div>

        <!-- Question Type -->
        <div>
          <label
            for="question-type"
            class="block text-sm font-medium text-gray-700 mb-2"
          >
            Question Type
          </label>
          <select
            id="question-type"
            v-model="questionType"
            class="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          >
            <option value="multiple-choice">Multiple Choice</option>
            <!-- Add other types later if needed -->
          </select>
        </div>

        <!-- Multiple Choice Options -->
        <div v-if="questionType === 'multiple-choice'">
          <div class="flex justify-between items-center mb-4">
            <h4 class="text-sm font-medium text-gray-700">Answer Options</h4>
            <button
              type="button"
              @click="addOption"
              class="bg-green-600 text-white hover:bg-green-700 px-3 py-1 rounded-md text-sm font-medium transition-colors duration-200 flex items-center"
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
                  d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                />
              </svg>
              Add Option
            </button>
          </div>

          <div class="space-y-3">
            <div
              v-for="(option, index) in options"
              :key="option.id"
              class="flex items-center space-x-3 p-3 border rounded-lg"
              :class="
                option.isCorrect
                  ? 'bg-green-50 border-green-200'
                  : 'bg-gray-50 border-gray-200'
              "
            >
              <!-- Option Letter -->
              <span
                class="flex-shrink-0 h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center text-sm font-medium"
              >
                {{ String.fromCharCode(65 + index) }}
              </span>

              <!-- Option Input -->
              <input
                v-model="option.text"
                type="text"
                class="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                :placeholder="`Option ${String.fromCharCode(65 + index)}`"
              />

              <!-- Correct Answer Checkbox -->
              <label class="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  :checked="option.isCorrect"
                  @change="toggleCorrectAnswer(option.id)"
                  class="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                />
                <span class="ml-2 text-sm text-gray-700">Correct</span>
              </label>

              <!-- Remove Button -->
              <button
                v-if="options.length > 2"
                type="button"
                @click="removeOption(option.id)"
                class="text-red-600 hover:text-red-800"
              >
                <svg
                  class="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
              </button>
            </div>
          </div>

          <!-- Validation Warning -->
          <div v-if="!hasCorrectAnswer()" class="mt-2 text-sm text-red-600">
            ⚠️ Please mark at least one correct answer
          </div>
        </div>

        <!-- Paraphrases Section -->
        <div>
          <div class="flex justify-between items-center mb-4">
            <div>
              <h4 class="text-sm font-medium text-gray-700">
                Question Variants (Optional)
              </h4>
              <p class="text-xs text-gray-500">
                Add alternative ways to phrase this question for randomization
              </p>
            </div>
          </div>

          <!-- Add Paraphrase -->
          <div class="flex space-x-2 mb-4">
            <input
              v-model="newParaphrase"
              type="text"
              class="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              placeholder="Enter a variant of the question..."
              @keyup.enter="addParaphrase"
            />
            <button
              type="button"
              @click="addParaphrase"
              class="bg-blue-600 text-white hover:bg-blue-700 px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200"
              :disabled="!newParaphrase.trim()"
            >
              Add
            </button>
          </div>

          <!-- Paraphrases List -->
          <div v-if="paraphrases.length > 0" class="space-y-2">
            <div
              v-for="(paraphrase, index) in paraphrases"
              :key="index"
              class="flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded-lg"
            >
              <span class="text-sm text-gray-700">{{ paraphrase }}</span>
              <button
                type="button"
                @click="removeParaphrase(index)"
                class="text-red-600 hover:text-red-800 ml-2"
              >
                <svg
                  class="w-4 h-4"
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
          </div>
        </div>

        <!-- Form Actions -->
        <div class="flex justify-end space-x-3 pt-6 border-t">
          <button
            type="button"
            @click="closeModal"
            class="bg-gray-300 text-gray-700 hover:bg-gray-400 px-6 py-2 rounded-md text-sm font-medium transition-colors duration-200"
          >
            Cancel
          </button>
          <button
            type="submit"
            class="bg-blue-600 text-white hover:bg-blue-700 px-6 py-2 rounded-md text-sm font-medium transition-colors duration-200 flex items-center"
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
                d="M5 13l4 4L19 7"
              />
            </svg>
            {{ editingQuestion ? "Update Question" : "Save Question" }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<style scoped>
/* Additional styles if needed */
</style>
