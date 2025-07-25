import { defineStore } from "pinia";
import { supabase } from "@/utils/supabase";
import { useAuthUserStore } from "./authUser";

export const useTestStore = defineStore("testStore", () => {
  // Test Management Functions

  // Create a new test
  async function createTest(title, description) {
    try {
      const authStore = useAuthUserStore();

      if (!authStore.userData?.id) {
        return { error: "User not authenticated" };
      }

      const { data, error } = await supabase
        .from("tests")
        .insert([
          {
            user_id: authStore.userData.id,
            title: title.trim(),
            description: description.trim() || null,
          },
        ])
        .select()
        .single();

      if (error) {
        return { error: error.message };
      }

      return { data };
    } catch (error) {
      return { error: error.message };
    }
  }

  // Get user's tests
  async function getUserTests() {
    try {
      const authStore = useAuthUserStore();

      if (!authStore.userData?.id) {
        return { error: "User not authenticated" };
      }

      const { data, error } = await supabase
        .from("tests")
        .select("*")
        .eq("user_id", authStore.userData.id)
        .order("created_at", { ascending: false });

      if (error) {
        return { error: error.message };
      }

      return { data };
    } catch (error) {
      return { error: error.message };
    }
  }

  // Delete a test
  async function deleteTest(testId) {
    try {
      const authStore = useAuthUserStore();

      if (!authStore.userData?.id) {
        return { error: "User not authenticated" };
      }

      const { error } = await supabase
        .from("tests")
        .delete()
        .eq("id", testId)
        .eq("user_id", authStore.userData.id); // Ensure user owns the test

      if (error) {
        return { error: error.message };
      }

      return { success: true };
    } catch (error) {
      return { error: error.message };
    }
  }

  // Update a test
  async function updateTest(testId, updates) {
    try {
      const authStore = useAuthUserStore();

      if (!authStore.userData?.id) {
        return { error: "User not authenticated" };
      }

      const { data, error } = await supabase
        .from("tests")
        .update(updates)
        .eq("id", testId)
        .eq("user_id", authStore.userData.id) // Ensure user owns the test
        .select()
        .single();

      if (error) {
        return { error: error.message };
      }

      return { data };
    } catch (error) {
      return { error: error.message };
    }
  }

  // Question Management Functions

  // Create a new question with answer choices
  async function createQuestion(testId, questionText, answerChoices) {
    try {
      const authStore = useAuthUserStore();

      if (!authStore.userData?.id) {
        return { error: "User not authenticated" };
      }

      // First verify the user owns the test
      const { data: testData, error: testError } = await supabase
        .from("tests")
        .select("id")
        .eq("id", testId)
        .eq("user_id", authStore.userData.id)
        .single();

      if (testError || !testData) {
        return { error: "Test not found or access denied" };
      }

      // Create the question
      const { data: questionData, error: questionError } = await supabase
        .from("questions")
        .insert([
          {
            test_id: testId,
            text: questionText.trim(),
          },
        ])
        .select()
        .single();

      if (questionError) {
        return { error: questionError.message };
      }

      // Create answer choices if provided
      if (answerChoices && answerChoices.length > 0) {
        const choicesData = answerChoices.map((choice) => ({
          question_id: questionData.id,
          text: choice.text.trim(),
        }));

        const { error: choicesError } = await supabase
          .from("answer_choices")
          .insert(choicesData);

        if (choicesError) {
          // If answer choices fail, clean up the question
          await supabase.from("questions").delete().eq("id", questionData.id);
          return { error: choicesError.message };
        }
      }

      return { data: questionData };
    } catch (error) {
      return { error: error.message };
    }
  }

  // Get questions for a test with their answer choices
  async function getTestQuestions(testId) {
    try {
      const authStore = useAuthUserStore();

      if (!authStore.userData?.id) {
        return { error: "User not authenticated" };
      }

      // First verify the user owns the test
      const { data: testData, error: testError } = await supabase
        .from("tests")
        .select("id")
        .eq("id", testId)
        .eq("user_id", authStore.userData.id)
        .single();

      if (testError || !testData) {
        return { error: "Test not found or access denied" };
      }

      // Get questions first
      const { data: questionsData, error: questionsError } = await supabase
        .from("questions")
        .select("*")
        .eq("test_id", testId)
        .order("id", { ascending: true });

      if (questionsError) {
        return { error: questionsError.message };
      }

      // Get answer choices for all questions
      const questionIds = questionsData.map((q) => q.id);
      let answerChoicesData = [];

      if (questionIds.length > 0) {
        const { data: choicesData, error: choicesError } = await supabase
          .from("answer_choices")
          .select("*")
          .in("question_id", questionIds)
          .order("id", { ascending: true });

        if (choicesError) {
          return { error: choicesError.message };
        }

        answerChoicesData = choicesData || [];
      }

      // Combine questions with their answer choices
      const questionsWithChoices = questionsData.map((question) => ({
        ...question,
        answer_choices: answerChoicesData.filter(
          (choice) => choice.question_id === question.id
        ),
      }));

      return { data: questionsWithChoices };
    } catch (error) {
      return { error: error.message };
    }
  }

  // Get a single test (for question management view)
  async function getTest(testId) {
    try {
      const authStore = useAuthUserStore();

      if (!authStore.userData?.id) {
        return { error: "User not authenticated" };
      }

      const { data, error } = await supabase
        .from("tests")
        .select("*")
        .eq("id", testId)
        .eq("user_id", authStore.userData.id)
        .single();

      if (error) {
        return { error: error.message };
      }

      return { data };
    } catch (error) {
      return { error: error.message };
    }
  }

  // Delete a question and its answer choices
  async function deleteQuestion(questionId) {
    try {
      const authStore = useAuthUserStore();

      if (!authStore.userData?.id) {
        return { error: "User not authenticated" };
      }

      // Verify user owns the test that contains this question
      const { data: questionData, error: questionError } = await supabase
        .from("questions")
        .select("test_id, tests!inner(user_id)")
        .eq("id", questionId)
        .single();

      if (
        questionError ||
        !questionData ||
        questionData.tests.user_id !== authStore.userData.id
      ) {
        return { error: "Question not found or access denied" };
      }

      // Delete answer choices first (foreign key constraint)
      await supabase
        .from("answer_choices")
        .delete()
        .eq("question_id", questionId);

      // Delete the question
      const { error } = await supabase
        .from("questions")
        .delete()
        .eq("id", questionId);

      if (error) {
        return { error: error.message };
      }

      return { success: true };
    } catch (error) {
      return { error: error.message };
    }
  }

  // Update a question and its answer choices
  async function updateQuestion(questionId, questionText, answerChoices) {
    try {
      const authStore = useAuthUserStore();

      if (!authStore.userData?.id) {
        return { error: "User not authenticated" };
      }

      // Verify user owns the test that contains this question
      const { data: questionData, error: questionError } = await supabase
        .from("questions")
        .select("test_id, tests!inner(user_id)")
        .eq("id", questionId)
        .single();

      if (
        questionError ||
        !questionData ||
        questionData.tests.user_id !== authStore.userData.id
      ) {
        return { error: "Question not found or access denied" };
      }

      // Update the question text
      const { error: updateError } = await supabase
        .from("questions")
        .update({ text: questionText.trim() })
        .eq("id", questionId);

      if (updateError) {
        return { error: updateError.message };
      }

      // Delete existing answer choices
      await supabase
        .from("answer_choices")
        .delete()
        .eq("question_id", questionId);

      // Insert new answer choices
      if (answerChoices && answerChoices.length > 0) {
        const choicesData = answerChoices.map((choice) => ({
          question_id: questionId,
          text: choice.text.trim(),
        }));

        const { error: choicesError } = await supabase
          .from("answer_choices")
          .insert(choicesData);

        if (choicesError) {
          return { error: choicesError.message };
        }
      }

      return { success: true };
    } catch (error) {
      return { error: error.message };
    }
  }

  return {
    // Test management functions
    createTest,
    getUserTests,
    deleteTest,
    updateTest,
    // Question management functions
    createQuestion,
    getTestQuestions,
    getTest,
    deleteQuestion,
    updateQuestion,
  };
});
