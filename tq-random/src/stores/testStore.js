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

      // Get existing answer choices for this question
      const { data: existingChoices, error: getChoicesError } = await supabase
        .from("answer_choices")
        .select("id, text")
        .eq("question_id", questionId)
        .order("id", { ascending: true });

      if (getChoicesError) {
        return { error: getChoicesError.message };
      }

      console.log("Existing choices:", existingChoices);
      console.log("New choices:", answerChoices);

      // Smart update: Update existing choices and add/remove as needed
      if (answerChoices && answerChoices.length > 0) {
        // Update existing choices or insert new ones
        for (
          let i = 0;
          i < Math.max(existingChoices.length, answerChoices.length);
          i++
        ) {
          const existingChoice = existingChoices[i];
          const newChoice = answerChoices[i];

          if (existingChoice && newChoice) {
            // Update existing choice if text is different
            if (existingChoice.text.trim() !== newChoice.text.trim()) {
              console.log(
                `Updating choice ${existingChoice.id}: "${
                  existingChoice.text
                }" → "${newChoice.text.trim()}"`
              );
              await supabase
                .from("answer_choices")
                .update({ text: newChoice.text.trim() })
                .eq("id", existingChoice.id);
            }
          } else if (!existingChoice && newChoice) {
            // Insert new choice
            console.log(`Adding new choice: "${newChoice.text.trim()}"`);
            await supabase.from("answer_choices").insert([
              {
                question_id: questionId,
                text: newChoice.text.trim(),
              },
            ]);
          } else if (existingChoice && !newChoice) {
            // Delete existing choice that's no longer needed
            console.log(
              `Deleting choice ${existingChoice.id}: "${existingChoice.text}"`
            );

            // First check if this choice is the correct answer and delete the answer record if so
            await supabase
              .from("answers")
              .delete()
              .eq("question_id", questionId)
              .eq("answer_choices_id", existingChoice.id);

            // Then delete the choice
            await supabase
              .from("answer_choices")
              .delete()
              .eq("id", existingChoice.id);
          }
        }
      } else {
        // No answer choices provided, delete all existing ones
        console.log(
          "No answer choices provided, deleting all existing choices"
        );

        // First delete any answer records for this question
        await supabase.from("answers").delete().eq("question_id", questionId);

        // Then delete all choices
        await supabase
          .from("answer_choices")
          .delete()
          .eq("question_id", questionId);
      }

      return { success: true };
    } catch (error) {
      return { error: error.message };
    }
  }

  // Answer Management Functions

  // Store the correct answer for a question
  async function storeCorrectAnswer(questionId, answerChoiceId) {
    try {
      const authStore = useAuthUserStore();

      if (!authStore.userData?.id) {
        return { error: "User not authenticated" };
      }

      // First verify the question exists
      const { data: questionData, error: questionError } = await supabase
        .from("questions")
        .select("id, test_id")
        .eq("id", questionId)
        .single();

      if (questionError || !questionData) {
        console.error("Question verification error:", questionError);
        return { error: "Question not found" };
      }

      // Verify user owns the test (separate query to avoid complex join)
      const { data: testData, error: testError } = await supabase
        .from("tests")
        .select("id, user_id")
        .eq("id", questionData.test_id)
        .single();

      if (
        testError ||
        !testData ||
        testData.user_id !== authStore.userData.id
      ) {
        console.error("Test verification error:", testError);
        return { error: "Test not found or access denied" };
      }

      // Verify the answer choice belongs to this question
      const { data: choiceData, error: choiceError } = await supabase
        .from("answer_choices")
        .select("id")
        .eq("id", answerChoiceId)
        .eq("question_id", questionId)
        .single();

      if (choiceError || !choiceData) {
        console.error("Answer choice verification error:", choiceError);
        return {
          error: "Answer choice not found or doesn't belong to this question",
        };
      }

      // Try to check if correct answer already exists for this question
      let existingAnswer = null;
      try {
        const { data, error } = await supabase
          .from("answers")
          .select("id")
          .eq("question_id", questionId);

        if (error) {
          console.log("Error checking for existing answer:", error.message);
        } else if (data && data.length > 0) {
          existingAnswer = data[0]; // Take the first one if multiple exist
        }
      } catch (error) {
        // If we can't check (e.g., due to RLS policies), assume no existing answer
        console.log(
          "Could not check for existing answer (likely RLS policy), proceeding with insert"
        );
      }

      let result;
      if (existingAnswer) {
        // Update existing correct answer
        console.log("Updating existing answer:", existingAnswer.id);
        result = await supabase
          .from("answers")
          .update({ answer_choices_id: answerChoiceId })
          .eq("id", existingAnswer.id)
          .select();

        // Handle the array result from update
        if (result.data && result.data.length > 0) {
          result.data = result.data[0];
        }
      } else {
        // Create new correct answer record
        console.log("Creating new answer record");
        result = await supabase
          .from("answers")
          .insert([
            {
              question_id: questionId,
              answer_choices_id: answerChoiceId,
            },
          ])
          .select();

        // Handle the array result from insert
        if (result.data && result.data.length > 0) {
          result.data = result.data[0];
        }
      }

      if (result.error) {
        console.error("Answer storage error:", result.error);
        return { error: result.error.message };
      }

      console.log("Correct answer stored successfully:", result.data);
      return { data: result.data };
    } catch (error) {
      console.error("Unexpected error in storeCorrectAnswer:", error);
      return { error: error.message };
    }
  }

  // Get correct answers for a test
  async function getCorrectAnswersForTest(testId) {
    try {
      const authStore = useAuthUserStore();

      if (!authStore.userData?.id) {
        return { error: "User not authenticated" };
      }

      // Verify user owns the test
      const { data: testData, error: testError } = await supabase
        .from("tests")
        .select("id")
        .eq("id", testId)
        .eq("user_id", authStore.userData.id)
        .single();

      if (testError || !testData) {
        return { error: "Test not found or access denied" };
      }

      const { data, error } = await supabase
        .from("answers")
        .select(
          `
          id,
          question_id,
          answer_choices_id,
          created_at,
          questions!inner(test_id, text),
          answer_choices_data:answer_choices(text)
        `
        )
        .eq("questions.test_id", testId)
        .order("question_id", { ascending: true });

      if (error) {
        return { error: error.message };
      }

      return { data };
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
    // Answer management functions
    storeCorrectAnswer,
    getCorrectAnswersForTest,
  };
});
