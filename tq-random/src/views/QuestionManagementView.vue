<script setup>
import AppLayout from '@/components/layout/AppLayout.vue'
import QuestionForm from '@/components/dashboard/QuestionForm.vue'
import QuestionList from '@/components/dashboard/QuestionList.vue'
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()

const testId = route.params.testId
const showQuestionForm = ref(false)
const editingQuestion = ref(null)

// Mock test data - replace with actual API call
const test = ref({
  id: testId,
  title: "Mathematics Quiz",
  subject: "Mathematics",
  description: "Basic algebra and geometry questions"
})

// Mock questions data - replace with actual API call
const questions = ref([
  {
    id: 1,
    question: "What is 2 + 2?",
    type: "multiple-choice",
    options: [
      { id: 1, text: "3", isCorrect: false },
      { id: 2, text: "4", isCorrect: true },
      { id: 3, text: "5", isCorrect: false },
      { id: 4, text: "6", isCorrect: false }
    ],
    paraphrases: [
      "What is the sum of 2 and 2?",
      "Calculate 2 plus 2"
    ]
  },
  {
    id: 2,
    question: "What is the capital of France?",
    type: "multiple-choice",
    options: [
      { id: 1, text: "London", isCorrect: false },
      { id: 2, text: "Berlin", isCorrect: false },
      { id: 3, text: "Paris", isCorrect: true },
      { id: 4, text: "Madrid", isCorrect: false }
    ],
    paraphrases: []
  }
])

const openQuestionForm = () => {
  editingQuestion.value = null
  showQuestionForm.value = true
}

const editQuestion = (question) => {
  editingQuestion.value = { ...question }
  showQuestionForm.value = true
}

const closeQuestionForm = () => {
  showQuestionForm.value = false
  editingQuestion.value = null
}

const handleQuestionSaved = (questionData) => {
  if (editingQuestion.value) {
    // Update existing question
    const index = questions.value.findIndex(q => q.id === editingQuestion.value.id)
    if (index !== -1) {
      questions.value[index] = { ...questionData, id: editingQuestion.value.id }
    }
  } else {
    // Add new question
    const newQuestion = {
      ...questionData,
      id: Date.now()
    }
    questions.value.push(newQuestion)
  }
  closeQuestionForm()
}

const handleQuestionDeleted = (questionId) => {
  questions.value = questions.value.filter(q => q.id !== questionId)
}

const goBackToDashboard = () => {
  router.push('/dashboard')
}

onMounted(() => {
  // Load test and questions data here
  console.log('Loading test:', testId)
})
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
                  <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <div>
                  <h1 class="text-2xl font-bold text-gray-900">{{ test.title }}</h1>
                  <p class="mt-1 text-sm text-gray-600">
                    {{ test.subject }} • Manage Questions
                  </p>
                </div>
              </div>
              <button
                @click="openQuestionForm"
                class="bg-blue-600 text-white hover:bg-blue-700 px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200 flex items-center"
              >
                <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Add Question
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Content -->
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <!-- Test Info Card -->
        <div class="bg-white shadow rounded-lg p-6 mb-8">
          <h3 class="text-lg font-medium text-gray-900 mb-2">Test Information</h3>
          <p class="text-gray-600 mb-4">{{ test.description }}</p>
          <div class="flex items-center space-x-6 text-sm text-gray-500">
            <span class="flex items-center">
              <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {{ questions.length }} questions
            </span>
            <span class="flex items-center">
              <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
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

      <!-- Question Form Modal -->
      <QuestionForm
        :is-open="showQuestionForm"
        :editing-question="editingQuestion"
        @close="closeQuestionForm"
        @question-saved="handleQuestionSaved"
      />
    </div>
  </AppLayout>
</template>

<style scoped>
/* Additional styles if needed */
</style> 